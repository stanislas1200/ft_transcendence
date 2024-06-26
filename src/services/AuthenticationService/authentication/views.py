from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
import requests, secrets
from .models import UserToken

@csrf_exempt
# 42 auth
@require_GET
def oauth42(request):
	try:
		UID = 'u-s4t2ud-f6e2f9902e965f2b11b3ee48fc025fbd8eb3d48b31242eb666d2a5bdb6c56166' # TODO : .env
		SECRET = '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'
		code = request.GET.get('code')
		if not code:
			return JsonResponse({'error': 'Missing code'}, status=400)
		# Exchange the authorization code for an access token
		response = requests.post('https://api.intra.42.fr/oauth/token', data={
			'grant_type': 'authorization_code',
			'client_id': UID,
			'client_secret': SECRET,
			'code': code,
			'redirect_uri': 'http://127.0.0.1:8000/oauth42',  # Replace with your redirect URI
		})
		
		if response.status_code == 200:
			data = response.json()
			access_token = data['access_token']
			# Get the user's profile
			response = requests.get('https://api.intra.42.fr/v2/me', headers={
				'Authorization': f'Bearer {access_token}',
			})
			if response.status_code == 200:
				data = response.json()
				username = data['login']
				email = data['email']

				# Check if a user with this email already exists
				if not User.objects.filter(email=email).exists():
					if User.objects.filter(username=username).exists():
						username += secrets.token_hex(4)
						if User.objects.filter(username=username).exist(): # TODO : improve
							return JsonResponse({'error': 'Username already taken'}, status=400)
					# Create a new user
					User.objects.create_user(username=username, email=email)
				user = User.objects.get(email=email)
				login(request, user)
				token = secrets.token_hex(16)
				UserToken.objects.update_or_create(user=user, defaults={'token': token})
			return JsonResponse({'message': f'Logged in successfully as {username}'})
		else:
			return JsonResponse({'error': 'Failed to get access token'}, status=400)
	except:
		return JsonResponse({'error': 'Failed to login'}, status=400)

@csrf_exempt # Disable CSRF protection for this view
@require_POST
def register(request): # TODO : login at same time ?
	try:
		username = request.POST.get('username')
		password = request.POST.get('password')
		email = request.POST.get('email')
		if not username or not password or not email:
			return JsonResponse({'error': 'Missing required fields'}, status=400)
		if User.objects.filter(username=username).exists():
			return JsonResponse({'error': 'Username already taken'}, status=400)
		if User.objects.filter(email=email).exists():
			return JsonResponse({'error': 'Email already taken'}, status=400)
		User.objects.create_user(username=username, password=password, email=email)
		return JsonResponse({'message': 'User registered successfully'})
	except:
		return JsonResponse({'error': 'Failed to register user'}, status=400)

@csrf_exempt # Disable CSRF protection for this view
@require_POST
# login  # TODO : check
def login_view(request):
	try:
		username = request.POST.get('username')
		password = request.POST.get('password')
		if not username or not password:
			return JsonResponse({'error': 'Missing required fields'}, status=400)
		user = authenticate(request, username=username, password=password) # slow
		if not user: # TODO : handle email
			username = User.objects.get(email=username).username
			print(username)
			user = authenticate(request, username=username, password=password)
		if user is not None:
			login(request, user)
			token = secrets.token_hex(16)
			UserToken.objects.update_or_create(user=user, defaults={'token': token})
			return JsonResponse({'token': token})
		else:
			return JsonResponse({'error': 'Invalid login credentials'}, status=400)
	except:
		return JsonResponse({'error': 'Failed to login'}, status=400)
	
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
		'email': user.email
	}

@csrf_exempt # Disable CSRF protection for this view
@require_GET
def me(request):
	# session_key = request.session.session_key
	if request.user.is_authenticated:
		return JsonResponse(user_to_dict(request.user))
	else:
		auth_header = request.META.get('HTTP_AUTHORIZATION', '')
		token = auth_header.split(' ')[1] if ' ' in auth_header else ''
		if (UserToken.objects.filter(token=token).exists()):
			user = UserToken.objects.get(token=token).user
			# login(request, user)
			# print("do I need login ?")
			return JsonResponse(user_to_dict(user))
		return JsonResponse({'error': 'User is not logged in'}, status=400)

@csrf_exempt # Disable CSRF protection for this view
# service comunication
def get_user_from_session(request): # TODO : remove and use /me ?
	session_key = request.GET.get('session_key')
	token = request.GET.get('token')
	if not session_key:
		if UserToken.objects.filter(token=token).exists():
			user = UserToken.objects.get(token=token).user
		else:
			return JsonResponse({'error': 'Invalid token'}, status=400)
	else:
		sess = Session.objects.get(session_key=session_key)
		uid = sess.get_decoded().get('_auth_user_id')
		user = User.objects.get(id=uid)
	return JsonResponse({'username': user.username, 'email': user.email})


from django.http import HttpResponse
import os
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
	with open(os.path.join(os.path.dirname(__file__), 'templates/pong.js'), 'r') as file:
		data = file.read()
	return HttpResponse(data, content_type='text/javascript')