# Standard library imports
import json
from datetime import datetime, timedelta

# Third-party imports
import requests
# Django imports
from django.http import response
from django.shortcuts import get_object_or_404
from django.forms.models import model_to_dict

# Local application/library specific imports
from login.models import User
from login.cookie import duration
from auth import settings
from . import crypto


def get_user_from_jwt(kwargs):
    auth = kwargs["token"]
    key = auth["id"]
    user = get_object_or_404(User, pk=key)
    return user


def send_user_to_user_service(user: User, user_data: dict, headers: dict):
    new_user_id = user.id
    user_request_data = {"id": new_user_id,
                         "login": user_data["login"],
                         "display_name": user_data["display_name"]}
    try:
        user_response = requests.post(f"{settings.USER_SERVICE_URL}/register/",
                                      data=json.dumps(user_request_data),
                                      headers=headers,
                                      verify=False)
    except requests.exceptions.ConnectionError as e:
        print(e, flush=True)
        raise requests.exceptions.ConnectionError("Cant connect to user-service")

    if user_response.status_code != 200:
        print(f"{user_response.status_code}, {user_response.reason}", flush=True)
        raise requests.exceptions.ConnectionError(f"{user_response.status_code}, {user_response.reason}")


def send_user_to_stats_service(user: User, user_data: dict, headers: dict):
    stat_service_data = {"display_name": user_data["display_name"]}
    try:
        stats_response = requests.post(f"{settings.STATS_SERVICE_URL}/stats/{user.id}/register",
                                       data=json.dumps(stat_service_data),
                                       headers=headers,
                                       verify=False)
    except requests.exceptions.ConnectionError as e:
        print(e, flush=True)
        raise requests.exceptions.ConnectionError("Cant connect to stats-service")

    if stats_response.status_code != 201:
        print(f"{stats_response.status_code}, {stats_response.reason}", flush=True)
        raise requests.exceptions.ConnectionError(f"{stats_response.status_code}, {stats_response.reason}")

def send_user_to_history_service(user: User, user_data: dict, headers: dict):
    history_request_data = {"player_id": user.id}
    try:
        history_response = requests.post(f"{settings.HISTORY_SERVICE_URL}/playerregister",
                                         data=json.dumps(history_request_data),
                                         headers=headers,
                                         verify=False)
    except requests.exceptions.ConnectionError as e:
        print(e)
        raise requests.exceptions.ConnectionError("Cant connect to history-service")
    if history_response.status_code != 201:
        print(f"{history_response.status_code}, {history_response.reason}", flush=True)
        raise requests.exceptions.ConnectionError(f"{history_response.status_code}, {history_response.reason}")

def send_new_user(new_user: User, user_data: dict):
    headers = {'Authorization': crypto.SERVICE_KEY,
               'Content-Type': 'application/json'}

    # send new user to user-service
    try:
        send_user_to_user_service(new_user, user_data, headers)
    except requests.exceptions.ConnectionError as e:
        print(e, flush=True)
        return response.HttpResponse(status=408, reason="Cant connect to user-service")

    # send new user to stats-service
    try:
        send_user_to_stats_service(new_user, user_data, headers)
    except requests.exceptions.ConnectionError as e:
        print(e, flush=True)
        return response.HttpResponse(status=408, reason="Cant connect to stats-service")

    # send new user to history-service
    try:
        send_user_to_history_service(new_user, user_data, headers)
    except requests.exceptions.ConnectionError as e:
        print(e, flush=True)
        return response.HttpResponse(status=408, reason="Cant connect to history-service")

    return response.HttpResponse()


def get_42_login_from_token(access_token):
    print("Inside get_42_login func", flush=True)
    # try request to api with the token
    try:
        # profile_request_header = {"Authorization": f"Bearer {access_token}"}
        profile_response = requests.get(f"https://api.intra.42.fr/v2/me?access_token={access_token}")
    except requests.exceptions.RequestException:
        return None, response.HttpResponse(status=500, reason="Cant connect to 42 api")

    if profile_response.status_code != 200:
        print("Response from 42 API is not 200", flush=True)
        return None, response.HttpResponse(status=profile_response.status_code,
                                           reason=f"Error: {profile_response.status_code}")
    # get the login
    try:
        data = json.loads(profile_response.text)
    except json.JSONDecodeError:
        return None, response.HttpResponseBadRequest(reason="JSON Decode Error")
    login_42 = data.get("login")
    if login_42 is None:
        return None, response.HttpResponseBadRequest(reason="JSON Decode Error")
    return login_42, None
