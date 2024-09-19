# your_app/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
# from asgiref.sync import database_sync_to_async
from asgiref.sync import sync_to_async
# from .models import Game
from .game_manager import setup, get_n, update_pong, get_pong_state, move_pong, setup

from .views import get_player
from django.core.cache import cache

class GameConsumer(AsyncWebsocketConsumer):
	connected_users = 0
	async def connect(self):
		
		self.game_id = self.scope['url_route']['kwargs']['game_id']
		self.token = self.scope['url_route']['kwargs']['token'] # TODO : token in header 
		user_id = self.scope['url_route']['kwargs']['UserId']
		player = await sync_to_async(get_player)(None, self.token, user_id)


		self.game_group_name = f'pong_game_{self.game_id}'
		await self.channel_layer.group_add(
			self.game_group_name,
			self.channel_name
		)
		print(f'Connected to game {self.game_id}')
		await self.accept()

		if player:
			# TODO : check game time or tournament 
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
			if not hasattr(self.channel_layer, "players"):
				self.channel_layer.players = {}
			if self.game_group_name not in self.channel_layer.players:
				self.channel_layer.players[self.game_group_name] = {}
				asyncio.create_task(self.game_loop())

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
			self.game_group_name,
			self.channel_name
		)

	async def game_loop(self):
		while True:
			ret, game_id = await update_pong(self.game_id) or (None, None)
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

# TODO : + timezone.timedelta(seconds=60)
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
			move_pong(self.game_id, n, direction)

		except Exception as e:
			print(e)
			await self.send(text_data=json.dumps({
				'error': 'Invalid message'
			}))
		
