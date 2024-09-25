# your_app/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
# from asgiref.sync import database_sync_to_async
from asgiref.sync import sync_to_async
# from .models import Game
from .game_manager import setup, get_n, update_pong, get_pong_state, move_pong, setup
from .tron_game import update_tron, get_tron_state, setup_tron, get_tron_n, move_tron
from .models import Game

from .views import get_player
from django.core.cache import cache

class GameConsumer(AsyncWebsocketConsumer):
	connected_users = 0
	async def connect(self):
		self.game_id = self.scope['url_route']['kwargs']['game_id']
		self.token = self.scope['url_route']['kwargs']['token'] # TODO : token in header 
		user_id = self.scope['url_route']['kwargs']['UserId']
		player = await sync_to_async(get_player)(None, self.token, user_id)

		# Check game id
		game_exist = await sync_to_async(Game.objects.filter(id=self.game_id).exists)()
		if not game_exist:
			await self.accept()
			await asyncio.sleep(0.5)  # FIXME : ws don't wait that client got the message not working
			await self.send(text_data="Game not found. Closing connection.")
			await self.close(code=4001) # FIXME : close_code not pass
			return

		game = await sync_to_async(Game.objects.get)(id=self.game_id)
		if game.status == 'finished':
			await self.accept()
			await asyncio.sleep(0.5)  # FIXME : ws don't wait that client got the message not working
			await self.send(text_data="Game is finished. Closing connection.")
			await self.close(code=4001) # FIXME : close_code not pass
			return

		self.game = game.gameName

		self.game_group_name = f'{game.gameName}_game_{self.game_id}'
		await self.channel_layer.group_add(
			self.game_group_name,
			self.channel_name
		)
		await self.accept()
		if player:
			# TODO : check game time or tournament 
			if game.gameName == 'pong':
				setting = await sync_to_async(setup)(self.game_id, player)
			elif game.gameName == 'tron':
				setting = await sync_to_async(setup_tron)(self.game_id, player)

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
			if not hasattr(self.channel_layer, "players"):
				self.channel_layer.players = {}
			if self.game_group_name not in self.channel_layer.players:
				self.channel_layer.players[self.game_group_name] = {}
				asyncio.create_task(self.game_loop())

	async def disconnect(self, close_code):
		try:
			if close_code == 4001:
				print("Game not found, connection refused", flush=True)
			else:
				await self.channel_layer.group_discard(
					self.game_group_name,
					self.channel_name
				)
		except:
			return

	async def game_loop(self):
		while True:
			if self.game == 'pong':
				ret, game_id = await update_pong(self.game_id) or (None, None)
				# if not ret:
				# 	continue
				game_state = get_pong_state(self.game_id)
			elif self.game == 'tron':
				ret, game_id = await update_tron(self.game_id) or (None, None)
				game_state = get_tron_state(self.game_id)

			await self.channel_layer.group_send(
				self.game_group_name,
				{
					'type': 'update_game_state',
					'game_state': game_state
				}
			)
			if ret:
				await self.close()
				break # TODO : circle game solo
			await asyncio.sleep(1/60)

	async def update_game_state(self, event):
		await self.send(text_data=json.dumps(event['game_state']))

# TODO : + timezone.timedelta(seconds=60)
	async def receive(self, text_data):
		try:
			data = json.loads(text_data)
			# if self.game == 'pong':
			direction = data['direction']
			token = data['token']
			if not token or not direction:
				return self.send(text_data=json.dumps({
					'error': 'Invalid message'
				}))
			if self.game == 'pong':
				n = get_n(self.game_id, token)
			elif self.game == 'tron':
				n = get_tron_n(self.game_id, token)
			if not n:
				return self.send(text_data=json.dumps({
					'error': 'Not a player'
				}))
			if self.game == 'pong':
				move_pong(self.game_id, n, direction)
			elif self.game == 'tron':
				move_tron(self.game_id, n, direction)

		except Exception as e:
			print(e)
			await self.send(text_data=json.dumps({
				'error': 'Invalid message'
			}))
		
