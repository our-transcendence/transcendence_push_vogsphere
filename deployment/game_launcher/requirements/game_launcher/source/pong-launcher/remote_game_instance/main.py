#!/usr/bin/env python
import os
import json
import logging
import ssl
from http.cookies import SimpleCookie
from aiohttp import web

import socketio
import sys
from pong import Pong
import jwt

sio = socketio.AsyncServer(
    async_mode='aiohttp',
    cors_allowed_origins="*",
    always_connect=False,
    cors_credentials=True,
)
app = web.Application()
sio.attach(app)
game = Pong(sio)
pub_key: str | None = None
ids: dict | None = None


def filterPlayerDatas(item):
    key, value = item
    return key in {'id', 'login', 'display_name'}


@sio.event
async def connect(sid, environ):
    if 'HTTP_COOKIE' not in environ:
        return False
    cookies = SimpleCookie()
    cookies.load(environ['HTTP_COOKIE'])
    if 'auth_token' not in cookies.keys():
        return False
    token = cookies.get('auth_token')
    try:
        token_content = jwt.decode(token.value, pub_key, algorithms=["RS256"], issuer="OUR_Transcendence")
    except Exception as _:
        return False
    print(token_content, flush=True)
    if 'id' not in token_content.keys():
        print("id not in token", flush=True)
        return False
    if token_content['id'] not in ids.values():
        print("bad id", flush=True)
        return False
    if await game.playerInGame(token_content['id']):
        print("player already in game", flush=True)
        return False
    await sio.save_session(sid, dict(filter(filterPlayerDatas, token_content.items())))
    return "OK"


@sio.on("ready")
async def on_ready(sid):
    print(f"Client {sid} ready")
    player_session = await sio.get_session(sid)
    await game.addPlayer(Pong.Player(sid, player_session["id"]))
    print("", flush=True, end="")


@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")
    await game.disconnect(sid)
    print("", flush=True, end="")


@sio.on("paddle_up")
async def paddle_up(sid, data):
    await game.update_player(sid, data)
    print("", flush=True, end="")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        exit(1)
    with open(os.environ.get("JWT_PUBLIC_KEY_FILE"), "r") as pub_key_file:
        pub_key = pub_key_file.read()
        print(pub_key, flush=True)
    ids = json.loads(sys.argv[2])
    ids["player_1"] = int(ids["player_1"])
    ids["player_2"] = int(ids["player_2"])
    print(ids, flush=True)
    print(ids.values(), flush=True)
    ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    ssl_context.load_cert_chain("/etc/ssl/cert.pem", "/etc/ssl/key.pem")
    web.run_app(app, host='0.0.0.0', port=int(sys.argv[1]), ssl_context=ssl_context)
