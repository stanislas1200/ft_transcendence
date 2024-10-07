# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from .views import get_user
from asgiref.sync import sync_to_async
import requests 

# def blocked(user):
#     return user.blocked

class TChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.userId = self.scope["url_route"]["kwargs"]["UserId"] #get user id
        recipient   = self.scope["url_route"]["kwargs"]["Recipient"]
        self.token  = self.scope["url_route"]["kwargs"]["token"]
        print("=======Recipient: " + recipient, flush=True)
        print("+=====token: " + self.token, flush=True)
        # if not (recipient):
        #     recipient = "Guigz"
        self.user = await sync_to_async(get_user)(self.userId) #get user name
        # recipient_exist = await sync_to_async(get_user)(recipient) # get destinataire
        # cookies = dict(cookies_are='token')
        # print(f'Token being sent: {cookies}')
        try:    
            self.recipient_id = await sync_to_async(User.objects.get)(username=recipient)
            # print(self.recipient_id, " fkldjsflksjdflkj\n", flush=True)
        except User.DoesNotExist:
            await self.accept()
            messages = f'"error:" no user found called: \"{str(recipient)}\"'
            message = {'message': messages}
            await self.send(text_data=json.dumps(message))
            await self.close()
            return

        # blockeds = await sync_to_async(blocked)(user)
        print("OOOOOOOOEEEEEEEEEE", flush=True)

        # blockedlist = await sync_to_async(user.blocked)
        # print(blockeds, flush=True)
        # print(recipient_id.blocked, flush=True)
        if (await self._check_if_recipient_is_blocked(self.recipient_id, self.user.username)):
            print("Ah oui oui OUI comme dirait Niska")
        else:
            print("NOOON-----------------------------------------")
        # try:
        #     response = requests.get('https://auth-service:8000/list_blocked_user/', cookies={'token': self.token, 'userId': str(recipient_id.id)}, verify=False)
        #     print(f"Reponse blocklist: {response.text}", flush=True)
        #     # block_list = json.loads(response.text)
        #     block_list = response.json()
        #     for users in block_list['blocked_user']:
        #         print(users['username'], flush=True)
        #     print(block_list['blocked_user'])
        #     for users in block_list['blocked_user']:
        #         print("continue " + user.username, flush=True)
        #         print(users['username'], flush=True)
        #         if (users['username'] == user.username):
        #             print("KOIIIIII", flush=True)
        # except requests.exceptions.RequestException as e:
        #     print(f"Block list request failed: {e}")

        # print("=======Recipient_id: " + str(recipient_id.id), flush=True)
        # print("---------UserName: " + user.username, flush=True)
        
        if (self.user.username <= recipient):
            group_name = self.user.username + recipient
        else:
            group_name = recipient + self.user.username
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

    async def _check_if_recipient_is_blocked(self, recipient_id, username):
        url = 'https://auth-service:8000/list_blocked_user/'
        try:
            response = requests.get(url, cookies={'token': self.token, 'userId': str(recipient_id.id)}, verify=False)
            block_list = response.json()
            ##
            # print("------------------------------------", flush=True)
            # for users in block_list['blocked_user']:
            #     print(users['username'], flush=True)
            # print("------------------------------------", flush=True)
            ##
            for users in block_list['blocked_user']:
                if (users['username'] == username):
                    print("KOIIIIII", flush=True)
                    return True
            return False
        except requests.exceptions.RequestException as e:
            print(f"Block list request failed: {e}")
            return False

    async def disconnect(self, close_code):
        self.close()

    async def update_message_state(self, event):
        await self.send(text_data=json.dumps(event['message']))

    async def receive(self, text_data):
        print("In receive", flush=True)
        if (await self._check_if_recipient_is_blocked(self.recipient_id, self.user.username)):
            return
        small_msg =  json.loads(text_data)['message']
        if not (small_msg):
            return
        message = f'{self.user}: {small_msg}'
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