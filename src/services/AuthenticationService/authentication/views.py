from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password, password_changed
from django.core.validators import validate_email, validate_unicode_slug, validate_image_file_extension
from django.contrib.sessions.models import Session
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.decorators import login_required
import requests, secrets, os
from .models import UserToken, Friendship, FriendRequest, Block
from django.core.exceptions import ObjectDoesNotExist

from django.core.files.images import get_image_dimensions

from PIL import Image, ImageSequence
from io import BytesIO
from django.core.files.base import ContentFile
from django.utils import timezone

from django.shortcuts import get_object_or_404

def friend_request_notif(sender, receiver):
	message = {
		"type": "friend_request",
		"data": {
			"title": "Friend Request",
			"content": f"{sender.username} sent you a friend request",
			"timestamp": timezone.now().isoformat(),
			"user_id": receiver.id,
			"metadata": {
				"requester_id": sender.id,
				"requester_name": sender.username
			}
		}
	}
	return message

def friend_request_accept_notif(sender, receiver):
	message = {
		"type": "friend_request_accepted",
		"data": {
			"title": "Friend Request Accepted",
			"content": f"{sender.username} accepted your friend request",
			"timestamp": timezone.now().isoformat(),
			"user_id": receiver.id,
			"metadata": {
				"requester_id": sender.id,
				"requester_name": sender.username
			}
		}
	}
	return message

def send_notif(message, user_id):
	headers = {
		'X-Internal-Secret': 'my_internal_secret_token'
	}
	response = requests.post(f'https://game-service:8001/game/send-notification/', headers=headers, json={"user_id": [user_id], "message": message}, verify=False)

@csrf_exempt # Disable CSRF protection for this view
@require_POST
def send_friend_request(request, user_id):
	try:
		if request.user.is_authenticated:
			sender = request.user
		else:
			status = verify_token(request)

			if (status == 200):
				u_id = request.GET.get('UserId')
				if not u_id:
					u_id = request.COOKIES.get('userId')

				sender = User.objects.get(id=u_id)
			else:
				return JsonResponse({'error': 'User is not logged in'}, status=401)
		if not User.objects.filter(id=user_id).exists():
			return JsonResponse({'error': 'User not found'}, status=404)
		receiver = User.objects.get(id=user_id)
		if sender == receiver:
			return JsonResponse({'error': 'Users cannot send requests to themselves'}, status=403)
		
		if Friendship.objects.filter(user1=sender, user2=receiver).exists() or Friendship.objects.filter(user1=receiver, user2=sender).exists():
			return JsonResponse({'error': 'Users are already friends'}, status=409)
		
		friend_request, created = FriendRequest.objects.get_or_create(sender=sender, receiver=receiver)
		
		if created:
			message = friend_request_notif(sender, receiver)
			send_notif(message, receiver.id)
			return JsonResponse({'message': 'Successfully sent request'})
		else:
			return JsonResponse({'error': 'Friend request already exists'}, status=409) # TODO : check sender receiver and receiver sender 
	except:
		return JsonResponse({'error': 'Server error'}, status=500)

@csrf_exempt # Disable CSRF protection for this view
@require_POST
def accept_friend_request(request, request_id):
	try:
		if request.user.is_authenticated:
			user = request.user
		else:
			status = verify_token(request)
			if (status == 200):
				u_id = request.GET.get('UserId')
				if not u_id:
					u_id = request.COOKIES.get('userId')

				user = User.objects.get(id=u_id)
			else:
				return JsonResponse({'error': 'User is not logged in'}, status=401)

		if not FriendRequest.objects.filter(id=request_id).exists():
			return JsonResponse({'error': 'Request not found'}, status=404)
		friend_request = FriendRequest.objects.get(id=request_id)
		if friend_request.receiver == user:
			Friendship.objects.create(user1=friend_request.sender, user2=friend_request.receiver)
			friend_request_accept_notif(user2, user1)
			send_notif(message, user1.id)
			friend_request.delete()
			return JsonResponse({'message': 'Successfully accepted request'})
			
		return JsonResponse({'error': "You can't accept this request"}, status=403)
	except:
		return JsonResponse({'error': 'Server error'}, status=500)

