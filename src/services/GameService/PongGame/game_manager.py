from .models import Game, PongPlayer, GameType, GamStats, Match, PlayerStats, PongStats, TronStats, UserAchievement, Achievement
from django.contrib.auth.models import User
from django.db.models import F
from asgiref.sync import sync_to_async, async_to_sync
import asyncio
from django.utils import timezone
from django.forms.models import model_to_dict
from channels.layers import get_channel_layer

def send_notification(request, users_id=None, message=None):

	if message and users_id:
		channel_layer = get_channel_layer()
		for uid in users_id:
			group_name = f'notifications_{uid}'
			async_to_sync(channel_layer.group_send)(
				group_name,
				{
					'type': 'send_notification',
					'message': message
				}
			)


def achievement_notif(user_id, achievement):
	message = {
			"type": "achievement",
			"data": {
				"title": "Achievement Unlocked",
				"content": f"You unlocked the '{achievement.name}' achievement!",
				"timestamp": timezone.now().isoformat(),
				"user_id": user_id,
				"metadata": {
					"achievement_id": achievement.id,
					"achievement_name": achievement.name
				}
			}
		}
	send_notification(None, [user_id], message)

def check_achievements(user, stats,  win):
	stats.refresh_from_db()
	pong = stats.pong
	tron = stats.tron
	stats = model_to_dict(stats)
	stats['pong'] = model_to_dict(pong)
	stats['tron'] = model_to_dict(tron)
	
	if stats['win_streak'] >= 5:
		ach, created = Achievement.objects.get_or_create(name='Unstoppable Streak', description='Win 5 consecutive matches.', points=10)
		_, created = UserAchievement.objects.get_or_create(user=user, achievement=ach)
		if created:
			achievement_notif(user.id, ach)

	if stats['total_game'] >= 50:
		ach, created = Achievement.objects.get_or_create(name='Gladiator', description='Play 50 matches across all games.', points=10)
		_, created = UserAchievement.objects.get_or_create(user=user, achievement=ach)
		if created:
			achievement_notif(user.id, ach)

	if stats['total_win'] >= 1:
		ach, created = Achievement.objects.get_or_create(name='first win', description='Win your first game.', points=10)
		_, created = UserAchievement.objects.get_or_create(user=user, achievement=ach)
		if created:
			achievement_notif(user.id, ach)

	if stats['pong']['total_win'] >= 10:
		ach, created = Achievement.objects.get_or_create(name='Pong Master', description='Win 10 games of Pong.', points=10)
		_, created = UserAchievement.objects.get_or_create(user=user, achievement=ach)
		if created:
			achievement_notif(user.id, ach)

	if stats['pong']['total_game'] >= 100:
		ach, created = Achievement.objects.get_or_create(name='Pong Veteran', description='Play 100 games of Pong..', points=10)
		_, created = UserAchievement.objects.get_or_create(user=user, achievement=ach)
		if created:
			achievement_notif(user.id, ach)

	if stats['tron']['total_win'] >= 10:
		ach, created = Achievement.objects.get_or_create(name='Tron Champion', description='Win 10 games of Tron.', points=10)
		_, created = UserAchievement.objects.get_or_create(user=user, achievement=ach)
		if created:
			achievement_notif(user.id, ach)	


party_list = {}

