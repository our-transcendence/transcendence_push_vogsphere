from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


# Create your models here.

class Player(models.Model):
    player_id = models.BigIntegerField(primary_key=True)

    def __str__(self):
        return f"{self.player_id}"


class Stats(models.Model):
    id = models.BigAutoField(primary_key=True)
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    elo = models.IntegerField(default=1500)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)


class PongStats(Stats):
    pass


class GunFightStats(Stats):
    pass
