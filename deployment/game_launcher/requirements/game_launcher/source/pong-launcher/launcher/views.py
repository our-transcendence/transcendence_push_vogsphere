import json
import subprocess
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods

from game_launcher import settings
import socket

from launcher.parsers import parseLaunchData, ParseError


def check_port(port: int) -> bool:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    ret = sock.connect_ex(("127.0.0.1", port))
    sock.close()
    return ret == 0


@require_http_methods(["POST"])
def game_launcher(request):
    try:
        data = parseLaunchData(request.body)
    except ParseError as e:
        return e.http_response
    print(data)
    port = settings.GAME_PORTS_START
    while port - settings.GAME_PORTS_START < settings.MAX_GAMES and check_port(port):
        port += 1
    if port > settings.GAME_PORTS_START + settings.MAX_GAMES:
        return HttpResponse(status=503)
    subprocess.Popen(
        [
            "python3",
            "remote_game_instance/main.py",
            str(port),
            json.dumps(data)
        ])
    return JsonResponse({'port': port})


@require_http_methods(['GET'])
def ping(request):
    statuses = {}
    port = settings.GAME_PORTS_START
    while port - settings.GAME_PORTS_START < settings.MAX_GAMES:
        statuses[port] = 'up' if check_port(port) else 'down'
        port += 1
    return JsonResponse(statuses)
