import typing
from typing import TypedDict, Optional
from django.db import models
from django.db.models import Q, QuerySet
from django.utils import timezone


class MatchData(TypedDict):
    player_1_id: int
    player_2_id: int
    player_1_score: int
    player_2_score: int
    match_type: str


class PlayerData(TypedDict):
    id: int
    # display_name: str
    score: int


class HistoryMatch(TypedDict):
    player_1: PlayerData
    player_2: PlayerData
    timestamp: typing.Any
    match_type: str


class Player(models.Model):
    id = models.BigIntegerField(primary_key=True)
    # display_name = models.CharField()

    def __str__(self):
        return f"{self.id}"
        # return f"{self.id}: {self.display_name}"


class Match(models.Model):
    id = models.BigAutoField(primary_key=True)
    player_1_id = models.ForeignKey(Player, on_delete=models.SET(-1), related_name="player_1_id")
    player_2_id = models.ForeignKey(Player, on_delete=models.SET(-1), related_name="player_2_id")
    player_1_score = models.IntegerField()
    player_2_score = models.IntegerField()
    timestamp = models.DateTimeField()

    def __str__(self):
        return f"{self.player_1_id} ({self.player_1_score}) vs {self.player_2_id} ({self.player_2_score})"

    @staticmethod
    def register(data: MatchData):
        matches_objects: QuerySet | None
        match data["match_type"]:
            case "pong":
                matches_objects = PongMatch.objects
            case "gunfight":
                matches_objects = GunFightMatch.objects
            case _:
                raise ValueError(f"Unknown match_type: {data['match_type']}")
        match = matches_objects.create(
            player_1_id=Player.objects.get(id=data["player_1_id"]),
            player_2_id=Player.objects.get(id=data["player_2_id"]),
            player_1_score=data["player_1_score"],
            player_2_score=data["player_2_score"],
            timestamp=timezone.now()
        )
        match.save()

    @staticmethod
    def retrieve(match_types: set[str], player_1_id: int, player_2_id: Optional[int] = None) -> list[HistoryMatch]:
        matches_list: list[HistoryMatch] = []
        for match_type in match_types:
            raw_matches: QuerySet | None
            matches_objects: QuerySet | None
            match match_type:
                case "pong":
                    matches_objects = PongMatch.objects
                case "gunfight":
                    matches_objects = GunFightMatch.objects
                case _:
                    raise ValueError(f"Unknown match_type: {match_type}")
            if player_1_id and player_2_id:
                raw_matches = matches_objects.filter(
                    Q(player_1_id=player_1_id, player_2_id=player_2_id) |
                    Q(player_1_id=player_2_id, player_2_id=player_1_id))
            else:
                raw_matches = matches_objects.filter(Q(player_1_id=player_1_id) | Q(player_2_id=player_1_id))
            if raw_matches:
                tmp_list = list(raw_matches.values(
                    'player_1_id__id',
                    # 'player_1_id__display_name',
                    'player_2_id__id',
                    # 'player_2_id__display_name',
                    'player_1_score',
                    'player_2_score',
                    'timestamp'
                ))
                for match in tmp_list:
                    match["player_1"] = {
                        "id": match.pop("player_1_id__id"),
                        # "display_name": match.pop("player_1_id__display_name"),
                        "score": match.pop("player_1_score")
                    }
                    match["player_2"] = {
                        "id": match.pop("player_2_id__id"),
                        # "display_name": match.pop("player_2_id__display_name"),
                        "score": match.pop("player_2_score")
                    }
                    match["match_type"] = match_type
                matches_list += tmp_list
        return matches_list


class PongMatch(Match):
    pass


class GunFightMatch(Match):
    pass
