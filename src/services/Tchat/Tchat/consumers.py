# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from .views import get_user
from asgiref.sync import sync_to_async
import requests 


class TChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.userId = self.scope["url_route"]["kwargs"]["UserId"] #get user id
        recipient   = self.scope["url_route"]["kwargs"]["Recipient"]
        token       = self.scope["url_route"]["kwargs"]["token"]
        print("=======Recipient: " + recipient, flush=True)
        print("+=====token: " + token, flush=True)
        # if not (recipient):
        #     recipient = "Guigz"
        user = await sync_to_async(get_user)(self.userId) #get user name
        # recipient_exist = await sync_to_async(get_user)(recipient) # get destinataire
        # cookies = dict(cookies_are='token')
        # print(f'Token being sent: {cookies}')
        try:    
            recipient_id = await sync_to_async(User.objects.get)(username=recipient)
        except User.DoesNotExist:
            await self.accept()
            messages = f'"error:" no user found called: \"{str(recipient)}\"'
            message = {'message': messages}
            await self.send(text_data=json.dumps(message))
            await self.close()
            return


        try:
            response = requests.get('https://auth-service:8000/list_blocked_user/', cookies={'token': token, 'userId': self.userId}, verify=False)#, params={'UserId': self.userId}) # TODO verify token instead #verify false for self signed
            # response = requests.get('https://127.0.0.1:8000/list_blocked_user/', cookies=cookies, verify=False)#, params={'UserId': self.userId}) # TODO verify token instead #verify false for self signed
            print(f"Reponse blocklist: {response.text}", flush=True)
        except requests.exceptions.RequestException as e: # TODO : remove http (used for processing)
            print(f"HTTPS request failed: {e}, trying HTTP")

        print("=======Recipient_id: " + str(recipient_id.id), flush=True)
        print("---------UserName: " + user.username, flush=True)
        
        if (user.username <= recipient):
            group_name = user.username + recipient
        else:
            group_name = recipient + user.username
        print("==--== chat_group_name: " + group_name, flush=True)
        # self.chat_group_name = f'chat_1' #to change to user + destinataire
       
        # current_channels = await self.channel_layer.groups_channels(group_name)
        # if (any(group_name == channel for channel in current_channels)):
        #     print("Oui", flush=True)

        self.chat_group_name = group_name
        # user = User.objects.get(id=userId)

        await self.channel_layer.group_add(
            self.chat_group_name,
            self.channel_name
        )
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