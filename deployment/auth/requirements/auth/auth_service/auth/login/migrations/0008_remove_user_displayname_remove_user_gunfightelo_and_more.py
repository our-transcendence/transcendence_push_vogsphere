# Generated by Django 5.0.4 on 2024-04-26 18:16

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('login', '0007_alter_user_login_attempt'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='displayName',
        ),
        migrations.RemoveField(
            model_name='user',
            name='gunFightElo',
        ),
        migrations.RemoveField(
            model_name='user',
            name='picture',
        ),
        migrations.RemoveField(
            model_name='user',
            name='pongElo',
        ),
    ]
