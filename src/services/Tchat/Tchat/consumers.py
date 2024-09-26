# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from .views import get_user
from asgiref.sync import sync_to_async


class TChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if (self.connect)
            await self.close
        self.userId = self.scope["url_route"]["kwargs"]["UserId"] #get user id
        recipient   = self.scope["url_route"]["kwargs"]["Recipient"]
        print("=======Recipient: " + recipient, flush=True)
        # if not (recipient):
        #     recipient = "Guigz"
        user = await sync_to_async(get_user)(self.userId) #get user name
        # recipient_exist = await sync_to_async(get_user)(recipient) # get destinataire
        try:    
            recipient_id = await sync_to_async(User.objects.get)(username=recipient)
        except User.DoesNotExist:
            await self.accept()
            messages = f'"error:" no user found called: \"{str(recipient)}\"'
            message = {'message': messages}
            await self.send(text_data=json.dumps(message))
            await self.close()
            return
            # self.chat_group_name = str(self.userId)
            # await self.channel_layer.group_add(
            #     self.chat_group_name,
            #     self.channel_name
            # )
            # messages = f'no user found called: \"{recipient}\"'
            # await self.channel_layer.group_send(
            # self.chat_group_name,
            # {
            #     'type': 'update_message_state',
            #     'message': {'message': messages}
            # }
            # )
            # return
            
        print("=======Recipient_id: " + str(recipient_id.id), flush=True)
        print("---------UserName: " + user.username, flush=True)
        
        if (user.username <= recipient):
            self.chat_group_name = user.username + recipient
        else:
            self.chat_group_name = recipient + user.username
        print("==--== chat_group_name: " + self.chat_group_name, flush=True)
        # self.chat_group_name = f'chat_1' #to change to user + destinataire
        
        # user = User.objects.get(id=userId)

        await self.channel_layer.group_add(
            self.chat_group_name,
            self.channel_name
        )
        print("yo", flush=True)
        await self.accept()

    async def disconnect(self, close_code):
        self.close()

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