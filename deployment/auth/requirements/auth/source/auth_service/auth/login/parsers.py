import json
from json import JSONDecodeError

from django.http import HttpResponse
from typing_extensions import TypedDict, Required
from pydantic import TypeAdapter, ValidationError


class GetToken42Data(TypedDict):
    code: Required[str]


class OtpData(TypedDict):
    otp_code: Required[str]


class RegisterData(TypedDict):
    login: Required[str]
    password: Required[str]
    display_name: Required[str]


GetToken42Validator = TypeAdapter(GetToken42Data)
OtpValidator = TypeAdapter(OtpData)
RegisterValidator = TypeAdapter(RegisterData)


class ParseError(ValueError):
    http_response: HttpResponse

    def __init__(self, response: HttpResponse):
        self.http_response = response


def parseGetToken42Data(query: str) -> GetToken42Data:
    try:
        data = json.loads(query)
    except JSONDecodeError as e:
        raise ParseError(HttpResponse(status=400, reason=e.msg))
    try:
        GetToken42Validator.validate_python(data)
    except ValidationError as e:
        first_error = e.errors()[0]
        error_reason = f"{first_error['loc']}: {first_error['type']}"
        raise ParseError(HttpResponse(status=400, reason=error_reason))
    return data


def parseOtpData(query: str) -> OtpData:
    try:
        data = json.loads(query)
    except JSONDecodeError as e:
        raise ParseError(HttpResponse(status=400, reason=e.msg))
    try:
        OtpValidator.validate_python(data)
    except ValidationError as e:
        first_error = e.errors()[0]
        error_reason = f"{first_error['loc']}: {first_error['type']}"
        raise ParseError(HttpResponse(status=400, reason=error_reason))
    return data


def parseRegisterData(query: str) -> RegisterData:
    try:
        data = json.loads(query)
    except JSONDecodeError as e:
        raise ParseError(HttpResponse(status=400, reason=e.msg))
    try:
        RegisterValidator.validate_python(data)
    except ValidationError as e:
        first_error = e.errors()[0]
        error_reason = f"{first_error['loc']}: {first_error['type']}"
        raise ParseError(HttpResponse(status=400, reason=error_reason))
    return data
