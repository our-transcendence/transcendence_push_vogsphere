import json

from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_http_methods
import requests

from gameProvider import settings


# Create your views here.

@require_http_methods(["POST"])
def create_game(request: HttpRequest):
    print("create game", flush=True)
    print(request.body, flush=True)
    expected_keys = {"player_1", "player_2", "game"}
    data: dict = json.loads(request.body)
    print(data, flush=True)
    print(set(data.keys()))
    if set(data.keys()) != expected_keys:
        return HttpResponse(status=400)
    print(data, flush=True)
    if data['game'] not in settings.LAUNCHERS.keys():
        return HttpResponse(status=400)
    print(data['game'], flush=True)
    min_load = None
    min_load_count = 0
    current_count: int
    for launcher in settings.LAUNCHERS[data['game']]:
        current_count = 0
        response: requests.Response = requests.get(url=f"https://{launcher}/launcher/ping", verify=False)
        if response.status_code != 200:
            continue
        print(response.json(), flush=True)
        for key, item in response.json().items():
            if item == 'up':
                current_count += 1
        if (current_count < min_load_count or min_load is None) and current_count < len(response.json()):
            min_load = launcher
            min_load_count = current_count
    if min_load is None:
        return HttpResponse(status=400)
    response: requests.Response = requests.post(
        f"https://{min_load}/launcher/launch",
        json={"player_1": data['player_1'], "player_2": data['player_2']},
        verify=False
    )
    if response.status_code != 200:
        return HttpResponse(status=400)
    return JsonResponse(response.json() | {"hostname": min_load})
