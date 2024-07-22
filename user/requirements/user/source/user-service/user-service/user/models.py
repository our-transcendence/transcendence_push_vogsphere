import uuid

from django.db import models
from django.core.validators import MinLengthValidator, RegexValidator
from django.db.models import Q
from django.forms import model_to_dict
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.core.exceptions import MultipleObjectsReturned

class User(models.Model):
    id = models.BigIntegerField(primary_key=True, unique=True)
    login = models.CharField(max_length=15, unique=True)
    displayName = models.CharField(
        validators=[RegexValidator(
            regex='^[a-zA-Z_-]{5,25}$',
            message="Forbiden character detected")],
        null=True
    )

    @staticmethod
    def get_friends_ids(user_id) -> list[int] | None:
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
        q1 = Friendship.objects.filter(receiver=user, accepted=True)
        q2 = Friendship.objects.filter(sender=user, accepted=True)
        friends_ids: list[int] = []
        for query in q1:
            friends_ids.append(query.sender.id)
        for query in q2:
            friends_ids.append(query.receiver.id)
        if len(friends_ids) == 0:
            return None
        return friends_ids


class Friendship(models.Model):
    sender = models.ForeignKey(User, related_name='request_sender', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='request_receiver', on_delete=models.CASCADE)
    accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (['sender', 'receiver'], ['receiver', 'sender'])
