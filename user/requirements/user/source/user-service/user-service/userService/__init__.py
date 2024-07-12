import os
import django
from django.core.cache import cache

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'userService.settings')
django.setup()

cache.clear()
