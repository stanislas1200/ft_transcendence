# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from .views import get_user
from room.models import Chat, Message
from asgiref.sync import sync_to_async
import requests 
from django.db.models import Q

def _get_chat_room(user, recipient):
    try:
        chats = Chat.objects.filter(users=user)
        for chat in chats:
            if chat.users.filter(id=recipient.id).exists():
                return chat
    except Chat.DoesNotExist:
        pass

    chat = Chat.objects.create()
    chat.users.add(user)
    chat.users.add(recipient)
    return chat

class TChatConsumer(AsyncWebsocketConsumer):
    async def update_history_state(self, event):
        await self.send(text_data=json.dumps(event['history']))
    
    async def connect(self):
        self.userId         = self.scope["url_route"]["kwargs"]["UserId"] #get user id
        recipient_username  = self.scope["url_route"]["kwargs"]["Recipient"]
        self.token          = self.scope["url_route"]["kwargs"]["token"]

        self.user = await sync_to_async(get_user)(self.userId) #get user name
        try:    
            self.recipient = await sync_to_async(User.objects.get)(username=recipient_username)
        except User.DoesNotExist:
            await self.accept()
            messages = f'"error:" no user found called: \"{str(recipient_username)}\"'
            message = {'message': messages}
            await self.send(text_data=json.dumps(message))
            await self.close()
            return

        if (await self._check_if_recipient_is_blocked(self.recipient, self.user.username)):
            print("Ah oui oui OUI comme dirait Niska")
        else:
            print("NOOON")
        
        if (self.user.username <= recipient_username):
            group_name = self.user.username + recipient_username
        else:
            group_name = recipient_username + self.user.username
        # print("==--== chat_group_name: " + group_name, flush=True)

        # get or create room in db
        self.chat = await sync_to_async(_get_chat_room)(self.user, self.recipient)
        print(self.chat, flush=True)

        self.chat_group_name = group_name
        await self.channel_layer.group_add(
            self.chat_group_name,
            self.channel_name
        )
        await self.accept()
        await self.channel_layer.group_send(
            self.chat_group_name,
            {
                'type': 'update_history_state',
                'history': {
                    'history': model_to_dict(self.chat.message)
                }
            }
        )


    async def _check_if_recipient_is_blocked(self, recipient, username):
        url = 'https://auth-service:8000/list_blocked_user/'
        try:
            response = requests.get(url, cookies={'token': self.token, 'userId': str(recipient.id)}, verify=False)
            block_list = response.json()
            
            for users in block_list['blocked_user']:
                if (users['username'] == username):
                    print(recipient, " is blocked", flush=True)
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
        if (await self._check_if_recipient_is_blocked(self.recipient, self.user.username)):
            return
        small_msg =  json.loads(text_data)['message']
        if not (small_msg):
            return
        # create message
        message = await sync_to_async(Message.objects.create)(user=self.user, content=small_msg)
        await sync_to_async(self.chat.messages.add)(message)
        print(message, flush=True)

        await self.channel_layer.group_send(
            self.chat_group_name,
            {
                'type': 'update_message_state',
                'message': {
                    'sender': self.user.username,
                    'message': small_msg
                }
            }
        )