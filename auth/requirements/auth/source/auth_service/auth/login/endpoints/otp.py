# Standard library imports
from datetime import timedelta
import json

from django.db import IntegrityError, OperationalError
# Django imports
from django.http import response, HttpRequest, Http404
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.http import require_POST, require_http_methods

# Third-party imports
import pyotp

# Local application/library specific imports
from ..models import User
from login.parsers import parseOtpData, ParseError
from ..utils import get_user_from_jwt
from ..cookie import return_refresh_token
import ourJWT.OUR_exception

NO_OTP = (b'', None, 400, "No otp in request")
NO_USER = (b'', None, 404, "No user found with given ID")
BAD_OTP = (b'', None, 403, "Bad OTP")
OPT_TO = (b'', None, 403, "OTP validation timed out")
ALREADY_2FA = (b'', None, 403, "2FA already enabled for the account")
NO_SET_OTP = (b'', None, 412, "TOTP isn't enabled for given user")
FAILED_DB = (b'', None, 503, "Database service failure")
OTP_EXPECTING = (b'', None, 202, "Expecting otp")


@ourJWT.Decoder.check_auth()
@require_http_methods(["PATCH"])
def set_totp_endpoint(request: HttpRequest, **kwargs):
    try:
        user = get_user_from_jwt(kwargs)
    except Http404:
        return response.HttpResponse(*NO_USER)

    if user.totp_enabled is True:
        return response.HttpResponse(*ALREADY_2FA)

    user.totp_key = pyotp.random_base32()
    user.login_attempt = timezone.now()
    try :
        user.save()
    except (IntegrityError, OperationalError) as e:
        print(f"DATABASE FAILURE {e}", flush=True)
        return response.HttpResponse(status=503, reason="Database Failure")
    response_content = {"totp_key": user.totp_key,
                        "uri_key":
                            f"otpauth://totp/OUR_Transcendence:{user.login}"
                            f"?secret={user.totp_key}"
                            "&issuer=OUR_Transcendence-auth"}
    need_otp_response = response.JsonResponse(response_content)
    need_otp_response.status_code = OTP_EXPECTING[2]
    need_otp_response.reason_phrase = OTP_EXPECTING[3]
    need_otp_response.set_cookie(key="otp_status",
                                 value="otp_enable",
                                 max_age=timedelta(seconds=120),
                                 httponly=True)
    return need_otp_response


@ourJWT.Decoder.check_auth()
@require_http_methods(["PATCH"])
def remove_totp_endpoint(request: HttpRequest, **kwargs):
    try:
        user: User = get_user_from_jwt(kwargs)
    except Http404:
        return response.HttpResponse(*NO_USER)

    if user.totp_enabled is False:
        return response.HttpResponse(*NO_SET_OTP)

    user.login_attempt = timezone.now()
    try:
        user.save()
    except (IntegrityError, OperationalError) as e:
        print(f"DATABASE FAILURE {e}", flush=True)
        return response.HttpResponse(status=503, reason="Database Failure")

    need_otp_response = response.HttpResponse(*OTP_EXPECTING)
    need_otp_response.set_cookie(key="otp_status",
                                 value="otp_disable",
                                 max_age=timedelta(seconds=120),
                                 httponly=True)
    return need_otp_response


@require_POST
def otp_submit_endpoint(request: HttpRequest):
    reason = request.COOKIES.get("otp_status")
    match reason:
        case "otp_login":
            return otp_login_backend(request)
        case "otp_enable":
            return otp_activation_backend(request)
        case "otp_disable":
            return otp_disable_backend(request)
        case _:
            return response.HttpResponseBadRequest(reason="no reason given for otp")


def otp_login_backend(request: HttpRequest):
    user_id = request.COOKIES.get("otp_user_ID")
    if user_id is None:
        return response.HttpResponseBadRequest()
    try:
        user = get_object_or_404(User, pk=user_id)
    except Http404:
        return response.HttpResponse(*NO_USER)
    if user.totp_key is None:
        return response.HttpResponse(*NO_SET_OTP)

    if not request.body:
        user.totp_key = None
        try:
            user.save()
        except (IntegrityError, OperationalError) as e:
            print(f"DATABASE FAILURE {e}", flush=True)
            return response.HttpResponse(status=503, reason="Database Failure")
        return response.HttpResponseBadRequest(reason="empty request")

    try:
        otp = get_otp_from_body(request.body)
    except ParseError as e:
        return e.http_response
    if otp is None:
        return response.HttpResponse(*NO_OTP)

    otp_status, otp_response = check_otp(user, otp)

    if otp_status is False:
        return otp_response

    user.login_attempt = None
    try:
        user.save()
    except (IntegrityError, OperationalError) as e:
        print(e, flush=True)
        return response.HttpResponse(*FAILED_DB)
    return return_refresh_token(user)


@ourJWT.Decoder.check_auth()
def otp_activation_backend(request: HttpRequest, **kwargs):
    try:
        user = get_user_from_jwt(kwargs)
    except Http404:
        return otp_failure_handling(NO_USER)

    if user.totp_enabled:
        return otp_failure_handling(ALREADY_2FA)

    if user.totp_key is None:
        return otp_failure_handling(NO_SET_OTP)

    try:
        otp = get_otp_from_body(request.body)
    except ParseError as e:
        return e.http_response
    if otp is None:
        return otp_failure_handling(NO_OTP)

    otp_status, otp_response = check_otp(user, otp)

    if otp_status is False:
        user.login_attempt = None
        try:
            user.save()
        except (IntegrityError, OperationalError):
            pass
        CUS_REASON = b'', None, otp_response.status_code, otp_response.reason_phrase
        return otp_failure_handling(CUS_REASON)

    user.totp_enabled = True
    user.login_attempt = None
    try:
        user.save()
    except (IntegrityError, OperationalError):
        return otp_failure_handling(FAILED_DB)
    return response.HttpResponse()


@ourJWT.Decoder.check_auth()
def otp_disable_backend(request: HttpRequest, **kwargs):
    try:
        user = get_user_from_jwt(kwargs)
    except Http404:
        return otp_failure_handling(NO_USER)

    if user.totp_enabled is False:
        return otp_failure_handling(NO_SET_OTP)

    try:
        otp = get_otp_from_body(request.body)
    except ParseError as e:
        return e.http_response
    if otp is None:
        return otp_failure_handling(NO_OTP)

    otp_status, otp_response = check_otp(user, otp)

    if otp_status is False:
        user.login_attempt = None
        try:
            user.save()
        except (IntegrityError, OperationalError):
            pass
        CUS_REASON = b'', None, otp_response.status_code, otp_response.reason_phrase
        return otp_failure_handling(CUS_REASON)

    user.totp_enabled = False
    user.login_attempt = None
    try:
        user.save()
    except (IntegrityError, OperationalError):
        return otp_failure_handling(FAILED_DB)
    return response.HttpResponse()


def check_otp(user: User, otp: str):
    if (user.login_attempt + timedelta(minutes=1)) < timezone.now():
        return False, otp_failure_handling(OPT_TO)
    if user.totp_item.verify(otp) is False:
        return False, otp_failure_handling(BAD_OTP)
    return True, None


def get_otp_from_body(body: HttpRequest.body):
    data = parseOtpData(body)
    return data["otp_code"]


def otp_failure_handling(option: tuple):
    response_object = response.HttpResponse(*option)
    response_object.delete_cookie("otp_status")
    return response_object
