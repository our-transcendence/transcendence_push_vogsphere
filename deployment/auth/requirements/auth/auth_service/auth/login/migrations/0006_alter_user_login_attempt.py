# Generated by Django 5.0.4 on 2024-04-22 15:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('login', '0005_alter_user_login_attempt'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='login_attempt',
            field=models.DateField(blank=True, default=None, null=True),
        ),
    ]
