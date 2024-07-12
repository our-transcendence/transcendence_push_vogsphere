from django.template.defaulttags import url
from django.urls import path, re_path

from . import consumers

websocket_urlpatterns = [
    re_path('ws/status/', consumers.FriendsConsumer.as_asgi())
]
