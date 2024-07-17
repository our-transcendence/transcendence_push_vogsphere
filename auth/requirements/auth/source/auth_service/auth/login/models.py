# Standard library imports
from datetime import datetime, timedelta

# Django imports
from django.db import models
from django.core.validators import MinLengthValidator, RegexValidator

# Third-party imports
import pyotp

# Local application/library specific imports
from .crypto import encoder

# Create your models here.



class User(models.Model):
    id = models.BigAutoField(primary_key=True)
    login = models.CharField(unique=True,
                            validators=[RegexValidator(
                                regex='^[a-zA-Z0-9_-]{1,15}$',
                                message="Forbiden character detected",
                            )])
    password = models.CharField(
        max_length=256,
        validators=[MinLengthValidator(5, "Must contains at least 5 char")]
    )
    jwt_emitted = models.IntegerField(default=0)
    totp_key = models.CharField(max_length=100,
                                null=True,
                                blank=True
                                )
    login_attempt = models.DateTimeField(default=None, null=True, blank=True)
    totp_enabled = models.BooleanField(default=False)
    login_42 = models.CharField(max_length=15, unique=True, null=True, blank=True)

    @property
    def totp_item(self):
        if self.totp_key:
            return pyotp.totp.TOTP(self.totp_key)
        return None

    def generate_refresh_token(self):
        expdate = datetime.now() + timedelta(days=7)
        payload = {
            "pk": self.pk,
            "jti": self.jwt_emitted,
            "exp": expdate
        }
        return encoder.encode(payload, "refresh")