maps = [
	[ # 0
	],
	[ # 1
		{
			'type': 'triangle',
			'vertices': [
				{'x': 600, 'y': 150},
				{'x': 600 + 20, 'y': 0},
				{'x': 600 - 20, 'y': 0}
			]
		},
		{
			'type': 'triangle',
			'vertices': [
				{'x': 200, 'y': 50},
				{'x': 200 + 20, 'y': 0},
				{'x': 200 - 20, 'y': 0}
			]
		},
		{
			'type': 'triangle',
			'vertices': [
				{'x': 200, 'y': 450},
				{'x': 200 + 20, 'y': 600},
				{'x': 200 - 20, 'y': 600}
			]
		},
		{
			'type': 'triangle',
			'vertices': [
				{'x': 600, 'y': 550},
				{'x': 600 + 20, 'y': 600},
				{'x': 600 - 20, 'y': 600}
			]
		}
	],
	[ # 2
		{
			'type': 'rectangle',
			'vertices': [
				{'x': 0, 'y': 0},
				{'x': 50, 'y': 0},
				{'x': 50, 'y': 100},
				{'x': 0, 'y': 100}
			]
		},
		{
			'type': 'rectangle',
			'vertices': [
				{'x': 0, 'y': 500},
				{'x': 50, 'y': 500},
				{'x': 50, 'y': 600},
				{'x': 0, 'y': 600}
			]
		},
		{
			'type': 'rectangle',
			'vertices': [
				{'x': 750, 'y': 0},
				{'x': 800, 'y': 0},
				{'x': 800, 'y': 100},
				{'x': 750, 'y': 100}
			]
		},
		{
			'type': 'rectangle',
			'vertices': [
				{'x': 750, 'y': 500},
				{'x': 800, 'y': 500},
				{'x': 800, 'y': 600},
				{'x': 750, 'y': 600}
			]
		},
	],
	[ # 3
	]
]

import random
def make_map3():
	map3 = []
	for i in range(100, 400, 50):
		for j in range(100, 550, 50):
			if i%20 == 0 and not j%20 == 0 :
				continue
			if not i%20 == 0 and j%20 == 0 :
				continue
			if random.randint(1, 10)%2 == 0:
				continue
			map3.append({
				'type': 'rectangle',
				'vertices': [
					{'x': i - 25/2, 'y': j - 25/2},
					{'x': i + 25 - 25/2, 'y': j - 25/2},
					{'x': i + 25 - 25/2, 'y': j + 25 - 25/2},
					{'x': i - 25/2, 'y': j + 25 - 25/2},
				]
			})
			map3.append({
				'type': 'rectangle',
				'vertices': [
					{'x': 800 - i - 25/2, 'y': j - 25/2},
					{'x': 800 - i + 25 - 25/2, 'y': j - 25/2},
					{'x': 800 - i + 25 - 25/2, 'y': j + 25 - 25/2},
					{'x': 800 - i - 25/2, 'y': j + 25 - 25/2},
				]
			})
	maps[3] = map3 

