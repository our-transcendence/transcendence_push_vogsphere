import os
import sys
import time
from random import random

import requests
import socketio

from rect import Rect


class Pong:
    class Player:
        sid: str | None
        ball_dir: int
        score: int
        rect: Rect
        player_id: int

        def __init__(self, sid, player_id):
            self.sid = sid
            self.nickname = None
            self.ball_dir = 0
            self.score = 0
            self.rect = Rect(20, 0, 10, 100)
            self.player_id = player_id
            # Pong.Player.players[sid] = self
            # Pong.games[-1].addPlayer(self)

        def update(self, ball):
            if ball.rect.collide(self.rect):
                diff = self.rect.get_center()["y"] - ball.rect.get_center()["y"]
                ball.speed_y = abs(diff * 0.075)
                ball.speed_x += 0.5
                ball.dir_y = -1 if diff > 0 else 1
                ball.dir_x = self.ball_dir

        def __eq__(self, other):
            return self.sid == other.sid or self.player_id == other.player_id

        def __str__(self):
            return f"Player {self.sid}"

    class Ball:
        rect: Rect
        dir_x: int
        dir_y: int
        speed_x: float
        speed_y: float
        size: int

        def __init__(self, pos_x, pos_y, size, dir):
            self.rect = Rect(pos_x - size / 2, pos_y - size / 2, size, size)
            self.dir_x = dir
            self.dir_y = 1
            self.speed_x = 5
            self.speed_y = random() * 10 - 5
            self.size = size

        def update(self):
            if self.speed_x < 0:
                self.speed_x *= -1
                self.dir_x *= -1
            if self.speed_y < 0:
                self.speed_y *= -1
                self.dir_y *= -1

            self.rect.x += self.dir_x * self.speed_x
            if self.rect.y + self.size > 525:
                self.dir_y = -1
            if self.rect.y < 0:
                self.dir_y = 1
            self.rect.y += self.dir_y * self.speed_y

        def get_dir(self):
            return self.dir_x, self.dir_y

    players: list[Player]
    ended: bool
    sio: socketio.Server
    ball: Ball | None
    started: bool
    inter_key: str | None

    def __init__(self, sio, ids):
        self.players = []
        self.ended = False
        self.sio: socketio.AsyncServer = sio
        self.ball = None
        self.started = False
        self.inter_key = os.getenv("INTER_SERVICE_KEY", None)
        self.ids = ids

    async def spawn_ball(self, start_dir):
        self.ball = Pong.Ball(858 / 2 - 15 / 2, 525 / 2 - 15 / 2, 15, start_dir)
        await self.send(
            "spawn_ball",
            {'x': self.ball.rect.x, 'y': self.ball.rect.y, 'size': 15}
        )

    async def addPlayer(self, player):
        if self.ended:
            return
        if player not in self.players:
            self.players.append(player)
        else:
            idx = self.players.index(player)
            self.players[idx].sid = player.sid
        if self.started:
            await self.send(
                event="in_game",
                data=await self.get_sids()
            )
            if player.sid:
                await self.send(
                    event="spawn_ball",
                    data={'x': self.ball.rect.x, 'y': self.ball.rect.y, 'size': 15},
                    to=player.sid
                )
                await self.send(
                    event="score_up",
                    data={player.sid: player.score for player in self.players},
                    to=player.sid
                )
                for source in self.players:
                    await self.send("pos_up", {"pos": source.rect.y, "sid": source.sid}, player.sid)
        if len(self.players) == 1:
            self.sio.start_background_task(self.auto_start)
        if len(self.players) == 2 and not self.started:
            self.started = True
            self.sio.start_background_task(self.run)

    async def auto_start(self):
        await self.sio.sleep(10)
        if not self.started:
            other_id = self.ids["player_1"]
            if self.players[0].player_id == other_id:
                other_id = self.ids["player_2"]
            self.players.append(Pong.Player(None, other_id))
            self.started = True
            self.sio.start_background_task(self.run)

    async def get_sids(self):
        return [(await self.sio.get_session(player.sid)) | {'sid': player.sid} for player in self.players if
                player.sid is not None]

    async def playerInGame(self, player_id):
        for player in self.players:
            if player.sid:
                if (await self.sio.get_session(player.sid))['id'] == player_id:
                    return True
        return False

    def getPlayerBySID(self, sid):
        for player in self.players:
            if player.sid == sid:
                return player

    async def disconnect(self, sid):
        idx = self.players.index(self.Player(sid, -1))
        self.players[idx].sid = None

    async def send(self, event, data=None, to=None):
        await self.sio.emit(event, data=data, to=to)

    async def run(self):
        self.started = True
        self.players[0].ball_dir = 1
        self.players[1].ball_dir = -1
        self.players[1].rect.x = 858 - 10 - 20
        await self.send(
            "in_game",
            await self.get_sids()
        )
        await self.spawn_ball(1)

        while not self.ended:
            await self.update()
            time.sleep(1 / 60)

    async def update_player(self, sid, data):
        target = self.players[0]
        other = self.players[1]
        if target.sid != sid:
            target = self.players[1]
            other = self.players[0]
        target.rect.y = data['pos']
        if other.sid:
            await self.send("pos_up", {"pos": target.rect.y, "sid": target.sid}, other.sid)

    async def send_report(self):
        if self.inter_key:
            requests.post(
                url="https://history-nginx:4343/matches/register",
                headers={
                    'Authorization': self.inter_key,
                    'Content-Type': 'application/json'
                },
                json={
                    "player_1_id": self.players[0].player_id,
                    "player_2_id": self.players[1].player_id,
                    "player_1_score": self.players[0].score,
                    "player_2_score": self.players[1].score,
                    "match_type": "pong"
                },
                verify=False
            )
            winner: Pong.Player
            looser: Pong.Player
            winner, looser = self.players
            if winner.score < looser.score:
                winner, looser = looser, winner
            requests.post(
                url="https://stats-nginx:5151/stats/update",
                headers={
                    'Authorization': self.inter_key,
                    'Content-Type': 'application/json'
                },
                json={
                    "winner_id": winner.player_id,
                    "looser_id": looser.player_id,
                    "game_type": "pong"
                },
                verify=False
            )

    async def stop(self):
        for player in self.players:
            await self.sio.disconnect(player.sid)
        await self.sio.shutdown()
        sys.exit()


    async def update(self):
        for player in self.players:
            player.update(self.ball)
        self.ball.update()
        if self.ball.rect.x < 0:
            self.players[1].score += 1
            if self.players[1].score >= 5:
                await self.send("game_end", {player.sid: player.score for player in self.players})
                await self.send_report()
                self.ended = True
                await self.stop()
            await self.sio.emit("score_up", {player.sid: player.score for player in self.players})
            await self.spawn_ball(1)
        if self.ball.rect.x > 858:
            self.players[0].score += 1
            if self.players[0].score >= 5:
                await self.send("game_end", {player.sid: player.score for player in self.players})
                await self.send_report()
                self.ended = True
                await self.stop()
            await self.sio.emit("score_up", {player.sid: player.score for player in self.players})
            await self.spawn_ball(-1)
        if self.players[0].sid:
            await self.send(
                "ball_up",
                {"pos": {"x": self.ball.rect.x, "y": self.ball.rect.y}},
                self.players[0].sid)
            await self.send(
                "ball_dir_up",
                {"x": self.ball.dir_x * self.ball.speed_x, "y": self.ball.dir_y * self.ball.speed_y},
                self.players[0].sid)
        if self.players[1].sid:
            await self.send(
                "ball_up",
                {"pos": {"x": 858 - self.ball.rect.x - self.ball.size, "y": self.ball.rect.y}},
                self.players[1].sid)
            await self.send(
                "ball_dir_up",
                {"x": self.ball.dir_x * self.ball.speed_x * -1, "y": self.ball.dir_y * self.ball.speed_y},
                self.players[1].sid)
