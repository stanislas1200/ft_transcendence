# Generated by Django 3.2.5 on 2024-08-16 11:17

import PongGame.models
from django.conf import settings
import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('contenttypes', '0002_remove_content_type_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='GameType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='PongPlayer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.IntegerField(default=0)),
                ('token', models.CharField(max_length=255)),
                ('n', models.IntegerField(default=0)),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Pong',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('width', models.IntegerField(default=800)),
                ('height', models.IntegerField(default=600)),
                ('ball', models.JSONField(default=dict)),
                ('playerPositions', django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(), default=PongGame.models.get_default_player_positions, size=2)),
                ('playerNumber', models.IntegerField(default=1)),
                ('maxScore', models.IntegerField(default=10)),
                ('ballSpeed', models.FloatField(default=4.0)),
                ('paddleSpeed', models.FloatField(default=15.0)),
                ('mapId', models.IntegerField(default=0)),
                ('players', models.ManyToManyField(to='PongGame.PongPlayer')),
            ],
        ),
        migrations.CreateModel(
            name='PlayerGameTypeStats',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('games_played', models.IntegerField(default=0)),
                ('games_won', models.IntegerField(default=0)),
                ('games_lost', models.IntegerField(default=0)),
                ('total_score', models.IntegerField(default=0)),
                ('game_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='PongGame.gametype')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='GameHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.IntegerField()),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('game', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='PongGame.pong')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(default='waiting', max_length=20)),
                ('gameName', models.CharField(max_length=255)),
                ('object_id', models.PositiveIntegerField()),
                ('content_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='contenttypes.contenttype')),
                ('players', models.ManyToManyField(to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]