from django.db import models
import random
import math
from django.contrib.postgres.fields import JSONField, ArrayField
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class Player(models.Model):
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    position = models.JSONField(default=dict) # TODO: edit

class GameType(models.Model):
    name = models.CharField(max_length=100)

class PlayerGameTypeStats(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    game_type = models.ForeignKey(GameType, on_delete=models.CASCADE)
    games_played = models.IntegerField(default=0)
    games_won = models.IntegerField(default=0)
    games_lost = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0)

class PongPlayer(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
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
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    game = models.ForeignKey(Pong, on_delete=models.CASCADE)
    score = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)

class Game(models.Model):
    players = models.ManyToManyField(Player)
    status = models.CharField(max_length=20, default='waiting')  # pending, ongoing, finished
    gameName = models.CharField(max_length=255)

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    gameProperty = GenericForeignKey('content_type', 'object_id')

    def __str__(self):
        return self.gameName

# class PartyPlayer(models.Model):
#     player = models.ForeignKey(Player, on_delete=models.CASCADE)
#     game = models.ForeignKey(Game, on_delete=models.CASCADE)
#     player_number = models.PositiveIntegerField()

    # def in_polygon(self, point, vertices):
    #     x, y = point['x'], point['y']
    #     num_vertices = len(vertices)

    #     inside = False
    #     j = num_vertices - 1
    #     for i in range(num_vertices):
    #         if (vertices[i]['y'] > y) != (vertices[j]['y'] > y) and \
    #                 x < (vertices[j]['x'] - vertices[i]['x']) * (y - vertices[i]['y']) / (vertices[j]['y'] - vertices[i]['y']) + vertices[i]['x']:
    #             inside = not inside
    #         j = i

    #     return inside

    # def rectangle_vertices(self, top_left, width, height):
    #     # print("hey")
    #     x, y = top_left['x'], top_left['y']
    #     return [
    #         {'x': x, 'y': y},  # Top left corner
    #         {'x': x + width, 'y': y},  # Top right corner
    #         {'x': x + width, 'y': y + height},  # Bottom right corner
    #         {'x': x, 'y': y + height}  # Bottom left corner
    #     ]
    
    # def check_collision(self, ball, polygon):
    #     for i in range(len(polygon)):
    #         # Get the current vertex and the next vertex (or the first vertex if the current vertex is the last one)
    #         vertex1 = polygon[i]
    #         vertex2 = polygon[(i + 1) % len(polygon)]
            
    #         # Check if the ball intersects with the line segment from vertex1 to vertex2
    #         if self.intersects(ball, vertex1, vertex2):
    #             # If it does, reflect the ball off the side of the polygon
    #             self.reflect(ball, [vertex1, vertex2])

    # def intersects(self, ball, vertex1, vertex2):
    #     # Calculate the distance from the ball to the line segment from vertex1 to vertex2
    #     # This can be done using the formula for the distance from a point to a line
    #     dx = vertex2['x'] - vertex1['x']
    #     dy = vertex2['y'] - vertex1['y']
    #     d = abs(dy * ball['x'] - dx * ball['y'] + vertex2['x'] * vertex1['y'] - vertex2['y'] * vertex1['x']) / math.sqrt(dy**2 + dx**2)
        
    #     # If the distance is less than the radius of the ball, the ball intersects with the line segment
    #     return d < ball['radius']
    
    # def reflect(self, ball, vertices):
    #     # Calculate the angle of incidence
    #     angle = math.atan2(ball['dy'], ball['dx'])

    #     # Calculate the normal vector of the surface
    #     surface_normal = {'x': vertices[1]['y'] - vertices[0]['y'], 'y': vertices[0]['x'] - vertices[1]['x']}
        
    #     # Calculate the dot product of the incident vector and the surface normal
    #     dot_product = ball['dx'] * surface_normal['x'] + ball['dy'] * surface_normal['y']
        
    #     # Calculate the reflected vector
    #     reflected_vector = {'x': ball['dx'] - 2 * dot_product * surface_normal['x'], 'y': ball['dy'] - 2 * dot_product * surface_normal['y']}
        
    #     # Update the ball's direction
    #     ball['dx'] = reflected_vector['x']
    #     ball['dy'] = reflected_vector['y']
    
    # def pong(self):
    #     self.playerBar = { 'w': 10, 'h': 80 } # TODO : remove
    #     # self.start_game()
    #     self.save()

    #     # Move the ball
    #     # self.ball['x'] += self.ball['dx']
    #     # self.ball['y'] += self.ball['dy']
    #     self.ball['x'] += self.ball['dx']
    #     self.ball['y'] += self.ball['dy']

    #     # Check Wall Collision
    #     if self.ball['y'] <= 0 or self.ball['y'] >= self.height:
    #         self.ball['dy'] = -self.ball['dy']

    #     # Check object collision
    #     # triangle 1
    #     triangle_corners = [
    #         {'x': self.width/2, 'y': self.height/2 + self.playerBar['h']*2},
    #         {'x': self.width/2 + self.playerBar['w']/2, 'y': self.height/2 + self.playerBar['h']*4},
    #         {'x': self.width/2 - self.playerBar['w']/2, 'y': self.height/2 + self.playerBar['h']*4}
    #     ] 
    #     if (self.in_polygon(self.ball, triangle_corners)):
    #         print('collision')
    #         # self.check_collision()
    #         self.ball['dx'] = -self.ball['dx']
        
    #     # Check Player Collision
    #     for player in self.players.all():
    #         top_left = { 'x': player.position['x'] - self.playerBar['w']/2, 'y': player.position['y'] - self.playerBar['h']/2 }
    #         vertices = self.rectangle_vertices(top_left, self.playerBar['w'], self.playerBar['h'])
    #         if (self.in_polygon(self.ball, vertices)):
    #             print("hit")
    #             # self.check_collision()
    #             self.ball['dx'] = -self.ball['dx']

    #         # if self.ball['x'] <= player.position['x'] + self.playerBar['w']/2 and self.ball['y'] >= player.position['y'] - self.playerBar['h']/2 and self.ball['y'] <= player.position['y'] + self.playerBar['h']/2:
    #         #     self.ball['dx'] = -self.ball['dx']
    #         #     # self.ball['dy'] = -self.ball['dy']
    #         #     # player.score += 1 # TODO : add player.score
    #         #     player.save()

    #         # if self.ball['x'] == player.position['x'] and self.ball['y'] == player.position['y']:
    #         #     self.ball['dx'] = -self.ball['dx']
    #         #     self.ball['dy'] = -self.ball['dy']
    #         #     # player.score += 1 # TODO : add player.score
    #         #     player.save()

    #     # Check game Over
    #     if self.ball['x'] <= 0 or self.ball['x'] >= self.width:
    #         self.status = 'finished'
    #         self.ball['dx'] = -self.ball['dx'] # TODO : remove
    #     # print('Pong')

    #     self.save()
    #     # print('Pong2')



class Score(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