@csrf_exempt # Disable CSRF protection for this view
@require_POST
def remove_friend(request, user_id):
	try:
		if request.user.is_authenticated:
			user = request.user
		else:
			status = verify_token(request)
			if (status == 200):
				u_id = request.GET.get('UserId')
				if not u_id:
					u_id = request.COOKIES.get('userId')

				user = User.objects.get(id=u_id)
			else:
				return JsonResponse({'error': 'User is not logged in'}, status=401)
		friends = user.friends
		
		if not any(friend.id == user_id for friend in friends):
			return JsonResponse({'error': 'User is not a friend'}, status=404)

		if Friendship.objects.filter(user1=user, user2__id=user_id).exists():
			Friendship.objects.get(user1=user, user2__id=user_id).delete()
		elif Friendship.objects.filter(user2=user, user1__id=user_id).exists():
			Friendship.objects.get(user2=user, user1__id=user_id).delete()

		return JsonResponse({'message': 'Friend removed'})
	except ObjectDoesNotExist:
		return JsonResponse({'error': 'User or friendship not found'}, status=404)
	except:
		return JsonResponse({'error': 'Server error'}, status=500)

@csrf_exempt # Disable CSRF protection for this view
@require_POST
def decline_friend_request(request, request_id):
	try:
		if request.user.is_authenticated:
			user = request.user
		else:
			status = verify_token(request)
			if (status == 200):
				u_id = request.GET.get('UserId')
				if not u_id:
					u_id = request.COOKIES.get('userId')

				user = User.objects.get(id=u_id)
			else:
				return JsonResponse({'error': 'User is not logged in'}, status=401)
		
		if not FriendRequest.objects.filter(id=request_id).exists():
			return JsonResponse({'error': 'Request not found'}, status=404)
		friend_request = FriendRequest.objects.get(id=request_id)
		if friend_request.receiver == user or friend_request.sender == user:
			friend_request.delete()
			return JsonResponse({'message': 'Successfully declined request'})
			
		return JsonResponse({'error': "You can't decline this request"}, status=403)
	except:
		return JsonResponse({'error': 'Server error'}, status=500)

@require_GET
def list_friends(request, user_id):
	try:
		# TODO: add option to set as private
		if not User.objects.filter(id=user_id).exists():
			return JsonResponse({'error': 'User not found'}, status=404)
		user = User.objects.get(id=user_id)
		friends = user.friends
		return JsonResponse({'friends': [{'id': friend.id, 'username': friend.username} for friend in friends]})
	except:
		return JsonResponse({'error': 'Server error'}, status=500)

@require_GET
def list_friend_requests(request):
	try:
		if request.user.is_authenticated:
			user = request.user
		else:
			status = verify_token(request)
			if (status == 200):
				u_id = request.GET.get('UserId')
				if not u_id:
					u_id = request.COOKIES.get('userId')

				user = User.objects.get(id=u_id)
			else:
				return JsonResponse({'error': 'User is not logged in'}, status=401)
			
		received_requests = FriendRequest.objects.filter(receiver=user)
		sent_requests = FriendRequest.objects.filter(sender=user)
		return JsonResponse({
			'received_requests': [{'id': request.id, 'sender': request.sender.username} for request in received_requests],
			'sent_requests': [{'id': request.id, 'receiver': request.receiver.username} for request in sent_requests]
		})
	except:
		return JsonResponse({'error': 'Server error'}, status=500)

@require_GET
def list_blocked_user(request):
	try:
		# if request.user.is_authenticated:
		# 	user = request.user
		# else:
		# 	status = verify_token(request) # TODO : check cuz not working for tchat
		# 	if (status == 200):
		# 		u_id = request.GET.get('UserId')
		# 		if not u_id:
		# 			u_id = request.COOKIES.get('userId')

		# 		user = User.objects.get(id=u_id)
		# 	else:
		# 		return JsonResponse({'error': 'User is not logged in'}, status=401)
		
		return JsonResponse({'blocked_user': [{'id': b.id, 'username': b.username} for b in user.blocked]})

	except ObjectDoesNotExist:
		return JsonResponse({'error': 'Object not found'}, status=404)
	except Exception as e:
		print(e, flush=True)
		return JsonResponse({'error': 'Server error'}, status=500)

