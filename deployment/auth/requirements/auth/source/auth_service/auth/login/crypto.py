# Standard library imports
import os

# Django imports
from django.http import response
from django.views.decorators.http import require_GET

# Third-party imports
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

# Local application/library specific imports
from ourJWT import OUR_class, OUR_exception

SERVICE_KEY = os.getenv("INTER_SERVICE_KEY")

def keygen():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048
    )
    private_key_bytes = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

    public_key = private_key.public_key()
    pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    return private_key_bytes.decode(), pem


PRIVKEY, PUBKEY = keygen()

encoder: OUR_class.Encoder
OUR_class.Decoder.pub_key = PUBKEY

try:
    encoder = OUR_class.Encoder(PRIVKEY)
    print("created both encoder and decoder object", flush=True)
except OUR_exception.NoKey:
    print("NO KEY ERROR", flush=True)
    exit()


@require_GET
def pubkey_retrieval(request):
    return response.HttpResponse(PUBKEY)
