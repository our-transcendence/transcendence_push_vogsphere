from django.urls import path

from provider.views import create_game

urlpatterns = [
    path("create/", create_game)
]