@csrf_exempt # Disable CSRF protection for this view
@require_POST
def block_user(request, user_id):
	try:
		if request.user.is_authenticated:
			user = request.user
		else:
			status = verify_token(request)
			if (status == 200):
				u_id = request.GET.get('UserId')
				if not u_id:
					u_id = request.COOKIES.get('userId')

				user = User.objects.get(id=u_id)
			else:
				return JsonResponse({'error': 'User is not logged in'}, status=401)

		if not User.objects.filter(id=user_id).exists():
			return JsonResponse({'error': 'User not found'}, status=404)
		user_to_block = User.objects.get(id=user_id)
		
		if Block.objects.filter(blocker=user, blocked=user_to_block).exists():
			return JsonResponse({'error': 'User is already blocked'}, status=400)
		
		if user == user_to_block:
			return JsonResponse({'error': 'Users cannot send requests to themselves'}, status=403)

		Block.objects.create(blocker=user, blocked=user_to_block)
		remove_friend(request, user_id)
		return JsonResponse({'message': 'User blocked successfully'})
	except ObjectDoesNotExist:
		return JsonResponse({'error': 'Object not found'}, status=404)
	except:
		return JsonResponse({'error': 'Server error'}, status=500)

@csrf_exempt # Disable CSRF protection for this view
@require_POST
def unblock_user(request, user_id):
	try:
		if request.user.is_authenticated:
			user = request.user
		else:
			status = verify_token(request)
			if (status == 200):
				u_id = request.GET.get('UserId')
				if not u_id:
					u_id = request.COOKIES.get('userId')

				user = User.objects.get(id=u_id)
			else:
				return JsonResponse({'error': 'User is not logged in'}, status=401)
		
		if not Block.objects.filter(blocker=user, blocked__id=user_id).exists():
			return JsonResponse({'error': 'User is not blocked'}, status=404)

		block = Block.objects.get(blocker=request.user, blocked__id=user_id)
		block.delete()
		return JsonResponse({'message': 'User unblocked successfully'})
	except ObjectDoesNotExist:
		return JsonResponse({'error': 'Object not found'}, status=404)
	except:
		return JsonResponse({'error': 'Server error'}, status=500)


def compress_gif(avatar):
	with Image.open(avatar) as img:
		# 'P' mode for palette
		img = img.convert('P', palette=Image.ADAPTIVE, colors=128)  # Reducing colors to 128

		img_byte_arr = BytesIO()
		img.save(img_byte_arr, format='GIF', optimize=True)
		img_byte_arr = img_byte_arr.getvalue()

	compressed_avatar = ContentFile(img_byte_arr, name=avatar.name)
	return compressed_avatar

