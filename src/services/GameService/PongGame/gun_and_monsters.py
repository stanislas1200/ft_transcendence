from .models import Game, PongPlayer, User, GameType, PlayerGameTypeStats, Match
from django.db.models import F
from django.utils import timezone
from asgiref.sync import sync_to_async

party_list = {}

class Party:
	def __init__(self, prop, id, user, token):
		self.game_id = id
		self.player_number = prop.playerNumber
		players = prop.players.all()
		self.players = []
		self.add_player(players, user, token)
		self.state = 'waiting' # TODO : check
		self.players = sorted(self.players, key=lambda x: x['n'])
		self.date = prop.start_date

	def add_player(self, players, user, token):
		player_found = False
		for player in players:
			player_info = self.get_player_info(player)
			for existing_player in self.players:
				if player.player == user and existing_player['id'] == player_info['id']:
					player_found = True
					existing_player['token'] = token
					break
			
			if not player_found and player.player == user:
				self.players.append(self.get_player_info(player, token))
				break

	def get_player_info(self, player, token=None):
		return {
			'name': player.player.username,
			'id': player.id,
			'token': token,
			'n': player.n,
			'x': TILE_SIZE * 2,
			'y': TILE_SIZE * 2,
			'angle': 0,
			'speed': 0,
			'speedX': 0,
			'alive': True,
			'hp': 100,
			'ai': False
		} 

	def save(self):
		game = Game.objects.get(id=self.game_id)
		for j in self.players:
			if j['alive']:
				winner = j
		for player in self.players:
			p = PongPlayer.objects.get(id=player['id'])
			score = 10 if player['alive'] else 0
			p.score = score
			p.save()

			p = User.objects.get(username=player['name'])
			game_type = GameType.objects.get(name='gun_and_monsters')

			stats, created = PlayerGameTypeStats.objects.get_or_create(player=p, game_type=game_type)
			stats.game_played = F('games_played') + 1
			if player['alive']:
				stats.games_won = F('games_won') + 1
			else:
				stats.games_lost = F('games_lost') + 1
			stats.total_score = F('total_score') + score
			stats.save()

			game.status = 'finished'
			game.save()

			if Match.objects.filter(game=game).exists():
				m = Match.objects.get(game=game)
				players = m.tournament.players.all()
				winner = players.get(id=winner['id'])
				m.winner = winner.player
				m.save()
				if (not m.next_match): #TODO : end tournament
					return

				player = PongPlayer.objects.create(player=winner.player, score=0, n=1, token=winner.token) # TODO : n
				m.next_match.game.players.add(player.player)
				m.next_match.game.gameProperty.players.add(player)

def setup_gam(game_id, player, token):
	party = party_list.get(game_id)
	if party and party.state == 'playing':
		setting = "{ 'obstacles': party.map, }"
		return setting

	game = Game.objects.filter(id=game_id).first()
	if timezone.now() < game.start_date:
		return None # TODO : error message
	
	if game:
		prop = game.gameProperty
		if not party:
			prop.start_date = game.start_date
			party = Party(prop, game_id, player, token)
			# if party.player_number == 1: # TODO : ai
			# 	party.add_ai_player()
			party_list[game_id] = party
		else:
			party.add_player(prop.players.all(), player, token)

		if party.player_number <= prop.players.count() and prop.players.filter(player__id=player.id):
			party.state = 'playing'

		return "{'obstacles': party.map}"
	return None

map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

import math
TILE_SIZE = 64;
async def update_gam(game_id):
	"""Update the game state and handle player movement"""
	if game_id not in party_list:
		return
	game = party_list[game_id]
	if game.state != 'playing':
		return
	
	for player in game.players:
		if player['alive']:
			newX = player['x'] - math.sin(player['angle']) * player['speedX'] + math.cos(player['angle']) * player['speed'];
			newY = player['y'] + math.cos(player['angle']) * player['speedX'] + math.sin(player['angle']) * player['speed'];

			mapX = math.floor(newX / TILE_SIZE);
			mapY = math.floor(newY / TILE_SIZE);

			if (map[math.floor(player['y'] / TILE_SIZE)][mapX] != 1):
				player['x'] = newX;

			if (map[mapY][math.floor(player['x'] / TILE_SIZE)] != 1):
				player['y'] = newY;
	

def get_gam_n(id, token):
	game = party_list.get(id)
	if game is None:
		return
	for player in game.players:
		if player['token'] == token:
			return player['n']
	return None

def dict_player(player):
	return {
		"username": player['name'],
		"x": player['x'],
		"y": player['y'],
		"alive": player['alive']
	}

def get_gam_state(game_id):
	game = party_list.get(game_id)
	if game is None:
		return {'error': f'Game ID {game_id} not found in party list.'}

	game_state = {
		'state': game.state,
		'players': [dict_player(player) for player in game.players]
	}
	return game_state

def keyDown(game, n, k):
	if (k == 'ArrowUp'): 
		game.players[n-1]['speed']= 2
	if (k == 'z'): 
		game.players[n-1]['speed']= 2
	if (k == 'ArrowDown'): 
		game.players[n-1]['speed']= -2
	if (k == 's'): 
		game.players[n-1]['speed']= -2
	
	if (k == 'ArrowLeft'): 
		game.players[n-1]['speedX'] = -2
	if (k == 'q'): 
		game.players[n-1]['speedX'] = -2
	if (k == 'ArrowRight'): 
		game.players[n-1]['speedX'] = 2
	if (k == 'd'): 
		game.players[n-1]['speedX'] = 2

def keyUp(game, n, k):
	if (k == 'ArrowUp' or k == 'z' or k == 'ArrowDown' or k == 's'): 
		game.players[n-1]['speed']= 0
	if (k == 'ArrowLeft' or k == 'q' or k == 'ArrowRight' or k == 'd'): 
		game.players[n-1]['speedX'] = 0

def move_gam(game_id, n, k, direction, angle):
	game = party_list.get(game_id)
	if not game:
		return
	game.players[n-1]['angle'] = angle
	if direction == 'down':
		keyDown(game, n, k)
	elif direction == 'up':
		keyUp(game, n, k)
