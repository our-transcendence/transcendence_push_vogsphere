from asgiref.sync import async_to_sync
from django.db import IntegrityError, OperationalError
from channels.layers import get_channel_layer
from django.shortcuts import get_object_or_404
from user.models import User, Friendship


def get_user_from_jwt(kwargs):
    auth = kwargs["token"]
    key = auth["id"]
    user = get_object_or_404(User, pk=key)
    return user


def validate_friendship(friendship):
    friendship.accepted = True
    try :
        friendship.save()
    except (IntegrityError, OperationalError) as e:
        print(f"DATABASE FAILURE {e}", flush=True)
        pass
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(str(friendship.sender.id), {
        "type": "add_friend",
        "ids": [friendship.sender.id, friendship.receiver.id]
    })
    async_to_sync(channel_layer.group_send)(str(friendship.receiver.id), {
        "type": "add_friend",
        "ids": [friendship.sender.id, friendship.receiver.id]
    })
