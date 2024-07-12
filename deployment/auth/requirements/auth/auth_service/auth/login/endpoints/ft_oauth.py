# Standard library imports

# Third-party imports
import requests

# Django imports
from django.db import IntegrityError, OperationalError
from django.http import response, HttpRequest, Http404
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_POST, require_GET

# Local application/library specific imports
import ourJWT.OUR_exception
from login.models import User
from login.parsers import parseGetToken42Data, ParseError
from ..utils import get_user_from_jwt, get_42_login_from_token
from ..cookie import return_refresh_token
from auth import settings

import json


@require_GET
# return the url to contact when asking for a 42 auth
def login_42_page(request: HttpRequest):
    print("login 42 page", flush=True)
    print(settings.LOGIN_42_PAGE_URL, flush=True)
    return response.JsonResponse({"redirect": settings.LOGIN_42_PAGE_URL})


@require_POST
def get_token_42(request: HttpRequest):
    try:
        data = parseGetToken42Data(request.body)
    except ParseError as e:
        return e.http_response

    expected_keys = {"code"}
    if set(data.keys()) != expected_keys:
        return response.HttpResponseBadRequest(reason="Bad Keys")
    code = data["code"]

    post_data = {
        "grant_type": "authorization_code",
        "client_id": settings.API_42_UID,
        "client_secret": settings.API_42_SECRET,
        "redirect_uri": settings.API_42_REDIRECT_URI,
        "code": code,
    }

    try:
        oauth_response = requests.post("https://api.intra.42.fr/oauth/token/", data=post_data)
    except requests.exceptions.ConnectionError:
        return response.HttpResponse(status=503, reason="Cant connect to 42 api")
    if oauth_response.status_code != 200:
        return response.HttpResponse(status=oauth_response.status_code,
                                     reason=f"Error from 42 API: {oauth_response.status_code}, {oauth_response.text}")

    access_token = oauth_response.json().get("access_token")
    full_response = response.HttpResponse()
    full_response.set_cookie("access_token", access_token)
    full_response.delete_cookie("code")
    return full_response


@require_GET
def login_42_endpoint(request: HttpRequest):
    access_token = request.COOKIES.get("access_token")
    if access_token is None:
        return response.HttpResponseBadRequest(reason="no 42 token in request")

    login_42, http_error = get_42_login_from_token(access_token)
    if login_42 is None:
        return http_error

    try:
        user: User = get_object_or_404(User, login_42=login_42)
    except Http404:
        return response.HttpResponseNotFound(reason="There is no account associated with this 42 account")
    return return_refresh_token(user)


@require_POST
@ourJWT.Decoder.check_auth()
def link_42(request: HttpRequest, **kwargs):
    access_token = request.COOKIES.get("access_token")
    if access_token is None:
        return response.HttpResponseBadRequest(reason="no 42 token in request")

    print(f"access_token = {access_token}", flush=True)

    try:
        user = get_user_from_jwt(kwargs)
    except Http404:
        return response.HttpResponseBadRequest(reason="no user corresponding to auth token")

    if user.login_42 is not None:
        return response.HttpResponseBadRequest(reason="There is already a 42 account associated with this account")

    login_42, http_error = get_42_login_from_token(access_token)
    if login_42 is None:
        print(http_error.reason_phrase, flush=True)
        return http_error

    if User.objects.filter(login_42=login_42).exists():
        return response.HttpResponseForbidden(reason="There is already a 42 account associated with this account")

    user.login_42 = login_42
    try:
        user.save()
    except (IntegrityError, OperationalError) as e:
        print(f"DATABASE FAILURE {e}", flush=True)
        return response.HttpResponse(status=503, reason="Database Failure")

    return response.HttpResponse(status=204, reason="42 account linked successfully")


@require_POST
@ourJWT.Decoder.check_auth()
def unlink_42(request: HttpRequest, **kwargs):
    access_token = request.COOKIES.get("access_token")
    if access_token is None:
        return response.HttpResponseBadRequest(reason="no 42 token in request")

    try:
        user = get_user_from_jwt(kwargs)
    except Http404:
        return response.HttpResponseBadRequest(reason="no user corresponding to auth token")

    if user.login_42 is None:
        return response.HttpResponseBadRequest(reason="There is no 42 account associated with this account")

    login_42, http_error = get_42_login_from_token(access_token)
    if login_42 is None:
        return http_error

    if (login_42 != user.login_42):
        return response.HttpResponseBadRequest(reason="The 42 token given does not correspond to the logged in user")

    user.login_42 = None
    try:
        user.save()
    except (IntegrityError, OperationalError) as e:
        print(f"DATABASE FAILURE {e}", flush=True)
        return response.HttpResponse(status=503, reason="Database Failure")

    return response.HttpResponse(status=204, reason="42 account unlinked successfully")
