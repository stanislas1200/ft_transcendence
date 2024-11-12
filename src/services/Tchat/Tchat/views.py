from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.shortcuts import render
from room.models import Chat, Message
import os, json

def get_user(userId):
    return User.objects.get(id=userId)

def homepage(request):
    return HttpResponse("Hello welcome to ft_transcandance chat")

def about(request):
    return HttpResponse("So you gonna soon be able to chat with this django module")


def get_chat(user_id, user):
	chats = Chat.objects.filter(users__username='AI')
	for chat in chats:
			if chat.users.filter(id=user_id).exists():
				return chat

	chat = Chat.objects.create()
	recipient = User.objects.get(id=user_id)
	chat.users.add(user)
	chat.users.add(recipient)
	return chat

def system_message(request, message=None):
	if request:
		internal_secret = request.headers.get('X-Internal-Secret')

		if internal_secret != os.environ['INTERNAL_SECRET']:
			return JsonResponse({'error': 'Unauthorized access'}, status=403)

	if not message:
		data = request.body.decode()
		data = json.loads(data)
		message = data.get('message')
		users_id = data.get('users_id')

	user = User.objects.get(username='AI')
	incoming_data = message.get('data', {})
	content = incoming_data.get('content')

	for uid in users_id:
		chat = get_chat(uid, user)
		message = Message.objects.create(user=user, content=content)
		chat.messages.add(message)

	# if message and users_id:
	# 	channel_layer = get_channel_layer()

	# 	for name in users_name:
	# 		if (name <= 'AI'):
	# 			group_name = name + 'AI'
	# 		else:
	# 			group_name = 'AI' + name

	# 		async_to_sync(channel_layer.group_send)(
	# 			group_name,
	# 			{
	# 				'type': 'send_notification',
	# 				'message': message
	# 			}
	# 		)
	return JsonResponse({'status': 'Message sent'})