import json
from typing import TypedDict, Optional
import django.db.utils
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse, HttpResponseForbidden
from django.views.decorators.http import require_http_methods
from pydantic_core._pydantic_core import ValidationError

from history.models import Player, Match, HistoryMatch
from history.parsers import PlayerRegistrationData, parsePlayerRegistrationData, ParseError, MatchRegistrationData, \
parseMatchRegistrationData, MatchQueryData, MatchQueryValidator, parseMatchQueryData
from historyService import settings


@require_http_methods(["POST"])
def register_player(request):
    authorisation = request.headers.get("Authorization")
    if authorisation is None or authorisation != settings.SERVICE_KEY:
        return HttpResponseForbidden()

    try:
        data: PlayerRegistrationData = parsePlayerRegistrationData(request.body)
    except ParseError as e:
        return e.http_response
    try:
        player = Player.objects.create(
            id=data["player_id"]
        )
        player.save()
    except django.db.utils.IntegrityError:
        return HttpResponse(status=400, reason="id already exist")
    print(f"Player {data['player_id']} registered", flush=True)
    return HttpResponse(status=201)


@require_http_methods(["DELETE"])
def delete_player(request):
    authorisation = request.headers.get("Authorization")
    if authorisation is None or authorisation != settings.SERVICE_KEY:
        return HttpResponseForbidden()
    try:
        data: PlayerRegistrationData = parsePlayerRegistrationData(request.body)
    except ParseError as e:
        print(e.http_response)
        return e.http_response
    try:
        player = Player.objects.get(id=data["player_id"])
        player.delete()
    except Player.DoesNotExist:
        return HttpResponse(status=409, reason=f"player {data['player_id']} does not exist")
    return HttpResponse()


@require_http_methods(["POST"])
def register_match(request):
    try:
        data: MatchRegistrationData = parseMatchRegistrationData(request.body)
    except ParseError as e:
        return e.http_response
    if data["player_1_id"] == data["player_2_id"]:
        print("same", flush=True)
        return HttpResponse(status=400)
    try:
        Match.register(data)
    except Exception as e:
        return HttpResponse(status=500, reason=e)
    return HttpResponse()


@require_http_methods(["GET"])
def get_matches(request):
    try:
        query: MatchQueryData = parseMatchQueryData(json.dumps(request.GET.dict()))
        print(query, flush=True)
    except ParseError as e:
        return e.http_response
    if "opponent_id" not in query:
        query["opponent_id"] = None
    if "match_types" not in query:
        query["match_types"] = {"pong", "gunfight"}
    if not all(x in ["gunfight", "pong"] for x in query["match_types"]):
        return HttpResponse(status=400, reason="invalid match_types")
    try:
        matches: list[HistoryMatch] = Match.retrieve(query["match_types"], query["player_id"], query["opponent_id"])
    except Exception as e:
        return HttpResponse(status=400, reason=str(e))
    return JsonResponse(matches, safe=False)
