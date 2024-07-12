from http.cookies import SimpleCookie

import redis_lock
import jwt
import requests
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.core.cache import cache

from stats.models import PongStats, GunFightStats
from statsService import settings


class MatchmakingConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.id: int | None = None
        self.entry: None | dict = None
        redis_client = cache._cache.get_client(None)
        self.up_lock = redis_lock.Lock(redis_client, "update_lock")

    async def connect(self):
        print("WS CONNNECT", flush=True)
        i = 0
        while i < len(self.scope['headers']) and self.scope['headers'][i][0].decode() != "cookie":
            i += 1
        if i >= len(self.scope['headers']):
            await self.close(reason="no cookies")
            print("closed no cookies", flush=True)
            return
        cookies = SimpleCookie()
        cookies.load(self.scope['headers'][i][1].decode())
        for name, content in cookies.items():
            print(f"{name}: {content.value}", flush=True)
            if name == "auth_token":
                token = jwt.decode(content.value, settings.PUB_KEY, algorithms=["RS256"], issuer="OUR_Transcendence")
                self.username = token['login']
                self.id = token['id']
        if self.id is None:
            print("NONE", flush=True)
            await self.close(1002)
        print(f"try lock: {self.id}", flush=True)
        if self.up_lock.acquire(blocking=True):
            print(f"locked : {self.id}", flush=True)
            players: list = cache.get("players", default=[])
            if self.id in players:
                self.up_lock.release()
                await self.close(code=1002, reason='already in queue')
                return
            self.up_lock.release()
            print(f"released: {self.id}", flush=True)
            await self.channel_layer.group_add(str(self.id), self.channel_name)
            await self.accept()
            return
        await self.close(code=1002, reason='lock error')

    async def disconnect(self, code):
        if cache.get(self.id):
            if self.up_lock.acquire(blocking=True):
                self.delete_search(self.id)
                self.up_lock.release()

    async def receive_json(self, content, **kwargs):
        if set(content.keys()) != {'game'}:
            await self.close(code=1003, reason="invalid data sent")
            return
        if content['game'] not in ['pong', 'gunfight']:
            await self.close(code=1003, reason="invalid data sent")
            return
        if self.up_lock.acquire(blocking=True):
            players: list = cache.get("players", default=[])
            players.append(self.id)
            cache.set("players", players)
            current_player = await self.get_stats(content['game'], self.id)
            await self.create_entry(content['game'], current_player.elo)
            self.up_lock.release()
        print(cache._cache.get_client().keys("*"))
        await self.update()

    @database_sync_to_async
    def get_opponent(self, search):
        return search.opponent

    @database_sync_to_async
    def get_gameAddr(self, search):
        return search.gameAddr

    @database_sync_to_async
    def get_gamePort(self, search):
        return search.gamePort

    async def create_entry(self, game: str, elo: int):
        self.entry = {"game": game, "elo": elo, "tolerance": 200}
        cache.set(self.id, self.entry)

    async def inc_tolerance(self, value: int):
        if self.entry is None:
            return
        self.entry["tolerance"] += value
        cache.set(self.id, self.entry)

    def delete_search(self, player_id):
        players: list = cache.get("players")
        if player_id in players:
            players.remove(player_id)
            cache.delete(player_id)
        cache.set("players", players)

    @database_sync_to_async
    def get_stats(self, game: str, player_id: int):
        if game == 'gunfight':
            try:
                stats = GunFightStats.objects.get(player=player_id)
            except Exception:
                return None
        elif game == "pong":
            try:
                stats = PongStats.objects.get(player=player_id)
            except Exception:
                return None
        else:
            return None
        return stats

    async def found(self, content):
        await self.send_json({
            "gamePort": content["gamePort"]
        }, close=True)


    async def update(self):
        if self.up_lock.acquire():
            if cache.get(self.id) is None:
                self.up_lock.release()
                return
            players = cache.get("players", [])
            print(players)
            for player in players:
                if player == self.id:
                    continue
                entry = cache.get(player)
                if not entry:
                    continue
                if entry["game"] == self.entry["game"] and \
                        self.entry["elo"] - self.entry["tolerance"] <= entry["elo"] + entry["tolerance"] and \
                        entry["elo"] - entry["tolerance"] <= self.entry["elo"] + self.entry["tolerance"]:
                    response = requests.post(
                        "https://game-provider-nginx:5252/create/",
                        json={"game": entry["game"], "player_1": self.id,
                              "player_2": player},
                        verify=False
                    )
                    gamePort: int = 0
                    if response.status_code == 200:
                        data: dict = response.json()
                        if set(data.keys()) == {"port", "hostname"}:
                            gamePort = data['port']
                    await self.channel_layer.group_send(str(player), {
                        "type": "found",
                        "gamePort": gamePort
                    })
                    await self.channel_layer.group_send(str(self.id), {
                        "type": "found",
                        "gamePort": gamePort
                    })
                    self.delete_search(self.id)
                    self.delete_search(player)
                    self.up_lock.release()
                    return
                print(entry)
            self.up_lock.release()
