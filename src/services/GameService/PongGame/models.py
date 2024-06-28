from django.db import models
from django.contrib.postgres.fields import JSONField, ArrayField
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User

class GameType(models.Model):
    name = models.CharField(max_length=100)

class PlayerGameTypeStats(models.Model):
    player = models.ForeignKey(User, on_delete=models.CASCADE)
    game_type = models.ForeignKey(GameType, on_delete=models.CASCADE)
    games_played = models.IntegerField(default=0)
    games_won = models.IntegerField(default=0)
    games_lost = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0)

class PongPlayer(models.Model):
    player = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    token = models.CharField(max_length=255)
    n = models.IntegerField(default=0)

def get_default_player_positions():
    return [250, 250]
class Pong(models.Model):
    width = models.IntegerField(default=800)
    height = models.IntegerField(default=600)
    ball = models.JSONField(default=dict)
    playerPositions = ArrayField(models.IntegerField(), default=get_default_player_positions, size=2)
    playerNumber = models.IntegerField(default=1)
    players = models.ManyToManyField(PongPlayer)
    maxScore = models.IntegerField(default=10)  # Maximum score to win the game
    ballSpeed = models.FloatField(default=4.0)  # Speed of the ball
    paddleSpeed = models.FloatField(default=15.0)  # Speed of the paddles
    mapId = models.IntegerField(default=0)

class GameHistory(models.Model):
    player = models.ForeignKey(User, on_delete=models.CASCADE)
    game = models.ForeignKey(Pong, on_delete=models.CASCADE)
    score = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)

class Game(models.Model):
    players = models.ManyToManyField(User)
    status = models.CharField(max_length=20, default='waiting')  # pending, ongoing, finished
    gameName = models.CharField(max_length=255)

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    gameProperty = GenericForeignKey('content_type', 'object_id')

    def __str__(self):
        return self.gameName

# class Score(models.Model):
#     game = models.ForeignKey(Game, on_delete=models.CASCADE)
#     player = models.ForeignKey(Player, on_delete=models.CASCADE)
#     score = models.IntegerField(default=0)