class Party:
	def __init__(self, prop, id, user, token):
		self.stop_event = threading.Event()
		self.game_id = id
		self.width = prop.width
		self.height = prop.height
		self.ball = prop.ball
		self.ballSpeed = self.ball['dx']
		self.positions = prop.playerPositions
		self.player_number = prop.playerNumber
		players = prop.players.all()
		self.players = []
		# self.players = [self.get_player_info(player, token) for player in players]
		self.add_player(players, user, token)
		self.state = 'waiting'
		self.score = prop.maxScore
		self.player_speed = prop.paddleSpeed
		self.paddlePadding = 40
		self.paddleWidth = 10
		self.paddleHeight = 100
		self.ballR = 5
		self.timer = 3
		self.timer_start = time.time()
		if prop.mapId == 3:
			make_map3()
		self.map = maps[prop.mapId].copy()

		if prop.gameMode == 'ffa' and self.player_number > 2:
			borders = [
				{
					'type': 'rectangle',
					'vertices': [
						{'x': 0, 'y': 0},
						{'x': 0, 'y': self.paddleWidth + self.paddlePadding},
						{'x': 150, 'y': self.paddleWidth + self.paddlePadding},
						{'x': 150, 'y': 0}
					]
				},
				{
					'type': 'rectangle',
					'vertices': [
						{'x': 0, 'y': self.height},
						{'x': 0, 'y': self.height - self.paddleWidth - self.paddlePadding},
						{'x': 150, 'y': self.height - self.paddleWidth - self.paddlePadding},
						{'x': 150, 'y': self.height}
					]
				},
				{
					'type': 'rectangle',
					'vertices': [
						{'x': self.width, 'y': 0},
						{'x': self.width, 'y': self.paddleWidth + self.paddlePadding},
						{'x': self.width - 150, 'y': self.paddleWidth + self.paddlePadding},
						{'x': self.width - 150, 'y': 0}
					]
				},
				{
					'type': 'rectangle',
					'vertices': [
						{'x': self.width, 'y': self.height},
						{'x': self.width, 'y': self.height - self.paddleWidth - self.paddlePadding},
						{'x': self.width - 150, 'y': self.height - self.paddleWidth - self.paddlePadding},
						{'x': self.width - 150, 'y': self.height}
					]
				}

			]
			self.map += borders
		self.gameMode = prop.gameMode

		self.players = sorted(self.players, key=lambda x: x['n'])
		self.date = prop.start_date
		self.last_hit = 0
		self.tournament = False

	def add_player(self, players, user, token):
		# for player in players:
		# 	if player.player == user and self.get_player_info(player, token) not in self.players:
		# 		self.players.append(self.get_player_info(player, token))
		# 		break
		# self.players = [self.get_player_info(player) for player in players]
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
			'score': player.score,
			'token': token,
			'n': player.n,
			'hit': 0,
			'ai': False
		}

	def add_ai_player(self, players):
		for player in players:
			if player.player.username == 'AI':
				self.players.append(self.get_player_info(player, 'AI'))
				break
		# self.players.append({
		# 	'name': 'AI',
		# 	'id': 0,
		# 	'score': 0,
		# 	'n': 2,
		# 	'token': 'AI',
		# 	'hit': 0,
		# 	'ai': True
		# })
		self.ai_thread = threading.Thread(target=ai_play, args=(self,))
		self.ai_thread.start()
	
	def stop_ai_player(self):
		self.stop_event.set()
		self.ai_thread.join()
	
	def save(self, winners=[]):
		try:
			if hasattr(self, 'ai_thread'):
				self.stop_ai_player()
			game = Game.objects.get(id=self.game_id)  # Get the game
			winner = None
			for player in self.players:
				# if player['ai']:
					# continue
				# save player score
				p = PongPlayer.objects.get(id=player['id'])
				p.score = player['score']
				p.save()

				# save player stats
				p = User.objects.get(username=player['name'])
				# game_type = GameType.objects.get(name="pong")

				# stats, created = PlayerGameTypeStats.objects.get_or_create(player=p, game_type=game_type)

				if not PlayerStats.objects.filter(player=p).exists():
					PlayerStats.objects.get_or_create(player=p, pong=PongStats.objects.create(), tron=TronStats.objects.create(), gam=GamStats.objects.create())
				player_stats = PlayerStats.objects.get(player=p)


				game.end_time = timezone.now()
				game_duration = game.end_time - game.start_date
				player_stats.pong.play_time = F('play_time') + game_duration
				player_stats.pong.save()
				player_stats.pong.refresh_from_db()
				player_stats.total_game = F('total_game') + 1
				player_stats.pong.total_game = F('total_game') + 1
				# stats.games_played = F('games_played') + 1
				if player['score'] >= self.score or player in winners:
					winner = p
					game.winners.add(p)
					# stats.games_won = F('games_won') + 1
					player_stats.pong.total_win = F('total_win') + 1
					player_stats.total_win = F('total_win') + 1
					player_stats.win_streak = F('win_streak') + 1
					if not player_stats.pong.fastest_win:
						player_stats.pong.fastest_win = game_duration
					elif game_duration < player_stats.pong.fastest_win:
						player_stats.pong.fastest_win = game_duration
				else:
					# stats.games_lost = F('games_lost') + 1
					player_stats.pong.total_lost = F('total_lost') + 1
					player_stats.total_lost = F('total_lost') + 1
					player_stats.win_streak = 0

				# stats.total_score = F('total_score') + player['score']
				player_stats.pong.total_score = F('total_score') + player['score']
				player_stats.pong.total_hit = F('total_hit') + player['hit']
				# stats.save()
				if not player_stats.pong.longest_game:
					player_stats.pong.longest_game = game_duration
				elif game_duration > player_stats.pong.longest_game:
					player_stats.pong.longest_game = game_duration
				player_stats.pong.save()
				player_stats.save()
				check_achievements(p, player_stats, None)

				# save history
				game.status = 'finished'
				game.save()
			# if tournament add winner to next match
			if Match.objects.filter(game=game).exists():
				m = Match.objects.get(game=game)
				players = m.tournament.players.all()
				
				m.winner = winner
				m.save()
				if (not m.next_match): #TODO NM : end tournament
					m.tournament.end_date = timezone.now()
					m.tournament.save()
					for player in m.tournament.players.all():
						stats = PlayerStats.objects.get(player=player.player)
						stats.tournament_played = F('tournament_played') + 1
						if m.winner == player.player:
							stats.tournament_win = F('tournament_win') + 1
						stats.save()
					return

				player = PongPlayer.objects.create(player=winner, score=0, n=m.next_match.game.players.count()+1)
				m.next_match.game.players.add(player.player)
				m.next_match.game.gameProperty.players.add(player)
			else:
				pass
				# delete game
				# game.delete()
		except Exception as e:
			game.delete()

