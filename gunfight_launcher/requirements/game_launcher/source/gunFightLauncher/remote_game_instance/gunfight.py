import os
import sys
from copy import deepcopy
from threading import Lock

import requests
import socketio

from rect import Rect


def revert_map(gf_map):
    reverted = deepcopy(gf_map)
    for map_data in reverted:
        if 'cacti' in map_data.keys():
            for idx in range(len(map_data['cacti'])):
                map_data['cacti'][idx][0] = 858 - 8 * 1.4 - map_data['cacti'][idx][0]
        if 'trees' in map_data.keys():
            for idx in range(len(map_data['trees'])):
                map_data['trees'][idx][0] = 858 - 16 * 1.4 - map_data['trees'][idx][0]
    return reverted


class Gunfight:
    class Player:
        sid: str | None
        ball_dir: int
        score: int
        player_id: int
        life_points: float
        rect: Rect
        dead: bool
        bullets: int

        def __init__(self, sid: str | None, player_id: int):
            self.sid = sid
            self.player_id = player_id
            self.nickname = None
            self.ball_dir = 0
            self.score = 0
            self.rect = Rect(0, 0, 23, 33)
            self.total_time = 0
            self.life_points = 2.9
            self.dead = False
            self.bullets = 9

        def reduce_life_points(self, value):
            self.life_points -= value
            self.life_points = round(self.life_points, 1)

        def update(self):
            if self.life_points <= 0:
                sys.exit()

        def __eq__(self, other):
            return self.sid == other.sid or self.player_id == other.player_id

        def __str__(self):
            return f"Player {self.player_id}"

    class Bullet:
        rect: Rect
        dir_x: int
        dir_y: int
        speed_x: int
        speed_y: int
        size: int
        uid: int

        def __init__(self, pos_x, pos_y, size: int, dir_x: int, uid: int):
            self.rect = Rect(pos_x - size / 2, pos_y - size / 2, size, size)
            self.dir_x = dir_x
            self.speed_x = 17
            self.size = size
            self.uid = uid

        def update(self, players, gf_map, trailer_rect):
            check_rect = Rect(self.rect.x, self.rect.y, self.speed_x, self.rect.height)
            self.rect.x += self.dir_x * self.speed_x
            for player in players:
                if self.rect.collide(player.rect):
                    player.life_points = int(player.life_points) - 0.1
                    player.dead = True
                    return True
            if 'cacti' in gf_map.keys():
                for cactus in gf_map['cacti']:
                    if check_rect.collide(Rect(cactus[0], cactus[1], 8 * 1.4, 22 * 1.4)):
                        return True
            if 'trees' in gf_map.keys():
                for tree in gf_map['trees']:
                    if check_rect.collide(Rect(tree[0], tree[1], 16 * 1.4, 27 * 1.4)):
                        return True
            if 'trailer' in gf_map.keys():
                if gf_map['trailer']:
                    if check_rect.collide(trailer_rect):
                        return True
            return self.rect.x < 0 or self.rect.y > 858

        def get_dir(self):
            return self.dir_x, self.dir_y

    players: list[Player]
    ended: bool
    sio: socketio.Server
    bullets: list[Bullet]
    ids: dict
    bullet_uid: int
    started: bool
    bullet_lock: Lock
    inter_key: str | None
    current_map: int
    trailerRect: Rect
    trailerDir: int

    def __init__(self, sio, ids, gf_map):
        self.players = []
        self.ended = False
        self.sio: socketio.AsyncServer = sio
        self.ball = None
        self.bullets = []
        self.ids = ids
        self.bullet_uid = 0
        self.bullet_lock = Lock()
        self.started = False
        self.inter_key = os.getenv("INTER_SERVICE_KEY", None)
        self.gf_map = gf_map
        self.current_map = 0
        self.trailerRect = Rect(417, 50, 24 * 1.4, 28 * 1.4)
        self.trailerDir = -1
        self.sio.start_background_task(self.auto_start)

    async def addPlayer(self, player):
        if player.player_id == self.ids["player_2"]:
            if player.sid:
                await self.send("maps", revert_map(self.gf_map), to=player.sid)
        else:
            if player.sid:
                await self.send("maps", self.gf_map, to=player.sid)
        if player.sid:
            await self.send("map_update", self.current_map, to=player.sid)
            for bullet in self.bullets:
                if player.player_id == self.ids["player_1"]:
                    await self.send("shoot",
                                    {"x": bullet.rect.x, "y": bullet.rect.y, "dir": bullet.dir_x,
                                     "uid": self.bullet_uid},
                                    to=player.sid)
                else:
                    await self.send("shoot",
                                    {"x": 858 - 2 - bullet.rect.x, "y": bullet.rect.y, "dir": bullet.dir_x * -1,
                                     "uid": self.bullet_uid},
                                    to=player.sid)
        if player not in self.players:
            self.players.append(player)
        else:
            idx = self.players.index(player)
            self.players[idx].sid = player.sid
        if self.started:
            if player.sid:
                await self.send(
                    "in_game",
                    await self.get_sids(),
                    to=player.sid
                )
                for source in self.players:
                    await self.send("bullets_update", {"bullets": source.bullets, "sid": source.sid}, to=player.sid)
                    if player.sid:
                        if player.player_id == self.ids["player_2"]:
                            await self.send("pos_up", {"pos": [858 - 23 - source.rect.x, source.rect.y], "sid": source.sid},
                                            player.sid)
                        else:
                            await self.send("pos_up",
                                            {"pos": [source.rect.x, source.rect.y], "sid": source.sid},
                                            player.sid)
        if len(self.players) == 2 and not self.started:
            self.started = True
            self.sio.start_background_task(self.run)

    async def auto_start(self):
        await self.sio.sleep(10)
        if len(self.players) == 0:
            self.players.append(Gunfight.Player(None, self.ids["player_1"]))
        if not self.started:
            other_id = self.ids["player_1"]
            if self.players[0].player_id == other_id:
                other_id = self.ids["player_2"]
            if len(self.players) == 1:
                self.players.append(Gunfight.Player(None, other_id))
            self.started = True
            self.sio.start_background_task(self.run)

    async def get_sids(self):
        return [(await self.sio.get_session(player.sid)) | {'sid': player.sid} for player in self.players if
                player.sid is not None]

    async def playerInGame(self, player_id):
        for player in self.players:
            if player.sid is None:
                continue
            if (await self.sio.get_session(player.sid))['id'] == player_id:
                return True
        return False

    async def refill_bullets(self):
        for player in self.players:
            player.bullets = 9
            await self.send("bullets_update", {"bullets": player.bullets, "sid": player.sid})

    def getPlayerBySID(self, sid):
        for player in self.players:
            if player.sid == sid:
                return player

    async def send_report(self):
        if self.inter_key:
            winner: Gunfight.Player
            looser: Gunfight.Player
            winner, looser = self.players
            if winner.life_points < looser.life_points:
                winner, looser = looser, winner

            requests.post(
                url="https://history-nginx:4343/matches/register",
                headers={
                    'Authorization': self.inter_key,
                    'Content-Type': 'application/json'
                },
                json={
                    "player_1_id": winner.player_id,
                    "player_2_id": looser.player_id,
                    "player_1_score": 1,
                    "player_2_score": 0,
                    "match_type": "gunfight"
                },
                verify=False
            )
            requests.post(
                url="https://stats-nginx:5151/stats/update",
                headers={
                    'Authorization': self.inter_key,
                    'Content-Type': 'application/json'
                },
                json={
                    "winner_id": winner.player_id,
                    "looser_id": looser.player_id,
                    "game_type": "gunfight"
                },
                verify=False
            )

    async def give_up(self, sid):
        idx = self.players.index(self.Player(sid, -1))
        self.players[idx].sid = None

    async def send(self, event, data=None, to=None):
        await self.sio.emit(event, data=data, to=to)

    async def run(self):
        self.players[0].ball_dir = 1
        self.players[1].ball_dir = 1
        if self.players[0].player_id == self.ids["player_2"]:
            self.players[0].rect.x = 858 - 10 - 20
            self.players[0].ball_dir = -1
        else:
            self.players[1].rect.x = 858 - 10 - 20
            self.players[1].ball_dir = -1
        await self.send(
            "in_game",
            await self.get_sids()
        )

        self.sio.start_background_task(self.lifeInterval)
        while not self.ended:
            await self.update()
            await self.sio.sleep(1 / 60)

    async def lifeInterval(self):
        while not self.ended:
            for player in self.players:
                player.reduce_life_points(0.1)
                await self.send("lp_update", {"lp": player.life_points, "sid": player.sid})
                if player.life_points == int(player.life_points):
                    await self.send("die", {"sid": player.sid})
                    await self.refill_bullets()
                    self.current_map += 1
                    self.current_map %= len(self.gf_map)
                    await self.send("map_update", self.current_map)
                if player.life_points <= 0:
                    return
            await self.sio.sleep(1)

    async def update_player(self, sid, data):
        await self.update_pos(sid, data['pos'], None)

    async def update_pos(self, sid, pos, to):
        target = self.players[0]
        other = self.players[1]
        if target.sid != sid:
            target = self.players[1]
            other = self.players[0]
        target.rect.y = pos[1]
        if target.player_id == self.ids["player_2"]:
            target.rect.x = 858 - 23 - pos[0]
        else:
            target.rect.x = pos[0]
        if other.sid and (to is None or to == other.sid):
            if target.player_id == self.ids["player_2"]:
                await self.send("pos_up", {"pos": [target.rect.x, target.rect.y], "sid": target.sid},
                                other.sid)
            else:
                await self.send("pos_up", {"pos": [858 - 23 - target.rect.x, target.rect.y], "sid": target.sid},
                                other.sid)
        if target.sid and (to is None or to == target.sid):
            if target.player_id == self.ids["player_2"]:
                await self.send("pos_up", {"pos": [858 - 23 - target.rect.x, target.rect.y], "sid": target.sid}, target.sid)
            else:
                await self.send("pos_up", {"pos": [target.rect.x, target.rect.y], "sid": target.sid}, target.sid)

    async def shoot(self, sid, data):
        if not self.started:
            return
        target = self.players[0]
        other = self.players[1]
        if target.sid != sid:
            target = self.players[1]
            other = self.players[0]
        if target.bullets <= 0:
            return
        self.bullet_lock.acquire()
        if target.player_id == self.ids["player_1"]:
            self.bullets.append(self.Bullet(data['x'], data['y'], 2, 1, self.bullet_uid))
        else:
            self.bullets.append(self.Bullet(858 - 2 - data['x'], data['y'], 2, -1, self.bullet_uid))
        if target.sid:
            await self.send("shoot", {"x": data['x'], "y": data['y'], "dir": 1, "uid": self.bullet_uid}, target.sid)
        if other.sid:
            await self.send("shoot", {"x": 858 - 2 - data['x'], "y": data['y'], "dir": -1, "uid": self.bullet_uid},
                            other.sid)
        self.bullet_uid += 1
        target.life_points = int(target.life_points) + 1 - 0.1
        if target.sid:
            await self.send("lp_update", {"lp": target.life_points, "sid": target.sid})
        target.bullets -= 1
        if target.sid:
            await self.send("bullets_update", {"bullets": target.bullets, "sid": target.sid})
        self.bullet_lock.release()

    async def disconnect(self):
        for player in self.players:
            await self.sio.disconnect(player.sid)

    async def update(self):
        await self.update_bullets()
        for player in self.players:
            if player.dead:
                await self.send("lp_update", {"lp": player.life_points, "sid": player.sid})
                await self.send("die", {"sid": player.sid})
                await self.refill_bullets()
                self.current_map += 1
                self.current_map %= len(self.gf_map)
                await self.send("map_update", self.current_map)
                player.dead = False
            if player.life_points <= 0:
                target = self.players[0]
                if target.sid == player.sid:
                    target = self.players[1]
                if target.sid:
                    target_session = await self.sio.get_session(target.sid)
                    await self.send("end", {"winner": target_session["display_name"]})
                else:
                    await self.send("end", {"winner": "other"})
                for source in self.players:
                    await self.sio.disconnect(source.sid)
                await self.send_report()
                await self.sio.shutdown()
                sys.exit()
            if 'trailer' in self.gf_map[self.current_map].keys():
                await self.update_trailer()

    async def update_trailer(self):
        if self.trailerRect.y <= 0:
            self.trailerDir = 1
        if self.trailerRect.y + self.trailerRect.height >= 525:
            self.trailerDir = -1
        self.trailerRect.y += self.trailerDir
        await self.send("trailer_update", [self.trailerRect.x, self.trailerRect.y])

    async def update_bullets(self):
        for bullet in self.bullets:
            if bullet.update(self.players, self.gf_map[self.current_map], self.trailerRect):
                await self.send("destroy_bullet", {"uid": bullet.uid})
                self.bullets.remove(bullet)
