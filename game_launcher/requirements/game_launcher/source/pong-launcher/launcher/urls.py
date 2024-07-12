from django.urls import path

from . import views

urlpatterns = [
    path('launch', views.game_launcher, name='game_launcher'),
    path('ping', views.ping, name="ping"),
]
