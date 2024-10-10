# your_app/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
# from asgiref.sync import database_sync_to_async
from asgiref.sync import sync_to_async
from django.contrib.auth.models import User
# from .models import Game
from .game_manager import setup, get_n, update_pong, get_pong_state, move_pong, setup
from .tron_game import update_tron, get_tron_state, setup_tron, get_tron_n, move_tron
from .gun_and_monsters import setup_gam, move_gam, get_gam_state, get_gam_n, update_gam
from .models import Game
import http.cookies

from .views import get_player, update_connection
from django.core.cache import cache
import time


async def closeWithMessage(ws, str):
	await ws.accept()
	await asyncio.sleep(0.5)
	await ws.send(text_data=str)
	await ws.close(code=4001)


class NotificationConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		headers = dict(self.scope['headers'])
		self.token = self.user_id = self.group_name= None
		if b'cookie' in headers:
			cookie = headers[b'cookie'].decode()
			cookie = http.cookies.SimpleCookie(cookie)
			self.token = cookie['token'].value if 'token' in cookie else None
			self.user_id = cookie['userId'].value if 'userId' in cookie else None

		if not self.token or not self.user_id:
			return await closeWithMessage(self, 'User not connected')

		user = await sync_to_async(get_player)(None, self.token, self.user_id)

		if not user:
			return await closeWithMessage(self, 'User not connected')

		self.user_id = user.id
		self.group_name = f'notifications_{self.user_id}'

		await self.channel_layer.group_add(
			self.group_name,
			self.channel_name
		)
		await self.accept()
		await sync_to_async(update_connection)(self.user_id, 1)

	async def disconnect(self, code):
		if self.group_name:
			await sync_to_async(update_connection)(self.user_id, -1)
			await self.channel_layer.group_discard(
				self.group_name,
				self.channel_name
			)

	async def receive(self, text_data):
		return
	
	async def send_notification(self, event):
		message = event['message']

		# Send message to WebSocket
		await self.send(text_data=json.dumps(message))
	

class GameConsumer(AsyncWebsocketConsumer):
	connected_users = 0
	async def connect(self):

		# better to store n instead of token but lazy
		headers = dict(self.scope['headers'])
		if b'cookie' in headers:
			cookie = headers[b'cookie'].decode()
			cookie = http.cookies.SimpleCookie(cookie)
			self.token = cookie['token'].value if 'token' in cookie else None
		else:
			self.token = None
		
		self.game_id = self.scope['url_route']['kwargs']['game_id']
		user_id = self.scope['url_route']['kwargs']['UserId']
		player = await sync_to_async(get_player)(None, self.token, user_id)

		# Check game id
		game_exist = await sync_to_async(Game.objects.filter(id=self.game_id).exists)()
		if not game_exist:
			await closeWithMessage(self, "Game not found. Closing connection.")
			return

		game = await sync_to_async(Game.objects.get)(id=self.game_id)
		if game.status == 'finished':
			await closeWithMessage(self, "Game is finished. Closing connection.")
			return

		self.game = game.gameName

		self.game_group_name = f'{game.gameName}_game_{self.game_id}'
		await self.channel_layer.group_add(
			self.game_group_name,
			self.channel_name
		)
		self.is_connected = True
		await self.accept()
		if player:
			# TODO NM : check game time or tournament 
			if game.gameName == 'pong':
				setting = await sync_to_async(setup)(self.game_id, player, self.token)
			elif game.gameName == 'tron':
				setting = await sync_to_async(setup_tron)(self.game_id, player, self.token)
			elif game.gameName == 'gun_and_monsters':
				setting = await sync_to_async(setup_gam)(self.game_id, player, self.token)

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
			self.is_connected = False
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
		last_time = time.time()
		ret = 0
		while True:
			current_time = time.time()
			elapsed_time = current_time - last_time
			if elapsed_time >= (1/60):
				if self.game == 'pong':
					ret, game_id = await update_pong(self.game_id) or (None, None)
					game_state = get_pong_state(self.game_id)
				elif self.game == 'tron':
					ret, game_id = await update_tron(self.game_id) or (None, None)
					game_state = get_tron_state(self.game_id)
				elif self.game == 'gun_and_monsters':
					ret, game_id = await update_gam(self.game_id) or (None, None)
					game_state = get_gam_state(self.game_id)
				
				if game_state:
					await self.channel_layer.group_send(
						self.game_group_name,
						{
							'type': 'update_game_state',
							'game_state': game_state
						}
					)
					last_time = current_time

			if ret:
				await self.channel_layer.group_send(
					self.game_group_name,
					{
						'type': 'update_game_state',
						'game_state': game_state
					}
				)
				if self.is_connected:
					await self.close()
				break # TODO NM : circle game solo
			# await asyncio.sleep(1/60)
			await asyncio.sleep(0)

	async def update_game_state(self, event):
		await self.send(text_data=json.dumps(event['game_state']))

	async def receive(self, text_data):
		try:
			data = json.loads(text_data)
			direction = data['direction']

			if self.game == 'pong':
				n = get_n(self.game_id, self.token)
			elif self.game == 'tron':
				n = get_tron_n(self.game_id, self.token)
			elif self.game == 'gun_and_monsters':
				n = get_gam_n(self.game_id, self.token)

			if not n:
				return self.send(text_data=json.dumps({
					'error': 'Not a player'
				}))
			if self.game == 'pong':
				move_pong(self.game_id, n, direction)
			elif self.game == 'tron':
				move_tron(self.game_id, n, direction)
			elif self.game == 'gun_and_monsters':
				move_gam(self.game_id, n, data['k'], direction, data['angle'])

		except Exception as e:
			await self.send(text_data=json.dumps({
				'error': 'Invalid message'
			}))
		
