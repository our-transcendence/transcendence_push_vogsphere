import os
import shutil
import json
import requests

from django.db import OperationalError
from django.http import response, HttpRequest, HttpResponse, Http404
from django.shortcuts import get_object_or_404
from django.forms.models import model_to_dict
from django.views.decorators.http import require_POST, require_http_methods
from user.models import User
from django.core.cache import cache

import ourJWT.OUR_exception

from user.parsers import parseUserCreationData, ParseError
from userService import settings
from user.utils import get_user_from_jwt

from django.db.models import Q
from json import JSONDecodeError
from PIL import Image

NO_USER = (b'', None, 404, "No user found with given ID")
JSON_DECODE_ERROR = (b'', None, 400, "JSON Decode Error")
JSON_BAD_KEYS = (b'', None, 400, "JSON Bad Keys")
USER_EXISTS = (b'', None, 406, "User with this login already exists")
BAD_IDS = (b'', None, 400, "User id is not equal with connected user id")
CANT_CONNECT_AUTH = (b'', None, 408, "Cant connect to auth-service")
CANT_CONNECT_STATS = (b'', None, 408, "Cant connect to stats-service")
ONLY_PNG = (b'', None, 400, "Only png images are allowed")
DB_FAILURE = (b'', None, 503, "Database Failure")
CORRUPTED_IMG = (b'', None, 403, "Corrupted or invalide image sent")

SERVICE_KEY = os.getenv("INTER_SERVICE_KEY")


@require_POST
def create_user(request):
    authorisation = request.headers.get("Authorization")
    if authorisation is None or authorisation != SERVICE_KEY:
        return response.HttpResponseForbidden()

    try:
        data = parseUserCreationData(request.body)
    except ParseError as e:
        return e.http_response

    user_id = data["id"]
    login = data["login"]
    display_name = data["display_name"]

    if User.objects.filter(Q(login=login) | Q(id=user_id)).exists():
        return response.HttpResponse(*USER_EXISTS)

    new_user = User(id=user_id, login=login, displayName=display_name)
    try:
        new_user.save()
    except OperationalError as e:
        print(f"DATABASE FAILURE {e}", flush=True)
        return response.HttpResponse(*DB_FAILURE)

    # add default picture
    try:
        cat_request = requests.get("https://cataas.com/cat?type=square&position=center", timeout=5)
        if int(cat_request.status_code / 100) % 10 != 2:
            raise Exception("Cataas request failed")
        with open(f"{settings.PICTURES_DST}/{new_user.id}.png", "wb+") as f:
            f.write(cat_request.content)
    except Exception as e:
        print(f"CAT FAILURE {e}", flush=True)
        shutil.copyfile("/data/default.png", f"{settings.PICTURES_DST}/{new_user.id}.png")
    return response.HttpResponse()


@require_http_methods(["GET"])
def get_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return response.HttpResponse(*NO_USER)
    status = cache.get(user.id)
    if status is None or status == 0:
        status = "disconnected"
    else:
        status = "connected"
    return response.JsonResponse({
        "id": user.id,
        "login": user.login,
        "displayName": user.displayName,
        "status": status
    })


@ourJWT.Decoder.check_auth()
@require_http_methods(["GET"])
def search_user(request, **kwargs):
    to_search = request.GET.get("search_for")
    if not isinstance(to_search, str):
        return response.HttpResponseBadRequest()

    print(f'searhcing for : {to_search}', flush=True)
    search_result = User.objects.filter(displayName=to_search)

    # return_dic: dict = {}
    return_array = []
    for user in search_result:
        return_array.append(model_to_dict(user))
        # return_dic[user.id] = model_to_dict(user)
        # print(f'hello there: {return_dic}', flush=True)

    return response.JsonResponse({"result": return_array})
    # return response.JsonResponse(return_dic)


@ourJWT.Decoder.check_auth()
@require_http_methods(["POST"])
def update_user(request: HttpRequest, **kwargs):
    try:
        user = get_user_from_jwt(kwargs)
    except Http404:
        return response.HttpResponse(*NO_USER)

    if 'picture' in request.FILES.keys():
        if request.FILES['picture'].content_type != 'image/png':
            return HttpResponse(*ONLY_PNG)
        with open(f"{settings.PICTURES_DST}/{user.id}_new.png", "wb+") as f:
            for chunk in request.FILES["picture"]:
                f.write(chunk)
        im = Image.open(f"{settings.PICTURES_DST}/{user.id}_new.png")
        try:
            im.verify()
        except:
            os.remove(f"{settings.PICTURES_DST}/{user.id}_new.png")
            return HttpResponse(*CORRUPTED_IMG)
        os.remove(f"{settings.PICTURES_DST}/{user.id}.png")
        os.rename(f"{settings.PICTURES_DST}/{user.id}_new.png", f"{settings.PICTURES_DST}/{user.id}.png")

    if 'display_name' in request.POST.keys():
        user.displayName = request.POST['display_name']
    try:
        user.save()
    except OperationalError as e:
        print(f"DATABASE FAILURE {e}", flush=True)
        return response.HttpResponse(*DB_FAILURE)

    return response.HttpResponse()


@require_http_methods(["GET"])
def get_picture(request, user_id):
    try:
        user = get_object_or_404(User, pk=user_id)
    except Http404:
        return response.HttpResponse(*NO_USER)
    try:
        with open(f"{settings.PICTURES_DST}/{user.id}.png", "rb") as f:
            return HttpResponse(f.read(), content_type="image/png")
    except FileNotFoundError:
        return response.HttpResponse(status=404, reason="No picture found")


@ourJWT.Decoder.check_auth()
@require_http_methods(["DELETE"])
def delete_user(request, **kwargs):
    print(request.method, flush=True)
    try:
        user: User = get_user_from_jwt(kwargs)
    except Http404:
        return response.HttpResponse(*NO_USER)

    # delete user from auth-service
    try:
        delete_header = {"Authorization": SERVICE_KEY}
        auth_response = requests.delete(f"{settings.AUTH_SERVICE_URL}/delete/{user.id}",
                                        headers=delete_header,
                                        verify=False)
    except requests.exceptions.ConnectionError as e:
        return response.HttpResponse(*CANT_CONNECT_AUTH)
    if auth_response.status_code != 200:
        return response.HttpResponse(status=auth_response.status_code, reason=auth_response.text)

    # delete user from stats service
    try:
        stats_response = requests.delete(f"{settings.STATS_SERVICE_URL}/stats/{user.id}/delete",
                                         headers=delete_header,
                                         verify=False)
    except requests.exceptions.ConnectionError as e:
        return response.HttpResponse(*CANT_CONNECT_STATS)
    if stats_response.status_code != 200:
        return response.HttpResponse(status=stats_response.status_code, reason=stats_response.text)

    # delete user from history service
    try:
        delete_data = {"player_id": user.id}
        history_response: requests.Response = requests.delete(f"{settings.HISTORY_SERVICE_URL}/playerdelete",
                                                              headers=delete_header,
                                                              data=json.dumps(delete_data),
                                                              verify=False)
    except requests.exceptions.ConnectionError as e:
        return response.HttpResponse(*CANT_CONNECT_STATS)
    if history_response.status_code != 200:
        return response.HttpResponse(status=history_response.status_code, reason=history_response.reason)

    try:
        user.delete()
    except OperationalError as e:
        print(f"DATABASE FAILURE {e}", flush=True)
        return response.HttpResponse(*DB_FAILURE)
    if os.path.exists(f"{settings.PICTURES_DST}/{user.id}.png"):
        os.remove(f"{settings.PICTURES_DST}/{user.id}.png")
    return response.HttpResponse()
