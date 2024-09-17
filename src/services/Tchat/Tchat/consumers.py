# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class TChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_group_name = f'chat_1'

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
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        await self.channel_layer.group_send(
            self.chat_group_name,
            {
                'type': 'update_message_state',
                'message': text_data_json
            }
        )
        # await self.send(text_data=json.dumps({
        #     'message': message
        # }))