party_list = {}

def setup(game_id, player, token):
	party = party_list.get(game_id)

	# if party:
	# 	setting = {
	# 		'obstacles': party.map,
	# 	}
	
	if party and party.state == 'playing':
		setting = {
			'obstacles': party.map,
		}
		return setting

	game = Game.objects.filter(id=game_id).first()
	tournament = False
	if Match.objects.filter(game=game).exists():
		tournament = True
	
	if timezone.now() < game.start_date:
		return None # error message
	
	if game:
		prop = game.gameProperty
		if not party:
			prop.start_date = game.start_date
			if not prop.ball:
				prop.ball = {'x': prop.width/2, 'y': prop.height/2, 'dx': prop.ballSpeed, 'dy': prop.ballSpeed}
			party = Party(prop, game_id, player, token)
			party.tournament = tournament
			if party.player_number == 1:
				party.add_ai_player(prop.players.all())
			party_list[game_id] = party
		else:
			party.add_player(prop.players.all(), player, token)

		if (party.player_number == game.players.count() and not party.tournament) or (len(party.players) == game.players.count() and party.tournament):
			for player in game.players.all():
				active_players = [p for p in party.players if 'deleted_user' not in p['name']]
				if len(active_players) == 1 or (len(active_players) == 2 and len(party.players) == 4 and party.gameMode == 'team' and ((party.player[0] in active_players and party.player[2] in active_players) or (party.player[1] in active_players and party.player[3] in active_players))):
					winning_players = [p for p in party.players if 'deleted_user' not in p['name']]
					party.state = 'finished'
					party.save(winning_players)
					# del party_list[game_id]  # remove party from party_list
					return {
						'message': 'Game finished',
						'winner': [p['name'] for p in winning_players],
						'reason': 'All other players have been deleted.'
					}


		if party.player_number <= len(party.players) and prop.players.filter(player__id=player.id):
			game.start_date = timezone.now()
			party.state = 'playing'
			party.ball['dx'], party.ball['dy'] = randomize_direction(party)
		
		return {'obstacles': party.map}
	return None

def dict_player(player):
	return {
		"username": player['name'],
		"id": player['id']
	}

def get_pong_state(game_id):
	game = party_list.get(game_id)
	if game is None:
		return {'error': f'Game ID {game_id} not found in party list.'}
	# if game.state == 'waiting':
	# 	return None
	# 	return {'error': 'Game not started yet.'}
	scores = [player['score'] for player in game.players]
	username = [player['name'] for player in game.players]
	game_state = {
		'x': game.ball['x'],
		'y': game.ball['y'],
		'dx': game.ball['dx'],
		'dy': game.ball['dy'],
		'positions': game.positions,
		'scores': scores,
		'usernames': username,
		'state': game.state,
		'gameMode': game.gameMode,
		'tournament': game.tournament
	}
	if (game.state == 'finished'):
		if game.gameMode == 'team':
			game_state['winner'] = [dict_player(game.players[0]), dict_player(game.players[2])] if game.players[0]['score'] >= game.score else [dict_player(game.players[1]), dict_player(game.players[3])],
		else:
			player = dict_player(max(game.players, key=lambda player: player['score']))
			game_state['winner'] = [player]
		# else:
		# 	game_state['winner'] = [game.players[0]] if game.players[0]['score'] >= game.score else [game.players[1]]
		del party_list[game_id]  # remove party from party_list
	return game_state

