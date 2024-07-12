import json
from json import JSONDecodeError
from django.http import HttpResponse
from typing_extensions import TypedDict, Required, Optional
from pydantic import TypeAdapter, ValidationError


class MatchQueryData(TypedDict):
    player_id: Required[int]
    opponent_id: Optional[int]
    match_types: Optional[set[str]]


class MatchRegistrationData(TypedDict):
    player_1_id: Required[int]
    player_2_id: Required[int]
    player_1_score: Required[int]
    player_2_score: Required[int]
    match_type: Required[str]


class PlayerRegistrationData(TypedDict):
    player_id: Required[int]


MatchQueryValidator = TypeAdapter(MatchQueryData)
MatchRegistrationValidator = TypeAdapter(MatchRegistrationData)
PlayerRegistrationValidator = TypeAdapter(PlayerRegistrationData)


class ParseError(ValueError):
    http_response: HttpResponse

    def __init__(self, response: HttpResponse):
        self.http_response = response


def parseMatchQueryData(query: str) -> MatchQueryData:
    try:
        data = json.loads(query)
    except JSONDecodeError as e:
        raise ParseError(HttpResponse(status=400, reason=e.msg))
    try:
        MatchQueryValidator.validate_python(data)
    except ValidationError as e:
        first_error = e.errors()[0]
        error_reason = f"{first_error['loc']}: {first_error['type']}"
        raise ParseError(HttpResponse(status=400, reason=error_reason))
    return data


def parsePlayerRegistrationData(query: str) -> PlayerRegistrationData:
    try:
        data = json.loads(query)
    except JSONDecodeError as e:
        raise ParseError(HttpResponse(status=400, reason=e.msg))
    try:
        PlayerRegistrationValidator.validate_python(data)
    except ValidationError as e:
        first_error = e.errors()[0]
        error_reason = f"{first_error['loc']}: {first_error['type']}"
        raise ParseError(HttpResponse(status=400, reason=error_reason))
    return data


def parseMatchRegistrationData(query: str) -> MatchRegistrationData:
    try:
        data = json.loads(query)
    except JSONDecodeError as e:
        raise ParseError(HttpResponse(status=400, reason=e.msg))
    try:
        MatchRegistrationValidator.validate_python(data)
    except ValidationError as e:
        first_error = e.errors()[0]
        error_reason = f"{first_error['loc']}: {first_error['type']}"
        raise ParseError(HttpResponse(status=400, reason=error_reason))
    return data
