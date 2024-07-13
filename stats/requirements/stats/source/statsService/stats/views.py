import json

from django.db import IntegrityError, OperationalError
from django.forms import model_to_dict
from django.http import HttpResponse, JsonResponse, HttpResponseForbidden
from django.shortcuts import render
from django.views.decorators.http import require_http_methods

from stats.checkers import parseUpdatePlayerData, ParseError
from stats.models import Player, PongStats, GunFightStats, Stats

from statsService import settings

# Create your views here.

c = 400
K = 42


@require_http_methods(['POST'])
def register_player(request, player_id: int):
    authorisation = request.headers.get("Authorization")
    if authorisation is None or authorisation != settings.SERVICE_KEY:
        return HttpResponseForbidden()

    if Player.objects.filter(player_id=player_id).exists():
        return HttpResponse(status=400, reason="Player with this ID already exists")
    try:
        player = Player(player_id=player_id)
        player.save()
        pongStats = PongStats(player=player)
        pongStats.save()
        gunFightStats = GunFightStats(player=player)
        gunFightStats.save()
    except (IntegrityError, OperationalError) as e:
        print(f"DATABASE FAILURE {e}", flush=True)
        return HttpResponse(status=503, reason="Database Failure")
    print(f"Stats Service : Player {player_id} registered", flush=True)
    return HttpResponse(status=201)


@require_http_methods(['GET'])
def player_stats(request, player_id: int):
    try:
        player = Player.objects.get(player_id=player_id)
    except Player.DoesNotExist:
        return HttpResponse(status=404, reason="Player with this ID does not exist")
    response = {
        'player': model_to_dict(player, fields='id'),
        'pong': model_to_dict(PongStats.objects.get(player=player_id), fields=('elo', 'wins', 'losses')),
        'gunfight': model_to_dict(GunFightStats.objects.get(player=player_id), fields=('elo', 'wins', 'losses')),
    }
    return JsonResponse(response)


@require_http_methods(['DELETE'])
def delete_player(request, player_id: int):
    authorisation = request.headers.get("Authorization")
    if authorisation is None or authorisation != settings.SERVICE_KEY:
        return HttpResponseForbidden()

    try:
        player = Player.objects.get(player_id=player_id)
    except Player.DoesNotExist:
        return HttpResponse(status=404, reason="Player with this ID does not exist")
    player.delete()
    return HttpResponse()


@require_http_methods(['POST'])
def update_players_stats(request):
    try:
        data = parseUpdatePlayerData(request.body)
    except ParseError as e:
        return e.http_response
    try:
        winner = Player.objects.get(player_id=data['winner_id'])
    except Player.DoesNotExist:
        return HttpResponse(status=404, reason="Player with winner ID does not exist")
    try:
        looser = Player.objects.get(player_id=data['looser_id'])
    except Player.DoesNotExist:
        return HttpResponse(status=404, reason="Player with looser ID does not exist")
    gameManager: Stats.objects.Manager
    match data['game_type']:
        case 'pong':
            gameManager = PongStats.objects
        case 'gunfight':
            gameManager = GunFightStats.objects
        case _:
            return HttpResponse(status=400, reason="Invalid game type")
    winnerStats = gameManager.get(player=winner)
    looserStats = gameManager.get(player=looser)
    Qwinner = 10 ** (winnerStats.elo / c)
    Qlooser = 10 ** (looserStats.elo / c)
    winnerExpected = Qwinner / (Qwinner + Qlooser)
    looserExpected = Qlooser / (Qlooser + Qwinner)
    winnerStats.elo += K * (1 - winnerExpected)
    looserStats.elo += K * (0 - looserExpected)
    winnerStats.wins += 1
    looserStats.losses += 1
    try:
        winnerStats.save()
        looserStats.save()
    except (IntegrityError, OperationalError) as e:
        print(f"DATABASE FAILURE {e}", flush=True)
        return HttpResponse(status=503, reason="Database Failure")
    return HttpResponse()
