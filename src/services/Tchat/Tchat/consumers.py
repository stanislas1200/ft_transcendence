# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .views import get_user
from asgiref.sync import sync_to_async


class TChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_group_name = f'chat_1'
        self.userId = self.scope["url_route"]["kwargs"]["UserId"]
        # user = User.objects.get(id=userId)
        user = await sync_to_async(get_user)(self.userId)
        print("---------UserName:" + user.username, flush=True)

        await self.channel_layer.group_add(
            self.chat_group_name,
            self.channel_name
        )
        print("yo", flush=True)
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def update_message_state(self, event):
        await self.send(text_data=json.dumps(event['message']))

    async def receive(self, text_data):
        print("In receive", flush=True)
        user = await sync_to_async(get_user)(self.userId)
        small_msg =  json.loads(text_data)['message']
        if not (small_msg):
            return
        message = f'{user}: {small_msg}'
        await self.channel_layer.group_send(
            self.chat_group_name,
            {
                'type': 'update_message_state',
                'message': {'message': message}
            }
        )
        # await self.send(text_data=json.dumps({
        #     'message': message
        # }))