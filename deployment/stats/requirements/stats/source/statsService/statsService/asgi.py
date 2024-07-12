"""
ASGI config for statsService project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from matchmaking.routing import websocket_urlpatterns

application: ProtocolTypeRouter = ProtocolTypeRouter({
    "websocket": URLRouter(websocket_urlpatterns),
    "http": get_asgi_application(),
})
