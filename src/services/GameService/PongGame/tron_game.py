from .models import Game, PongPlayer, User, Match, PlayerStats, PongStats, TronStats, GamStats
from django.db.models import F
from django.utils import timezone
from asgiref.sync import sync_to_async
import threading
from .game_manager import check_achievements


party_list = {}

class Party:
	def __init__(self, prop, id, user, token):
		self.stop_event = threading.Event()
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

	def get_player_info(self, player, token=None):
		return {
			'name': player.player.username,
			'id': player.id,
			'token': token,
			'n': player.n,
			'x': player.n * 600//self.player_number,
			'y': 100 if player.n // 2 else 600,
			'trail': [],
			'direction': "down" if player.n // 2 else "up",
			'alive': True,
			'color': ['red', 'green', 'yellow', 'white'][player.n-1],
			'ai': False
		} 

	def add_ai_player(self, players):
		for player in players:
			if player.player.username == 'AI':
				self.players.append(self.get_player_info(player, 'AI'))
				break
		self.ai_thread = threading.Thread(target=ai_play, args=(self,))
		self.ai_thread.start()
	
	def stop_ai_player(self):
		self.stop_event.set()
		self.ai_thread.join()

	def save(self):
		if hasattr(self, 'ai_thread'):
			self.stop_ai_player()
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
			# game_type = GameType.objects.get(name='tron')

			# stats, created = PlayerGameTypeStats.objects.get_or_create(player=p, game_type=game_type)

			if not PlayerStats.objects.filter(player=p).exists():
				PlayerStats.objects.get_or_create(player=p, pong=PongStats.objects.create(), tron=TronStats.objects.create(), gam=GamStats.objects.create())
			player_stats = PlayerStats.objects.get(player=p)

			game.end_time = timezone.now()
			game_duration = game.end_time - game.start_date
			player_stats.tron.play_time = F('play_time') + game_duration
			player_stats.tron.save()
			player_stats.tron.refresh_from_db()
			player_stats.total_game = F('total_game') + 1
			player_stats.tron.total_game = F('total_game') + 1
			# stats.game_played = F('games_played') + 1
			if player['alive']:
				# stats.games_won = F('games_won') + 1
				game.winners.add(p)
				player_stats.tron.total_win = F('total_win') + 1
				player_stats.total_win = F('total_win') + 1
				player_stats.win_streak = F('win_streak') + 1
				if not player_stats.tron.fastest_win:
					player_stats.tron.fastest_win = game_duration
				elif game_duration < player_stats.tron.fastest_win:
					player_stats.tron.fastest_win = game_duration
			else:
				# stats.games_lost = F('games_lost') + 1
				player_stats.tron.total_lost = F('total_lost') + 1
				player_stats.total_lost = F('total_lost') + 1
				player_stats.win_streak = 0

			# stats.total_score = F('total_score') + score
			player_stats.tron.total_score = F('total_score') + score
			# stats.save()
			if not player_stats.tron.longest_game:
				player_stats.tron.longest_game = game_duration
			elif game_duration > player_stats.tron.longest_game:
				player_stats.tron.longest_game = game_duration
			player_stats.tron.save()
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
				if (not m.next_match): #end tournament
					return

				player = PongPlayer.objects.create(player=winner.player, score=0, n=1, token=winner.token) # take n from manager
				m.next_match.game.players.add(player.player)
				m.next_match.game.gameProperty.players.add(player)

def setup_tron(game_id, player, token):
	party = party_list.get(game_id)
	if party and party.state == 'playing':
		setting = "{ 'obstacles': party.map, }"
		return setting

	game = Game.objects.filter(id=game_id).first()
	if timezone.now() < game.start_date:
		return None # error message
	
	if game:
		prop = game.gameProperty
		if not party:
			prop.start_date = game.start_date
			party = Party(prop, game_id, player, token)
			if party.player_number == 1:
				party.add_ai_player(prop.players.all())
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
			game.start_date = timezone.now()
			party.state = 'playing'

		return "{'obstacles': party.map}"
	return None

# grid_size = 800
grid_width = 800
grid_height = 600
move_step = 10

import time, random