def get_n(id, token):
	game = party_list.get(id)
	if game is None:
		return
	for player in game.players:
		if player['token'] == token:
			return player['n']
	return None

def move_pong(game_id, n, direction):
	game = party_list.get(game_id)
	if game is None:
		return
	# if game.state != 'playing':
	# 	return

	if game.gameMode == 'ffa' and n > 2:
		if game.positions[n - 1] > 150 and direction == 'up':
			game.positions[n - 1] -= game.player_speed
		elif game.positions[n - 1] < game.width - 150 and direction == 'down':
			game.positions[n - 1] += game.player_speed
	else:
		if game.positions[n - 1] > 50 and direction == 'up':
			game.positions[n - 1] -= game.player_speed
		elif game.positions[n - 1] < game.height - 50 and direction == 'down':
			game.positions[n - 1] += game.player_speed

import time
def ai_play(game):
	last_update_time = 0
	prediction_interval = 1
	move_interval = 0.05
	if game.map:
		prediction_frames = 20
	else:
		prediction_frames = 40

	while not game.stop_event.is_set():
		if game.ball['x'] > game.width / 2:
			current_time = time.time()
			if current_time - last_update_time >= prediction_interval*2:
				# Update future ball position
				future_y = game.ball['y']
				future_x = game.ball['x']
				future_dy = game.ball['dy']
				future_dx = game.ball['dx']
				for _ in range(prediction_frames):  # Predict x frames ahead
					future_y += future_dy
					future_x += future_dx
					# Check for future collision with top and bottom
					if future_y <= game.ballR or future_y >= game.height - game.ballR:
						future_dy *= -1  # Reverse future y direction
						future_y += future_dy * 1.5

					new_ball = {'x': future_x, 'y': future_y}
					for shape in game.map:
						if shape['vertices'][0]['x'] < game.width/2:
							pass
						if in_polygon_with_radius(new_ball, shape['vertices'], game.ballR):
							next_x = future_x - future_dx
							new_point = {'x': next_x, 'y': future_y}
							if in_polygon_with_radius(new_point, shape['vertices'], game.ballR):
								future_dy *= -1
								future_y += future_dy
							else:
								future_dx *= -1
								future_x += future_dx
						if future_x >= game.width:
							break

					# Check for future collision goal
					if future_x >= game.width - game.paddlePadding:
						break

				# Update the last update time
				last_update_time = current_time

			# Move paddle towards future ball position
			for _ in range(20):
				if future_y < game.positions[1] - 10:
					move_pong(game.game_id, 2, 'up')
					time.sleep(move_interval)
					if future_y >= game.positions[1]:
						break
				elif future_y > game.positions[1] + 10:
					move_pong(game.game_id, 2, 'down')
					time.sleep(move_interval)
					if future_y <= game.positions[1]:
						break
		else:
			time.sleep(0.2)
		time.sleep(0.1)

def check_collision(game, vertices, n):
	if in_polygon_with_radius(game.ball, vertices, game.ballR):
		nex_x = game.ball['x'] + (game.ball['dx'] * -1)
		new_point = {'x': nex_x, 'y': game.ball['y']}
		if in_polygon_with_radius(new_point, vertices, game.ballR):
			if n != -1:
				game.last_hit = n
			game.ball['dy'] *= -1
			game.ball['y'] += game.ball['dy']
		else:
			if n != -1:
				game.last_hit = n
			game.ball['dx'] *= -1
			game.ball['x'] += game.ball['dx']

		game.ball['dx'] += game.ball['dx'] * 0.01
		game.ball['dy'] += game.ball['dy'] * 0.01
	

