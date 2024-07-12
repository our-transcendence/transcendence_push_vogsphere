"""
ASGI config for userService project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

# from chat.routing import websocket_urlpatterns
from user.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    'websocket': URLRouter(websocket_urlpatterns),
    'http': get_asgi_application()
})
