from .models import Game, PongPlayer, User, PlayerStats, Match, GamStats, PongStats, TronStats
from django.db.models import F
from django.utils import timezone
from asgiref.sync import sync_to_async
import math
import random
import time
from .game_manager import check_achievements

party_list = {}

class Party:
	def __init__(self, prop, id, user, token):
		self.game_id = id
		self.player_number = prop.playerNumber
		players = prop.players.all()
		self.players = []
		self.add_player(players, user, token)
		self.state = 'waiting'
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
		self.players = sorted(self.players, key=lambda x: x['n'])

	def get_player_info(self, player, token=None):
		return {
			'name': player.player.username,
			'id': player.id,
			'user_id': player.player.id,
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
			# game_type = GameType.objects.get(name='gun_and_monsters')

			# stats, created = PlayerGameTypeStats.objects.get_or_create(player=p, game_type=game_type)
			if not PlayerStats.objects.filter(player=p).exists():
				PlayerStats.objects.get_or_create(player=p, pong=PongStats.objects.create(), tron=TronStats.objects.create(), gam=GamStats.objects.create())
			player_stats = PlayerStats.objects.get(player=p)
			
			game.end_time = timezone.now()
			game_duration = game.end_time - game.start_date
			player_stats.gam.play_time = F('play_time') + game_duration
			player_stats.gam.save()
			player_stats.gam.refresh_from_db()
			player_stats.total_game = F('total_game') + 1
			player_stats.gam.total_game = F('total_game') + 1
			if player['alive']:
				game.winners.add(p)
				player_stats.gam.total_win = F('total_win') + 1
				player_stats.total_win = F('total_win') + 1
				player_stats.win_streak = F('win_streak') + 1
				if not player_stats.gam.fastest_win:
					player_stats.gam.fastest_win = game_duration
				elif game_duration < player_stats.gam.fastest_win:
					player_stats.gam.fastest_win = game_duration
			else:
				player_stats.gam.total_lost = F('total_lost') + 1
				player_stats.total_lost = F('total_lost') + 1
				player_stats.win_streak = 0
			
			player_stats.gam.total_score = F('total_score') + score
				
			
			if not player_stats.gam.longest_game:
				player_stats.gam.longest_game = game_duration
			elif game_duration > player_stats.gam.longest_game:
				player_stats.gam.longest_game = game_duration
			player_stats.gam.save()
			player_stats.save()
			check_achievements(p, player_stats, None)

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

		
		
		if party.player_number == game.players.count():
			for player in game.players.all():
				active_players = [p for p in party.players if 'deleted_user' not in p['name']]
				if len(active_players) == 1:
					winning_players = [p for p in party.players if 'deleted_user' not in p['name']]
					for p in party.players:
						if 'deleted_user' in p['name']:
							p['alive'] = False
					party.state = 'finished'
					party.save()
					# del party_list[game_id]  # remove party from party_list
					return {
						'message': 'Game finished',
						'winner': [p['name'] for p in winning_players],
						'reason': 'All other players have been deleted.'
					}

		if party.player_number <= len(party.players) and prop.players.filter(player__id=player.id):
			party.state = 'playing'

		return "{'obstacles': party.map}"
	return None

map = [
	[1, 1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 1, 0, 1],
	[1, 0, 0, 0, 0, 1, 0, 1],
	[1, 0, 1, 0, 1, 1, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 1],
	[1, 1, 1, 1, 1, 1, 1, 1],
]

TILE_SIZE = 64
monsters = []
projectiles = []
waves = [
	{"count": 1, "hp": 1, "speed": 1},
	{"count": 5, "hp": 2, "speed": 1.5},
	{"count": 10, "hp": 4, "speed": 2},
	{"count": 15, "hp": 4, "speed": 2},
	{"count": 20, "hp": 5, "speed": 2},
	{"count": 25, "hp": 5, "speed": 2},
	{"count": 30, "hp": 5, "speed": 2},
]

current_wave = 0

ATTACK_COOLDOWN = 25.0

def is_valid_spawn(x, y, game):
	"""Check if the spawn position is valid"""
	mapX = x // TILE_SIZE
	mapY = y // TILE_SIZE
	if mapX < 0 or mapX >= len(map[0]) or mapY < 0 or mapY >= len(map):
		return False
	if map[mapY][mapX] == 1:
		return False
	return True

def spawn_wave(wave, game, i=0):
	"""Spawn a wave of monsters"""
	global monsters
	monsters = []
	for _ in range(wave["count"] + i):
		while True:
			x = random.randint(0, len(map[0]) - 1) * TILE_SIZE
			y = random.randint(0, len(map) - 1) * TILE_SIZE
			if is_valid_spawn(x, y, game):
				monsters.append({"x": x, "y": y, "hp": wave["hp"] + i, "speed": wave["speed"] + i*0.01, "angle": 0})
				break

def update_monsters(game):
	# radius = 200
	tile_size_half = TILE_SIZE / 2

	players = [(player['x'], player['y'], player['hp'], player['alive']) for player in game.players]
	for monster in monsters:
		if monster["hp"] <= 0:
			continue

		nearest_player_index = -1
		nearest_distance = float('inf')
		for i, (px, py, php, palive) in enumerate(players):
			if palive:
				dx = px - monster['x']
				dy = py - monster['y']
				distance = dx * dx + dy * dy
				# if distance < nearest_distance and distance <= radius*radius:
				if distance < nearest_distance:
					nearest_distance = distance
					nearest_player_index = i

		if nearest_player_index == -1:
			continue

		px, py, php = players[nearest_player_index][:3]

		# Move towards the player
		dx = px - monster['x']
		dy = py - monster['y']
		angle = math.atan2(dy, dx)
		monster['angle'] = angle

		sinangle = math.sin(angle)
		cosangle = math.cos(angle)
		newX = monster['x'] + cosangle * monster['speed']
		newY = monster['y'] + sinangle * monster['speed']

		mapX = math.floor(newX / TILE_SIZE)
		mapY = math.floor(newY / TILE_SIZE)
		monster_mapX = math.floor(monster['x'] / TILE_SIZE)
		monster_mapY = math.floor(monster['y'] / TILE_SIZE)

		if map[monster_mapY][mapX] != 1:
			monster['x'] = newX

		if map[mapY][monster_mapX] != 1:
			monster['y'] = newY

		# Check for collision with player
		if abs(px - monster['x']) < tile_size_half and abs(py - monster['y']) < tile_size_half:
			current_time = time.time()
			if current_time - monster.get('last_attack_time', 0) >= ATTACK_COOLDOWN:
				game.players[nearest_player_index]['hp'] -= 10
				monster['last_attack_time'] = current_time
				if game.players[nearest_player_index]['hp'] <= 0:
					game.players[nearest_player_index]['alive'] = False

async def update_gam(game_id):
	"""Update the game state and handle player movement"""
	if game_id not in party_list:
		return
	game = party_list[game_id]
	if game.state != 'playing':
		return
	
	players_alive = 0
	for player in game.players:
		if player['alive']:
			players_alive += 1
			sinangle = math.sin(player['angle'])
			cosangle = math.cos(player['angle'])
			newX = player['x'] - sinangle * player['speedX'] + cosangle * player['speed']
			newY = player['y'] + cosangle * player['speedX'] + sinangle * player['speed']


			mapX = math.floor(newX / TILE_SIZE)
			mapY = math.floor(newY / TILE_SIZE)

			if (map[math.floor(player['y'] / TILE_SIZE)][mapX] != 1):
				player['x'] = newX

			if (map[mapY][math.floor(player['x'] / TILE_SIZE)] != 1):
				player['y'] = newY
	if players_alive == 1:
		game.state = 'finished'
		await sync_to_async(game.save)()
		return game.state, game.game_id

	update_monsters(game)
	update_projectiles(game)

	if all(monster["hp"] <= 0 for monster in monsters):
		global current_wave
		if current_wave < len(waves):
			spawn_wave(waves[current_wave], game)
		else:
			spawn_wave(waves[len(waves)-1], game, current_wave)
		current_wave += 1
		# else:
		# 	game.state = 'won'
	
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
		"alive": player['alive'],
		"user_id": player['user_id'],
		"angle": player['angle'],
		'hp': player['hp'],
	}