def ai_play(party):
	def is_safe(x, y, trails, step=10):
		for segment in trails:
			(x1, y1), (x2, y2) = segment
			if x1 == x2:
				if y2 < y1:
					y2 -= BUFFER_ZONE*step
				else:
					y2 += BUFFER_ZONE*step
				if x1 - BUFFER_ZONE*step <= x <= x1 + BUFFER_ZONE*step and min(y1, y2) <= y <= max(y1, y2):
					return False
			elif y1 == y2:
				if x2 < x1:
					x2 -= BUFFER_ZONE*step
				else:
					x2 += BUFFER_ZONE*step
				if y1 - BUFFER_ZONE*step <= y <= y1 + BUFFER_ZONE*step and min(x1, x2) <= x <= max(x1, x2):
					return False

		return True
	
	def check_surrounding_area(x, y, trails, scan_radius=50):
		safe_count = 0
		for i in range(1, scan_radius):
			if is_safe(x+1, y, trails, i):
				safe_count += 1
			if is_safe(x-1, y, trails, i):
				safe_count += 1
			if is_safe(x, y+1, trails, i):
				safe_count += 1
			if is_safe(x, y-1, trails, i):
				safe_count += 1
		return safe_count
	
	def get_direction(x, y, trails):
		directions = ['up', 'down', 'left', 'right']
		safe_count = [0, 0, 0, 0]
		distances_to_border = [0, 0, 0, 0]
		for i, direction in enumerate(directions):
			if direction == 'up' and not party.players[1]['direction'] == 'down':
				next_x, next_y = x, y-move_step
			elif direction == 'down' and not party.players[1]['direction'] == 'up':
				next_x, next_y = x, y+move_step
			elif direction == 'left' and not party.players[1]['direction'] == 'right':
				next_x, next_y = x-move_step, y
			elif direction == 'right' and not party.players[1]['direction'] == 'left':
				next_x, next_y = x+move_step, y
			else:
				continue


			if next_x < 0+move_step*1.5 and direction == 'left':
				continue
			elif next_x > grid_width-move_step*1.5 and direction == 'right':
				continue
			if next_y < 0+move_step*1.5 and direction == 'up':
				continue
			elif next_y > grid_height-move_step*1.5 and direction == 'down':
				continue

			if is_safe(next_x, next_y, trails, 0):
				safe_count[i] = check_surrounding_area(next_x, next_y, trails)+1
			else:
				safe_count[i] = 1

			if direction == 'up':
				distances_to_border[i] = next_y
			elif direction == 'down':
				distances_to_border[i] = grid_height - next_y
			elif direction == 'left':
				distances_to_border[i] = next_x
			elif direction == 'right':
				distances_to_border[i] = grid_width - next_x

		# print(safe_count, flush=True)
		max_safe_count = max(safe_count)
		best_directions = [i for i, count in enumerate(safe_count) if count == max_safe_count]

		if len(best_directions) > 1:
			if random.random() < 0.1:
				best_direction = random.choice(best_directions)
			min_distance = min([distances_to_border[i] for i in best_directions])
			best_direction = best_directions[[distances_to_border[i] for i in best_directions].index(min_distance)]
		else:
			best_direction = best_directions[0]

		if max_safe_count == 0:
			return party.players[1]['direction']
		return directions[best_direction]

	while not party.stop_event.is_set():
		trails = party.players[1]['trail'][:-1] + party.players[0]['trail']
		direction = get_direction(party.players[1]['x'], party.players[1]['y'], trails)
		party.players[1]['direction'] = direction
		time.sleep(0.1)

BUFFER_ZONE = 4 # ------| 
async def update_tron(game_id):
	"""Update the game state and handle player movement"""
	if game_id not in party_list:
		return 1, 1
	game = party_list[game_id]
	if (game.state == 'finished'):
		return game.state, game.game_id
	if game.state != 'playing':
		return

	players_alive = 0
	for player in game.players:
		if not player['alive']:
			continue
		players_alive +=1
			
		if player['direction'] == 'up':
			player['y'] -= move_step
		elif player['direction'] == 'down':
			player['y'] += move_step
		elif player['direction'] == 'left':
			player['x'] -= move_step
		elif player['direction'] == 'right':
			player['x'] += move_step

		if len(player['trail']) > 0:
			last_segment = player['trail'][-1]
			last_start, last_end = last_segment
			new_end = (player['x'], player['y'])

			# Extend or new segment
			if (last_start[0] == last_end[0] == new_end[0] and (new_end[1] > last_end[1] or new_end[1] < last_start[1])) or (last_start[1] == last_end[1] == new_end[1] and (new_end[0] > last_end[0] or new_end[0] < last_start[0])):
				player['trail'][-1] = (last_start, new_end)
			else:
				player['trail'].append((last_end, new_end))
		else:
			player['trail'].append(((player['x'], player['y']), (player['x'], player['y'])))

		if player['x'] < 0 or player['x'] > grid_width or player['y'] < 0 or player['y'] > grid_height:
			player['alive'] = False

		# Check if the player hits a trail
		head = (player['x'], player['y'])
		for other_player in game.players:
			if not other_player['alive']:
				continue
			for segment in other_player['trail']:
				(x1, y1), (x2, y2) = segment
				if x1 == x2:
					if x1 - BUFFER_ZONE <= head[0] <= x1 + BUFFER_ZONE and min(y1, y2) + BUFFER_ZONE <= head[1] <= max(y1, y2) - BUFFER_ZONE:
						player['alive'] = False
						break
				elif y1 == y2:
					if y1 - BUFFER_ZONE <= head[1] <= y1 + BUFFER_ZONE and min(x1, x2) + BUFFER_ZONE <= head[0] <= max(x1, x2) - BUFFER_ZONE:
						player['alive'] = False
						break
			if not player['alive']:
				break

	if players_alive <= 1:
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
	if direction not in ['up', 'down', 'left', 'right']:
		return
	game.players[n-1]['direction'] = direction
