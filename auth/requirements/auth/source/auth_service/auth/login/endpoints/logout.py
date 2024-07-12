# Standard library imports


# Django imports
from django.db import OperationalError, IntegrityError
from django.http import response, HttpRequest, Http404
from django.views.decorators.http import require_POST

# Local application/library specific imports
from login.models import User
from ..utils import get_user_from_jwt
import ourJWT.OUR_exception

# Third-party imports


# Create your views here.

def delete_auth_refresh_cookie():
    no_cookie = response.HttpResponse()
    no_cookie.delete_cookie("auth_token")
    no_cookie.delete_cookie("refresh_token")
    return no_cookie



@ourJWT.Decoder.check_auth()
@require_POST
def logout_here(request: HttpRequest, **kwargs):
    try:
        get_user_from_jwt(kwargs)
    except Http404:
        return response.HttpResponseNotFound("No user found with given ID")

    logout_response: response.HttpResponse = delete_auth_refresh_cookie()
    return logout_response



@ourJWT.Decoder.check_auth()
@require_POST
def logout_everywhere(request: HttpRequest, **kwargs):
    try:
        user: User = get_user_from_jwt(kwargs)
    except Http404:
        return response.HttpResponseNotFound("No user found with given ID")

    logout_response: response.HttpResponse = delete_auth_refresh_cookie()
    user.jwt_emitted += 1  # increment value in user model so all previously emited refresh token are invalid
    try:
        user.save()
    except (IntegrityError, OperationalError) as e:
        print(f"DATABASE FAILURE {e}", flush=True)
        return response.HttpResponse(status=503, reason="Database Failure")
    return logout_response