def crop_gif(avatar, crop_area, name):
	
	with Image.open(avatar) as img:
		frames = []
		duration = img.info.get('duration', 100)
		loop = img.info.get('loop', 0)

		for frame in ImageSequence.Iterator(img):
			cropped_frame = frame.crop(crop_area)
			frame = frame.resize((frame.size[0] // 2, frame.size[1] // 2))
			frames.append(cropped_frame)

		gif_bytes_io = BytesIO()
		frames[0].save(gif_bytes_io, format='GIF', save_all=True, append_images=frames[1:], optimize=True, duration=duration, loop=loop)
		gif_bytes_io.seek(0)
		compressed_avatar = ContentFile(gif_bytes_io.getvalue(), name=name)

		return compressed_avatar

def process_avatar(avatar, content_type):
	image = Image.open(avatar)
	w, h = image.size

	if hasattr(avatar, 'size'):
		avatar_size = avatar.size
	else:
		avatar_size = avatar.getbuffer().nbytes

	# compatible if convert to jpeg 
	# if image.mode in ('RGBA', 'LA', 'P'):
	# 	image = image.convert('RGB')

	buffer = BytesIO()

	# validate dimensions
	if w != h:
		new_size = min(w, h)
		# TODO : use Middle ?
		left = (w - new_size)/2
		top = (h - new_size)/2
		right = (w + new_size)/2
		bottom = (h + new_size)/2
		if content_type == 'image/gif':
			avatar = crop_gif(avatar, (0, 0, new_size, new_size), avatar.name)
		else:
			image = image.crop((0, 0, new_size, new_size))
			image.save(buffer, format="PNG")



	# Compress the image if it's larger than 500KB
	if avatar_size > (500 * 1024):
		if content_type == 'image/gif':
			avatar = compress_gif(avatar)
		else:
			image.save(buffer, format="PNG", compress_level=9)
			# image.save(buffer, format="JPEG", quality=85)  # Adjust quality for further compression
	
	# Save
	fileName = 'avatar.gif' if content_type == 'image/gif' else 'avatar.png'
	if buffer.tell():
		buffer.seek(0)
		img_byte_arr = buffer.getvalue()
		avatar = ContentFile(img_byte_arr, name=fileName)
	
	return avatar

@csrf_exempt
def get_avatar(request, user_id):
	try:
		user = User.objects.get(id=user_id)
		if (UserToken.objects.filter(user=user).exists()):
			profile = UserToken.objects.get(user=user)
			if not hasattr(profile, 'avatar') or not profile.avatar:
				return JsonResponse({'error': 'Avatar not found'}, status=404)
			return HttpResponse(profile.avatar.url)

		return JsonResponse({'error': 'User not found'}, status=404)
	except:
		return JsonResponse({'error': 'Server error'}, status=500)

@csrf_exempt
@login_required
def update_user(request, user_id):
	try:
		# Check login
		if request.user.is_authenticated:
			user = request.user
		else:
			status = verify_token(request)
			if (status == 200):
				u_id = request.GET.get('UserId')
				if not u_id:
					u_id = request.COOKIES.get('userId')

				user = User.objects.get(id=u_id)
			else:
				return JsonResponse({'error': 'User is not logged in'}, status=401)

		# Check authorisation
		if user_id != user.id:
			if not user.is_staff:
				return JsonResponse({'error': 'Unauthorized'}, status=403)
			if not User.objects.filter(id=user_id).exists():
				return JsonResponse({'error': 'User not found'}, status=404)
			user = User.objects.get(id=user_id)


		# Get Input
		username = request.POST.get('username')
		email = request.POST.get('email')
		first_name = request.POST.get('first_name')
		last_name = request.POST.get('last_name')
		current_password = request.POST.get('current_password')
		new_password = request.POST.get('new_password')
		avatar = request.FILES.getlist("avatar")
		
		

		# Update User TODO : all user info
		if username and username != user.username:
			validate_unicode_slug(username)
			if User.objects.filter(username=username).exists():
				return JsonResponse({'error': 'Username already taken'}, status=400)
			user.username = username
		if email and email != user.email: # TODO : password to change email
			validate_email(email)
			if User.objects.filter(email=email).exists():
				return JsonResponse({'error': 'Email already taken'}, status=400)
			user.email = email

		if first_name:
			user.first_name = first_name

		if last_name:
			user.last_name = last_name

		user.save()
		if avatar:
			validate_image_file_extension(avatar[0])
			if (UserToken.objects.filter(user=user).exists()):
				profile = UserToken.objects.get(user=user)
				if profile.avatar:
					profile.avatar.delete(save=True)
				profile.avatar = process_avatar(avatar[0], request.FILES['avatar'].content_type)
				profile.save()
			
		if new_password:
			try :
				if not check_password(current_password, user.password):
					return JsonResponse({'error': 'Current password is incorrect'}, status=400)
				validate_password(new_password, user)
				user.set_password(new_password) # TODO : change token ??
				password_changed(new_password, user)
			except Exception as e:
				return JsonResponse({'error': str(e)}, status=400)
		user.save()
		return JsonResponse({'message': f'Successfully updated profile'})
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=400)
	except: # TODO : better except
		return JsonResponse({'error': 'Failed to update user'}, status=400)

# TODO : decorator : ex remove csrf_exempt

@csrf_exempt
# 42 auth
@require_GET
def oauth42(request):
	code = request.GET.get('code', None)
	if not code:
		return JsonResponse({'error': 'Code not provided'}, status=400)
	try:
		# Exchange the authorization code for an access token
		response = requests.post('https://api.intra.42.fr/oauth/token', data={
			'grant_type': 'authorization_code',
			'client_id': os.environ['CLIENT_UID_42'],
			'client_secret': os.environ['CLIENT_SECRET_42'],
			'code': code,
			'redirect_uri': os.environ['OAUTH_REDIRECT_URI'],  # Replace with your redirect URI
		})
		
		if response.status_code != 200:
			return JsonResponse({'error': 'Failed to get access token'}, status=response.status_code)

		data = response.json()
		access_token = data['access_token']
		# Get the user's profile
		response = requests.get('https://api.intra.42.fr/v2/me', headers={
			'Authorization': f'Bearer {access_token}',
		})
		
		if response.status_code != 200:
			return JsonResponse({'error': 'Failed to fetch user data'}, status=response.status_code)

		data = response.json()
		avatarLink = data['image']['link']
		username = data['login']
		email = data['email']

		make_avatar = False
		# Check if a user with this email already exists
		if not User.objects.filter(email=email).exists():
			if User.objects.filter(username=username).exists():
				username += secrets.token_hex(4)
				if User.objects.filter(username=username).exists():
					return JsonResponse({'error': 'Username already taken, please retry'}, status=400)
			# Create a new user
			profile = User.objects.create_user(username=username, email=email, first_name=data['first_name'], last_name=data['last_name'])
			make_avatar = True

		user = User.objects.get(email=email)
		login(request, user)
		token = secrets.token_hex(16)
		hashed_token = make_password(token)
		UserToken.objects.update_or_create(user=user, defaults={'token': hashed_token})

		if make_avatar:
			profile = UserToken.objects.get(token=hashed_token)
			response = requests.get(avatarLink)
			if response.status_code == 200:
				avatar = response.content
				avatar = BytesIO(avatar)
				content_type = response.headers['Content-Type']

				if profile.avatar:
					profile.avatar.delete(save=True)
				profile.avatar = process_avatar(avatar, content_type)
				profile.save()

		response = JsonResponse({'message': f'Logged in successfully as {username}'}, status=201)
		response.set_cookie(key='token', value=token, secure=True, samesite='Strict') # max_age=??
		response.set_cookie(key='userId', value=user.id, samesite='None') 
		return response
	
	except Exception as e:
		return JsonResponse({'error': 'An error occurred while processing your request'}, status=500)

@csrf_exempt # Disable CSRF protection for this view
@require_POST
def register(request):
	try:
		first_name = request.POST.get('first_name')
		last_name = request.POST.get('last_name')
		username = request.POST.get('username')
		password = request.POST.get('password')
		cpassword = request.POST.get('c_password')
		email = request.POST.get('email')

		if not User.objects.filter(username='AI').exists(): # get_or_create Temp so ai have a profile image 
			ai = User.objects.create_user(username='AI')
			UserToken.objects.update_or_create(user=ai, defaults={'token': 'TODO : check if can connect as ai'}) # TODO : check if can connect as ai

		#TODO : uncoment
		# if not username or not password or not email or not first_name or not last_name or not cpassword:
		# 	return JsonResponse({'error': 'Missing required fields'}, status=400)
		if User.objects.filter(username=username).exists():
			return JsonResponse({'error': 'Username already taken'}, status=400)
		if User.objects.filter(email=email).exists():
			return JsonResponse({'error': 'Email already taken'}, status=400)
		# if cpassword != password:
		# 	return JsonResponse({'error': 'password not same'}, status=400)
		User.objects.create_user(username=username, password=password, email=email, first_name=first_name, last_name=last_name)
		return JsonResponse({'message': 'User registered successfully'})
	except:
		return JsonResponse({'error': 'Failed to register user'}, status=400)

@csrf_exempt # Disable CSRF protection for this view
@require_POST
def login_view(request):
	try:
		username = request.POST.get('username')
		password = request.POST.get('password')
		if not username or not password:
			return JsonResponse({'error': 'Missing required fields'}, status=400)
		u = authenticate(request, username=username, password=password) # slow
		if not u:
			if User.objects.filter(email=username).exists():
				username = User.objects.get(email=username).username
				u = authenticate(request, username=username, password=password)
		if u is not None:
			login(request, u)
			token = secrets.token_hex(16)
			hashed_token = make_password(token)
			UserToken.objects.update_or_create(user=u, defaults={'token': hashed_token})
			response = JsonResponse({'message': f'Logged in successfully as {u.username}'}, status=201)
			response.set_cookie(key='token', value=token, secure=True, samesite='Strict') # max_age=??
			response.set_cookie(key='userId', value=u.id, secure=True, samesite='None') # max_age=??
			return response
		else:
			return JsonResponse({'error': 'Invalid login credentials'}, status=400)
	except Exception as e:
		print(e, flush=True)
		return JsonResponse({'error': 'Failed to login'}, status=500)
	
@csrf_exempt # Disable CSRF protection for this view
@require_POST
def logout_view(request):
	try:
		if request.user.is_authenticated:
			UserToken.objects.filter(user=request.user).delete()
		logout(request)
		return JsonResponse({'message': 'Logged out successfully'})
	except:
		return JsonResponse({'error': 'Failed to logout'}, status=400)

def user_to_dict(user):
	return {
		'id': user.id,
		'username': user.username,
		'email': user.email,
		'firstname': user.first_name,
		'lastname': user.last_name
	}

def verify_token(request, token=None, user_id=None):
	if not user_id:
		user_id = request.GET.get('UserId') # need to be in url to work

	if not token:
		token = request.COOKIES.get('token')
	if not user_id:
		user_id = request.COOKIES.get('userId')
	try:
		user_token = UserToken.objects.get(user_id=user_id)
		if check_password(token, user_token.token):
			return 200
		else:
			return 401
	except UserToken.DoesNotExist:
		return 404

@csrf_exempt # Disable CSRF protection for this view
@require_GET
def me(request):
	try:
		session_key = request.session.session_key
		if request.user.is_authenticated:
			return JsonResponse(user_to_dict(request.user))

		status = verify_token(request)
		if (status == 200):
			user_id = request.GET.get('UserId') # need to be in url to work
			if not user_id:
				user_id = request.COOKIES.get('userId')

			user = User.objects.get(id=user_id)
			return JsonResponse(user_to_dict(user))
		elif (status == 401):
			return JsonResponse({'error': 'Invalid token'}, status=401)
		return JsonResponse({'error': 'User token not found'}, status=404)
	except:
		return JsonResponse({'error': 'Server error'}, status=500)

@csrf_exempt # Disable CSRF protection for this view
@require_GET
def get_user_info(request, user_id):
	try:
		user = User.objects.get(id=user_id)
		user = {
			'id': user.id,
			'username': user.username,
			'avatar_url': get_avatar(None, user_id).content.decode()
		}
		return JsonResponse(user)
	except ObjectDoesNotExist:
		return JsonResponse({'error': 'User not found'}, status=404)
	except:
		return JsonResponse({'error': 'Server error'}, status=500)

@csrf_exempt # Disable CSRF protection for this view
# service comunication
def verify_user_token(request): # TODO :add uuid
	try:
		session_key = request.COOKIES.get('session_key')
		session_key = None
		token = request.COOKIES.get('token')
		if not session_key:
			status = verify_token(request, token)
			if (status == 200):
				return JsonResponse({'message': 'Valid token'})
			elif (status == 401):
				return JsonResponse({'error': 'Invalid token'}, status=401)
			return JsonResponse({'error': 'User token not found'}, status=404)
		else:
			sess = Session.objects.get(session_key=session_key)
			uid = sess.get_decoded().get('_auth_user_id')
			verify_token(request, token, uid)
		return JsonResponse({'message': 'Valid token'})
	except:
		return JsonResponse({'error': 'Server error'}, status=500)


# dev
def views_game(request):
	with open(os.path.join(os.path.dirname(__file__), 'templates/home.html'), 'r') as file:
		data = file.read()
	return HttpResponse(data)

# dev
def get_css(request):
	with open(os.path.join(os.path.dirname(__file__), 'templates/main.css'), 'r') as file:
		data = file.read()
	return HttpResponse(data, content_type='text/css')

# dev
def get_game_page(request):
	with open(os.path.join(os.path.dirname(__file__), 'templates/game.html'), 'r') as file:
		data = file.read()
	return HttpResponse(data)

def get_js(request):
	with open(os.path.join(os.path.dirname(__file__), 'templates/GAM.js'), 'r') as file:
		data = file.read()
	# with open(os.path.join(os.path.dirname(__file__), 'templates/pong.js'), 'r') as file:
	# 	data = file.read()
	return HttpResponse(data, content_type='text/javascript')