# your_app/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from django.forms.models import model_to_dict
from .models import Game, Player, Score
# from asgiref.sync import database_sync_to_async
from asgiref.sync import sync_to_async
# from .models import Game
from .game_manager import setup, get_n, update_pong, get_pong_state, move_pong, setup

from .views import get_player
from django.core.cache import cache

class GameConsumer(AsyncWebsocketConsumer):
	connected_users = 0
	async def connect(self):
		# self.game_group_name = 'pong_game'
		# self.session_id = self.scope['session'].session_key
		# print(f'Session ID: {self.session_id}')

		# await self.channel_layer.group_add(
		# 	self.game_group_name,
		# 	self.channel_name
		# )None
		
		self.game_id = self.scope['url_route']['kwargs']['game_id']
		self.token = self.scope['url_route']['kwargs']['token'] # TODO : token in header 
		player = await sync_to_async(get_player)(None, self.token)


		self.game_group_name = f'pong_game_{self.game_id}'
		await self.channel_layer.group_add(
			self.game_group_name,
			self.channel_name
		)
		print(f'Connected to game {self.game_id}')
		await self.accept()

		if player:
			setting = await sync_to_async(setup)(self.game_id, player)
			data = {
				"message": "Setup",
				"setting": setting
			}
			if not setting:
				data = {
					"message": "Error",
					"error": "Game not found"
				}
			await self.send(text_data=json.dumps(data))
			# game = await sync_to_async(Game.objects.filter(players__in=[player]).first)()
			# # game = Game.objects.filter(players__in=[player])
			# if game:
			# 	# prop = game.gameProperty
			# 	prop = await sync_to_async(getattr)(game, 'gameProperty')
			# 	# party = {
			# 	# 	'ball': {'x': prop.ball.x, 'y': 600/2, 'dx': 5, 'dy': 5},
			# 	# 	'p1' : {'y': 250},
			# 	# 	'p2' : {'y': 250}
			# 	# }
			# 	if not prop.ball: # TODO : add var + function to setup party
			# 		prop.ball = {'x': 800/2, 'y': 600/2, 'dx': 5, 'dy': 5}
			# 	add_party(prop, self.game_id)
				
			if not hasattr(self.channel_layer, "players"):
				self.channel_layer.players = {}
			if self.game_group_name not in self.channel_layer.players:
				self.channel_layer.players[self.game_group_name] = {}
				# new_party(self.game_id)
				asyncio.create_task(self.game_loop())

			# player = 'temp'

			# save player auth
			# if 'p1' not in self.channel_layer.players[self.game_group_name]:
			# 	print(f"player 1 joined: {player.name} {self.token}")
			# 	self.channel_layer.players[self.game_group_name]['p1'] = {
			# 		'user': player,
			# 		'token': self.token
			# 	}
			# elif 'p2' not in self.channel_layer.players[self.game_group_name]:
			# 	print(f"player 2 joined: {player.name} {self.token}")
			# 	self.channel_layer.players[self.game_group_name]['p2'] = {
			# 		'user': player,
			# 		'token': self.token
			# 	}
			# cache.set('players', self.channel_layer.players)# TODO: change all this no cache layer and store player in game_manager.py


		# GameConsumer.connected_users += 1
		# while (True):
		# 	self.game = await sync_to_async(Game.objects.get)(id=self.game_id)
		# 	print(self.game.status)
		# 	if self.game.status != 'waiting':
		# 		break
		# print(self.game)
		# print(GameConsumer.connected_users)
		# if (GameConsumer.connected_users == 1):
		# 	self.send_game_state_task = asyncio.create_task(self.send_game_state())
		# 	self.send_game_play_task = asyncio.create_task(self.pong())

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
			self.game_group_name,
			self.channel_name
		)

		# game_id = int(self.game_group_name.split('_')[-1])
		# print(f'Disconnected from game {game_id}')
		# GameConsumer.connected_users -= 1
		# # if (GameConsumer.connected_users == 0):
		# try:
		# 	self.send_game_state_task.cancel()
		# except:
		# 	pass
		# try:
		# 	self.send_game_play_task.cancel()
		# except:
		# 	pass
	async def game_loop(self):
		while True:
			ret = await update_pong(self.game_id)
			game_state = get_pong_state(self.game_id)

			await self.channel_layer.group_send(
				self.game_group_name,
				{
					'type': 'update_game_state',
					'game_state': game_state
				}
			)
			if ret:
				break
			await asyncio.sleep(1/60)

	async def update_game_state(self, event):
		await self.send(text_data=json.dumps(event['game_state']))


	@sync_to_async
	def get_session_id(self):
		print(self.scope['session'].session_key)
		return self.scope['session'].session_key

	@sync_to_async
	def move(self, direction, sessionId):
		game_id = int(self.game_group_name.split('_')[-1])
		game = Game.objects.get(id=game_id)
		player = get_player(sessionId)
		game.record_move(player, direction)

	async def receive(self, text_data):
		try:
			data = json.loads(text_data)
			direction = data['direction']
			token = data['token']
			if not token or not direction:
				return self.send(text_data=json.dumps({
					'error': 'Invalid message'
				}))
			n = get_n(self.game_id, token)
			if not n:
				return self.send(text_data=json.dumps({
					'error': 'Not a player'
				}))
			# n = Game.objects.get(id=self.game_id).gameProperty.players.get(token=token).n
			# player = self.channel_layer.players[self.game_group_name]['p1']
			# p = 'p1'
			# if not player.get('token') == token:
			# 	player = self.channel_layer.players[self.game_group_name]['p2']
			# 	p = 'p2'
			# 	if not player.get('token') == token:
			# 		print("back")
			# 		await self.send(text_data=json.dumps({
			# 			'error': 'Not a player'
			# 		}))
			# 		return
			move_pong(self.game_id, n, direction)
			# player = data['player'] # TODO : check player id
			
			# if game[player]['y'] > 0 and direction == 'up':
			# 	game[player]['y'] -= 20 # TODO: player speed var
			# elif game[player]['y'] < 600 - 80 and direction == 'down': # TODO : setting / var width height from db
			# 	game[player]['y'] += 20

			
			# sessionId = data['sessionId']
			# if not sessionId: 
			# print("sup\n")
			# sessionId = await self.get_session_id();
			# print(":" + sessionId)
			# print(sessionId)
			# await self.move(direction, sessionId)

			# await self.channel_layer.group_send(
			# 	self.game_group_name,
			# 	{
			# 		'type': 'game_message',
			# 		'direction': direction
			# 	}
			# )
			
			# await self.send(text_data=json.dumps({
			# 	'message': 'position updated'
			# }))
		except Exception as e:
			print(e)
			await self.send(text_data=json.dumps({
				'error': 'Invalid message'
			}))

	# async def game_message(self, event):
	# 	direction = event['direction']

	# 	await self.send(text_data=json.dumps({
	# 		'direction': direction
	# 	}))

	# @sync_to_async
	# def game_to_dict(self, game):
	# 	dict = model_to_dict(game)
	# 	dict['players'] = [model_to_dict(player) for player in game.players.all()]
	# 	return dict
	

	# @sync_to_async
	# def pong2(self, game):
	# 	game.pong()

	# async def pong(self):
	# 	while True:
	# 		game_id = int(self.game_group_name.split('_')[-1])
	# 		game = await sync_to_async(Game.objects.get)(id=game_id)

	# 		await self.pong2(game)
	# 		# await asyncio.sleep(0.1)

	# async def get_game_state(self):
	# 	# while True:
	# 	game_id = int(self.game_group_name.split('_')[-1])
	# 	game = await sync_to_async(Game.objects.get)(id=game_id)
	# 	# Fetch the game state
	# 	game_dict = await self.game_to_dict(game)

	# 	return game_dict

	# 		# # Send the game state to the client
	# 		# await self.send(text_data=json.dumps(game_dict))
	# 		# await asyncio.sleep(0.1)



	# async def send_game_state(self):
	# 	while True:
	# 		# update game
	# 		# self.pong();
	# 		# Get the game state
	# 		game_state = await self.get_game_state()

	# 		# Send the game state to all channels in the group
	# 		await self.channel_layer.group_send(
	# 			self.game_group_name,
	# 			{
	# 				'type': 'game_state',
	# 				'game_state': game_state
	# 			}
	# 		)
	# 		await asyncio.sleep(0.2)

	# async def game_state(self, event):
	# 	# Send t.he game state to the WebSocket
	# 	await self.send(text_data=json.dumps(event['game_state']))

	# Replace your existing send_game_state() call with this:
	# self.send_game_state_task = asyncio.create_task(self.send_game_state())
		
