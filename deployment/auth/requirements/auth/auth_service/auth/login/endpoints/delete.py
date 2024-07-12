# Standard library imports
from datetime import timedelta
import base64
import binascii
import json
import os

# Django imports
from django.contrib.auth import hashers
from django.core import exceptions
from django.db import OperationalError, IntegrityError, DataError, DatabaseError
from django.http import response, HttpRequest, Http404
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.http import require_POST, require_GET
# Third-party imports


# Local application/library specific imports
from login.models import User
from ..utils import send_new_user, get_user_from_jwt
from ..cookie import return_auth_cookie, return_refresh_token
from .. import crypto


NO_USER = 404, "No user found with given ID"


def delete_endpoint(request: HttpRequest, user_id):
    authorisation = request.headers.get("Authorization")
    if authorisation is None or authorisation != crypto.SERVICE_KEY:
        return response.HttpResponseForbidden()

    try:
        user = get_object_or_404(User, pk=user_id)
    except Http404:
        return response.HttpResponseNotFound()

    try:
        user.delete()
    except (DatabaseError):
        return response.HttpResponse(412, "Db not reachable")
    return response.HttpResponse()
