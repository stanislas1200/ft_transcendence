from .models import Game, PongPlayer, User, GameType, PlayerGameTypeStats, Match
from django.db.models import F
from django.utils import timezone
from asgiref.sync import sync_to_async

party_list = {}

class Party:
	def __init__(self, prop, id):
		self.game_id = id
		self.player_number = prop.playerNumber
		players = prop.players.all()
		self.players = [self.get_player_info(player) for player in players]
		self.state = 'waiting' # TODO : check
		self.players = sorted(self.players, key=lambda x: x['n'])
		self.date = prop.start_date

	def add_player(self, players):
		self.players = [self.get_player_info(player) for player in players]

	def get_player_info(self, player):
		return {
			'name': player.player.username,
			'id': player.id,
			'token': player.token,
			'n': player.n,
			'x': player.n * 100,
			'y': 0 if player.n // 2 else 600,
			'trail': [],
			'direction': "down" if player.n // 2 else "up",
			'alive': True,
			'color': ['red', 'green', 'yellow'][player.n-1],
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
			game_type = GameType.objects.get(name='tron')

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

def setup_tron(game_id, player):
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
			party = Party(prop, game_id)
			# if party.player_number == 1: # TODO : ai
			# 	party.add_ai_player()
			party_list[game_id] = party
		else:
			party.add_player(prop.players.all())

		if party.player_number <= prop.players.count() and prop.players.filter(player__id=player.id):
			party.state = 'playing'

		return "{'obstacles': party.map}"
	return None

grid_size = 800

async def update_tron(game_id):
	"""Update the game state and handle player movement"""
	if game_id not in party_list:
		return
	game = party_list[game_id]
	if game.state != 'playing':
		return

	players_alive = 0
	for player in game.players:
		if not player['alive']:
			continue
		players_alive +=1
			
		if player['direction'] == 'up':
			player['y'] -= 3
		elif player['direction'] == 'down':
			player['y'] += 3
		elif player['direction'] == 'left':
			player['x'] -= 3
		elif player['direction'] == 'right':
			player['x'] += 3
	
		player['trail'].append((player['x'], player['y']))

		if player['x'] < 0 or player['x'] > grid_size or player['y'] < 0 or player['y'] > grid_size:
			print(f"Player {player['id']} crashed!", flush=True)
			player['alive'] = False

		# Check if the player hits a trail
		for player in game.players:
			if not player['alive']:
				continue
			head = (player['x'], player['y'])

			for other_player in game.players:
				filtered_trail = other_player['trail'][:-1]
				if head in filtered_trail:
					print(f"Player {player['id']} crashed into Player {other_player['id']}'s trail!", flush=True)
					player['alive'] = False
				if not player['alive']:
					break
	if players_alive == 1:
		game.state = 'finished'
		await sync_to_async(game.save)()
		return game.state, game.game_id

def get_tron_n(id, token):
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
		"color": player['color'],
	}

def get_tron_state(game_id):
	game = party_list.get(game_id)
	if game is None:
		return {'error': f'Game ID {game_id} not found in party list.'}

	game_state = {
		'state': game.state,
		'players': [dict_player(player) for player in game.players]
	}
	return game_state

def move_tron(game_id, n, direction):
	game = party_list.get(game_id)
	if not game:
		return
	game.players[n-1]['direction'] = direction
