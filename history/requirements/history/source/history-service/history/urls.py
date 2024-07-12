from django.urls import path, include
from history.views import register_player, delete_player, register_match, get_matches

urlpatterns = [
    path("player", include([
        path("register", register_player, name="register player"),
        path("delete", delete_player, name="delete player"),
        path("", get_matches, name="player matches list")
    ])),
    path("matches/register", register_match, name="register match")
]