import threading

def randomize_direction(game):
	# angle = random.uniform(0, 2 * math.pi)  # Full circle (0 to 2π)
	angle = random.uniform(math.radians(-60), math.radians(60))
	#|/-45
	#|---0
	#|\ 45
	dx = math.cos(angle)
	dy = math.sin(angle)

	# dx *= game.ballSpeed
	# dy *= game.ballSpeed

	direction_x = random.choice([-1, 1])  # horizontal direction

	dx *= direction_x * game.ballSpeed
	dy *= game.ballSpeed
	return dx, dy

def reset_ball(game):
	game.ball['y'] = game.height/2
	game.ball['x'] = game.width/2
	game.ball['dx'], game.ball['dy'] = randomize_direction(game)
	# time.sleep(1)
	game.timer = 1
	game.timer_start = time.time()

def ffa_update(game):
	if game.ball['y'] <= game.paddlePadding/4 + game.ballR or game.ball['y'] >= game.height - game.paddlePadding/4 - game.ballR:
		if ((game.ball['y'] < 100 and game.last_hit == 2) or (game.ball['y'] > 100 and game.last_hit == 3)) and game.player_number >= 4:
			game.players[game.last_hit]["score"] -= 1
		else:
			game.players[game.last_hit]["score"] += 1

		reset_ball(game)

	# check collision player 3
	paddleVertices = [
		{'x': game.positions[2] - game.paddleHeight/2, 'y': game.paddlePadding},
		{'x': game.positions[2] + game.paddleHeight/2, 'y': game.paddlePadding},
		{'x': game.positions[2] + game.paddleHeight/2, 'y': game.paddlePadding + game.paddleWidth},
		{'x': game.positions[2] - game.paddleHeight/2, 'y': game.paddlePadding + game.paddleWidth}
	]
	check_collision(game, paddleVertices, 2)

	# check collision player 4
	paddleVertices = [
		{'x': game.positions[3] - game.paddleHeight/2, 'y': game.height - game.paddlePadding - game.paddleWidth},
		{'x': game.positions[3] + game.paddleHeight/2, 'y': game.height - game.paddlePadding - game.paddleWidth},
		{'x': game.positions[3] + game.paddleHeight/2, 'y': game.height - game.paddlePadding},
		{'x': game.positions[3] - game.paddleHeight/2, 'y': game.height - game.paddlePadding}
	]
	check_collision(game, paddleVertices, 3)

