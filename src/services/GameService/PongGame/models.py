from django.db import models
from django.contrib.postgres.fields import JSONField, ArrayField
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User

class GameType(models.Model):
    name = models.CharField(max_length=100)

class PlayerStats(models.Model):
    player = models.ForeignKey(User, on_delete=models.CASCADE)
    pong = models.ForeignKey(PongStats)
    tron = models.ForeignKey(TronStats)
    total_win = models.IntegerField(default=0)
    total_lost = models.IntegerField (default=0)
    total_game = models.IntegerField(default=0)
    win_streak = models.IntegerField(default=0)
    
class PongStats(models.Model):
    game_won = models.IntegerField(default=0)
    game_lost = models.IntegerField(default=0)
    total_game = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0)
    total_hit = models.IntegerField(default=0)
    fastest_win = models.DateTimeField()
    longest_game = models.DateTimeField()
    play_time = models.DateTimeField()
    
class TronStats(models.Model):
    game_won = models.IntegerField(default=0)
    game_lost = models.IntegerField(default=0)
    total_game = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0)
    fastest_win = models.DateTimeField()
    longest_game = models.DateTimeField()
    play_time = models.DateTimeField()
    
# TODO : Win ration, average score, Time of Day, average play time
# TODO : Game stats: Play Time, score, ball hit, Time of day, ball bounce,
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
    n = models.IntegerField(default=0)

def get_default_player_positions():
    return [300, 300, 400, 400] # TODO : ADDAPT based on player nb
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
    gameMode = models.CharField(max_length=20, default='ffa')

class Tron(models.Model):
    players = models.ManyToManyField(PongPlayer)
    playerNumber = models.IntegerField(default=1)

class GAM(models.Model):
    players = models.ManyToManyField(PongPlayer)
    playerNumber = models.IntegerField(default=1)


class Game(models.Model):
    players = models.ManyToManyField(User)
    status = models.CharField(max_length=20, default='waiting')  # pending, ongoing, finished
    gameName = models.CharField(max_length=255)
    party_name = models.CharField(max_length=50, default='game')
    start_date = models.DateTimeField()

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    gameProperty = GenericForeignKey('content_type', 'object_id')
    winners = models.ManyToManyField(User, related_name='games_as_winner', blank=True)

    # def __str__(self):
    #     return self.gameName

# class GameHistory(models.Model):
#     player = models.ForeignKey(User, on_delete=models.CASCADE)
#     game = models.ForeignKey(Game, on_delete=models.CASCADE)
#     score = models.IntegerField()
#     date = models.DateTimeField(auto_now_add=True)

class Tournament(models.Model):
    name = models.CharField(max_length=100)
    gameName = models.CharField(max_length=255)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    players = models.ManyToManyField(PongPlayer)
    max_player = models.PositiveIntegerField(default=10)

class Match(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, related_name='party', on_delete=models.CASCADE)
    winner = models.ForeignKey(User, related_name='won_matches', on_delete=models.SET_NULL, null=True, blank=True)
    match_date = models.DateTimeField()
    round_number = models.PositiveIntegerField()
    next_match = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='previous_matches')

class Achievement(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    points = models.IntegerField(default=0)

class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)


User.add_to_class(
    'is_online',
    models.PositiveIntegerField(default=0)
)
