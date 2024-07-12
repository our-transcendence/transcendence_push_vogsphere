from django.core.management.base import BaseCommand
from user.models import User, Friendship

class Command(BaseCommand):
    help = 'Creates three users and two friend instances'

    def handle(self, *args, **kwargs):
        # Create three users
        user_a = User.objects.create(id=1, login='userA', displayName='User A')
        user_b = User.objects.create(id=2, login='userB', displayName='User B')
        user_c = User.objects.create(id=3, login='userC', displayName='User C')
        user_d = User.objects.create(id=4, login='userD', displayName='User D')

        # Create two friend instances
        friend_ab = Friendship.objects.create(sender=user_a, receiver=user_b, accepted=True)
        friend_bc = Friendship.objects.create(sender=user_c, receiver=user_b, accepted=False)
        friend_bd = Friendship.objects.create(sender=user_b, receiver=user_d, accepted=True)

        self.stdout.write(self.style.SUCCESS('Successfully created users and friend instances'))
