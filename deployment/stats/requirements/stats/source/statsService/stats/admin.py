from django.contrib import admin

from stats.models import Player, PongStats, GunFightStats

# Register your models here.

admin.site.register(Player)
admin.site.register(PongStats)
admin.site.register(GunFightStats)
