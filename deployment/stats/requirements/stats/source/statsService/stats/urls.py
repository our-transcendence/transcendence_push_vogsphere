from django.urls import path, include

from stats import views

urlpatterns = [
    path('<int:player_id>/', include([
        path('register', views.register_player, name='register player'),
        path('infos', views.player_stats, name="stats player's infos"),
        path('delete', views.delete_player, name="delete player"),
    ]), name='player stats'),
    path('update', views.update_players_stats, name="update stats")
]
