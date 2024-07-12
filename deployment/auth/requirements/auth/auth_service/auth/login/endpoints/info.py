# Standard library imports


# Django imports
from django.db import OperationalError, IntegrityError
from django.http import response, HttpRequest, Http404
from django.views.decorators.http import require_GET

# Local application/library specific imports
from login.models import User
from ..utils import get_user_from_jwt
import ourJWT.OUR_exception


@ourJWT.Decoder.check_auth()
@require_GET
def get_info(request: HttpRequest, **kwargs):
    try:
        user = get_user_from_jwt(kwargs)
    except Http404:
        return response.HttpResponseNotFound("No user found with given ID")
    if user.login_42 is None:
        return response.JsonResponse({"totp": user.totp_enabled, "login_42_set": False})
    return response.JsonResponse({"totp": user.totp_enabled, "login_42_set": True, "login_42": user.login_42})
