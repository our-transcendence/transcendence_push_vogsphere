import json
from json import JSONDecodeError

from django.http import HttpResponse
from typing_extensions import TypedDict, Required
from pydantic import TypeAdapter, ValidationError


class UserCreationData(TypedDict):
    id: int
    login: str
    display_name: str


UserCreationValidator = TypeAdapter(UserCreationData)


class ParseError(ValueError):
    http_response: HttpResponse

    def __init__(self, response: HttpResponse):
        self.http_response = response


def parseUserCreationData(query: str) -> UserCreationData:
    try:
        data = json.loads(query)
    except JSONDecodeError as e:
        raise ParseError(HttpResponse(status=400, reason=e.msg))
    try:
        UserCreationValidator.validate_python(data)
    except ValidationError as e:
        first_error = e.errors()[0]
        error_reason = f"{first_error['loc']}: {first_error['type']}"
        raise ParseError(HttpResponse(status=400, reason=error_reason))
    return data
