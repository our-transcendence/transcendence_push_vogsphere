import json
from http.cookies import SimpleCookie

from django.shortcuts import get_object_or_404

from user.models import User
from userService import settings
import jwt
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.core.cache import cache
import redis_lock
from channels.db import database_sync_to_async
import asyncio
import time


class FriendsConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.id = None
        self.username = None
        redis_client = cache._cache.get_client(None)
        self.lock = redis_lock.Lock(redis_client, str(self.id) + "_lock")

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
        await self.accept()
        print("accepted", flush=True)
        await self.channel_layer.group_add(str(self.id), self.channel_name)
        friends_ids: list[int] | None = await self.get_friends()
        if friends_ids is not None:
            for user_id in friends_ids:
                await self.channel_layer.group_add(str(user_id), self.channel_name)
        print("Try to lock in connect", flush=True)
        if self.lock.acquire(blocking=True):
            print("Has locked in connect", flush=True)
            current = cache.get(self.id)
            print(f"value: {current}", flush=True)
            if current is None:
                current = 0
            current = int(current)
            if current == 0:
                await self.channel_layer.group_send(str(self.id), {
                    "type": "status",
                    "message": "connected",
                    "from": self.id
                })
            current += 1
            cache.set(self.id, current)
            self.lock.release()
            print("Lock released  in connect", flush=True)

    async def disconnect(self, code):
        await asyncio.sleep(2)
        print("trying to lock in disconnect", flush=True)
        if self.lock.acquire(blocking=True):
            print("Has locked in disconnect", flush=True)
            current = cache.get(self.id)
            if current is None:
                current = 0
            current = int(current)
            if current > 0:
                current -= 1
            if current == 0:
                await self.channel_layer.group_send(str(self.id), {
                    "type": "status",
                    "message": "disconnected",
                    "from": self.id
                })
                await self.channel_layer.group_discard(str(self.id), self.channel_name)
                friends_ids: list[int] | None = await self.get_friends()
                if friends_ids is not None:
                    for user_id in friends_ids:
                        await self.channel_layer.group_discard(str(user_id), self.channel_name)
            cache.set(self.id, current)
            self.lock.release()
            print("Lock released in disconnect", flush=True)

    async def get_other_id(self, ids):
        other_id = ids[0]
        if other_id == self.id:
            other_id = ids[1]
        return other_id

    async def add_friend(self, event):
        if self.id not in event["ids"]:
            return
        print(event, flush=True)
        print(event["ids"])
        other_id = await self.get_other_id(event["ids"])
        await self.channel_layer.group_add(str(other_id), self.channel_name)
        await self.send_json({
            "action": "add_friend",
            "id": other_id
        })

    async def delete_friend(self, event):
        if self.id not in event["ids"]:
            return
        print(event, flush=True)
        print(event["ids"])
        other_id = await self.get_other_id(event["ids"])
        await self.channel_layer.group_discard(str(other_id), self.channel_name)
        await self.send_json({
            "action": "delete_friend",
            "id": other_id
        })

    async def status(self, event):
        print(event, flush=True)
        if event["from"] == self.id:
            pass
        await self.send(json.dumps({
            "status": event["message"],
            "from": event["from"]
        }))

    @database_sync_to_async
    def get_friends(self) -> list[int] | None:
        return User.get_friends_ids(self.id)