def get_gam_state(game_id):
	game = party_list.get(game_id)
	if game is None:
		return {'error': f'Game ID {game_id} not found in party list.'}

	game_state = {
		'state': game.state,
		'players': [dict_player(player) for player in game.players],
		'monsters': monsters,
	}
	return game_state

def move_gam(game_id, n, keyStates, angle):
	game = party_list.get(game_id)
	if not game:
		return
	
	game.players[n-1]['angle'] = angle

	game.players[n-1]['speed'] = 0
	game.players[n-1]['speedX'] = 0
	if keyStates.get('ArrowUp', False) or keyStates.get('z', False) or keyStates.get('w', False):
		game.players[n-1]['speed'] += 2

	if keyStates.get('ArrowDown', False) or keyStates.get('s', False):
		game.players[n-1]['speed'] += -1

	if keyStates.get('ArrowLeft', False) or keyStates.get('q', False) or keyStates.get('a', False):
		game.players[n-1]['speedX'] += -2

	if keyStates.get('ArrowRight', False) or keyStates.get('d', False) or keyStates.get('d', False):
		game.players[n-1]['speedX'] += 2

	game.players[n-1]['speed'] = min(2, max(-1, game.players[n-1]['speed']))
	game.players[n-1]['speedX'] = min(2, max(-2, game.players[n-1]['speedX']))

	if keyStates.get(' ', False):
		shoot(game.players[n-1])
		
def shoot(player):
	"""Create a projectile when the player shoots"""
	projectile_speed = 5
	angle = player['angle']
	x = player['x']
	y = player['y']
	dx = math.cos(angle) * projectile_speed
	dy = math.sin(angle) * projectile_speed
	projectiles.append({'x': x, 'y': y, 'dx': dx, 'dy': dy})

def update_projectiles(game):
	"""Update projectiles and handle collisions"""
	global projectiles
	new_projectiles = []
	for projectile in projectiles:
		projectile['x'] += projectile['dx']
		projectile['y'] += projectile['dy']

		mapX = math.floor(projectile['x'] / TILE_SIZE)
		mapY = math.floor(projectile['y'] / TILE_SIZE)

		if map[mapY][mapX] == 1:
			continue

		for i, monster in enumerate(monsters):
			if monster['hp'] > 0 and abs(monster['x'] - projectile['x']) < TILE_SIZE / 2 and abs(monster['y'] - projectile['y']) < TILE_SIZE / 2:
				monster['hp'] -= 10
				if monster['hp'] <= 0:
					del monsters[i]
				break
		else:
			new_projectiles.append(projectile)

	projectiles = new_projectiles
