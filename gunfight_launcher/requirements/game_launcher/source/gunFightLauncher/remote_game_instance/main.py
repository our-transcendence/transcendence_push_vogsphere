#!/usr/bin/env python
import os
import json
import ssl
from http.cookies import SimpleCookie
from aiohttp import web

import socketio
import sys
from gunfight import Gunfight
import jwt

sio = socketio.AsyncServer(
    async_mode='aiohttp',
    cors_allowed_origins="*",
    always_connect=False,
    cors_credentials=True,
)
app = web.Application()
sio.attach(app)
game: Gunfight
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
    if 'id' not in token_content.keys():
        return False
    if token_content['id'] not in ids.values():
        return False
    if await game.playerInGame(token_content['id']):
        return False
    await sio.save_session(sid, dict(filter(filterPlayerDatas, token_content.items())))
    return "OK"


@sio.on("ready")
async def on_ready(sid):
    player_session = await sio.get_session(sid)
    await game.addPlayer(Gunfight.Player(sid, player_session['id']))


@sio.event
async def disconnect(sid):
    await game.give_up(sid)


@sio.on("pos_up")
async def on_pos_up(sid, data):
    await game.update_player(sid, data)


@sio.on("shoot")
async def on_shoot(sid, data):
    await game.shoot(sid, data)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        exit(1)
    with open(os.environ.get("JWT_PUBLIC_KEY_FILE"), "r") as pub_key_file:
        pub_key = pub_key_file.read()
    ids = json.loads(sys.argv[2])
    f = open("remote_game_instance/data/maps.json")
    game = Gunfight(sio, ids, json.load(f))
    ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    ssl_context.load_cert_chain("/etc/ssl/cert.pem", "/etc/ssl/key.pem")
    web.run_app(app, host='0.0.0.0', port=int(sys.argv[1]), ssl_context=ssl_context)