async def update_pong(game_id):
	if game_id not in party_list:
		return 1, 1
	game = party_list[game_id]
	if (game.state == 'finished'):
		return game.state, game.game_id
	if game.state != 'playing':
		return

	if game.timer and game.timer_start + game.timer > time.time():
		return

	game.timer = 0
	
	# move ball
	game.ball['x'] += game.ball['dx']
	game.ball['y'] += game.ball['dy']
	# check out collision y
	if game.ball['y'] <= 0 + game.ballR or game.ball['y'] >= game.height - game.ballR:
		game.ball['dy'] *= -1
		game.ball['y'] += game.ball['dy']*1.5

	# check out collision x
	if game.ball['x'] <= game.paddlePadding/4 + game.ballR:
		if game.gameMode == 'ffa' and game.player_number >= 4:
			if game.last_hit == 0:
				game.players[game.last_hit]["score"] -= 1
			else:
				game.players[game.last_hit]["score"] += 1
		elif game.gameMode == 'team':
			game.players[3]["score"] += 1
			game.players[1]["score"] += 1
		else:
			game.players[1]["score"] += 1
		reset_ball(game)
	
	if game.ball['x'] >= game.width - game.paddlePadding/4 - game.ballR:
		if game.gameMode == 'ffa' and game.player_number >= 4:
			if game.last_hit == 1:
				game.players[game.last_hit]["score"] -= 1
			else:
				game.players[game.last_hit]["score"] += 1
		elif game.gameMode == 'team':
			game.players[2]["score"] += 1
			game.players[0]["score"] += 1
		else:
			game.players[0]["score"] += 1
		reset_ball(game)


	# check game over
	for player in game.players:
		if player["score"] >= game.score:
			game.state = 'finished'
			await sync_to_async(game.save)()
			# del party_list[game_id]  # remove party from party_list
			return game.state, game.game_id

	# check collision player 1
	paddleVertices = [
		{'x': game.paddlePadding, 'y': game.positions[0] - game.paddleHeight/2},
		{'x': game.paddlePadding + game.paddleWidth, 'y': game.positions[0] - game.paddleHeight/2},
		{'x': game.paddlePadding + game.paddleWidth, 'y': game.positions[0] + game.paddleHeight/2},
		{'x': game.paddlePadding, 'y': game.positions[0] + game.paddleHeight/2}
	]
	check_collision(game, paddleVertices, 0)
		
	# check collision player 2
	paddleVertices = [
		{'x': game.width - game.paddlePadding, 'y': game.positions[1] - game.paddleHeight/2},
		{'x': game.width - game.paddlePadding - game.paddleWidth, 'y': game.positions[1] - game.paddleHeight/2},
		{'x': game.width - game.paddlePadding - game.paddleWidth, 'y': game.positions[1] + game.paddleHeight/2},
		{'x': game.width - game.paddlePadding, 'y': game.positions[1] + game.paddleHeight/2}
	]
	check_collision(game, paddleVertices, 1)


	if game.gameMode == 'ffa' and game.player_number > 2:
		ffa_update(game)
	elif game.gameMode =='team':
		# check collision player 3
		paddleVertices = [
			{'x': game.paddlePadding, 'y': game.positions[2] - game.paddleHeight/2},
			{'x': game.paddlePadding + game.paddleWidth, 'y': game.positions[2] - game.paddleHeight/2},
			{'x': game.paddlePadding + game.paddleWidth, 'y': game.positions[2] + game.paddleHeight/2},
			{'x': game.paddlePadding, 'y': game.positions[2] + game.paddleHeight/2}
		]
		check_collision(game, paddleVertices, 0)
			
		# check collision player 4
		paddleVertices = [
			{'x': game.width - game.paddlePadding, 'y': game.positions[3] - game.paddleHeight/2},
			{'x': game.width - game.paddlePadding - game.paddleWidth, 'y': game.positions[3] - game.paddleHeight/2},
			{'x': game.width - game.paddlePadding - game.paddleWidth, 'y': game.positions[3] + game.paddleHeight/2},
			{'x': game.width - game.paddlePadding, 'y': game.positions[3] + game.paddleHeight/2}
		]
		check_collision(game, paddleVertices, 1)
	
	for shape in game.map:
		check_collision(game, shape['vertices'], -1)

import math
def in_polygon_with_radius(point, vertices, radius=0):
	x, y = point['x'], point['y']

	# Check the point itself first
	if in_polygon(point, vertices):
		return True

	# Check around the point in a circle defined by the radius
	for angle in range(0, 360, 20):  # Check every 20 degrees
		rad = math.radians(angle)
		x_offset = radius * math.cos(rad)
		y_offset = radius * math.sin(rad)

		test_point = {'x': x + x_offset, 'y': y + y_offset}
		if in_polygon(test_point, vertices):
			return True

	return False

def in_polygon(point, vertices):
	x, y = point['x'], point['y']
	num_vertices = len(vertices)

	inside = False
	j = num_vertices - 1
	for i in range(num_vertices):
		if (vertices[i]['y'] > y) != (vertices[j]['y'] > y) and \
				x < (vertices[j]['x'] - vertices[i]['x']) * (y - vertices[i]['y']) / (vertices[j]['y'] - vertices[i]['y']) + vertices[i]['x']:
			inside = not inside
		j = i
	return inside
