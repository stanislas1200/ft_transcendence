from django.http import HttpResponse
from django.contrib.auth.models import User
from django.shortcuts import render

def get_user(userId):
    return User.objects.get(id=userId)

def homepage(request):
    return HttpResponse("Hello welcome to ft_transcandance chat")

def about(request):
    return HttpResponse("So you gonna soon be able to chat with this django module")

def chatpage(request):
    return render(request, 'Tchat/home.html')

# @csrf_exempt # Disable CSRF protection for this view
# @require_POST
def add_new_private_room(request, user_id):
	print("OOOOOOOOEEEEEEEEEE", flush=True)
	# # request.GET.get('token')
	# # status = verify_token(request)
	# try:
	# 	u_id = request.COOKIES.get('userId')
	# 	# if request.user.is_authenticated:
	# 	# 	user = request.user
	# 	# else:
	# 	# 	status = verify_token(request)
	# 	# 	if (status == 200):
	# 	# 		u_id = request.GET.get('UserId')
	# 	# 		if not u_id:
	# 	# 			u_id = request.COOKIES.get('userId')

    #     user = User.objects.get(id=user_id)
	# 		# else:
	# 		# 	return JsonResponse({'error': 'User is not logged in'}, status=401)

	# 	if not User.objects.filter(id=user_id).exists():
	# 		return JsonResponse({'error': 'User not found'}, status=404)
	# 	user_to_block = User.objects.get(id=user_id)
		
	# 	if Block.objects.filter(blocker=user, blocked=user_to_block).exists():
	# 		return JsonResponse({'error': 'User is already blocked'}, status=400)
		
	# 	if user == user_to_block:
	# 		return JsonResponse({'error': 'Users cannot send requests to themselves'}, status=403)

	# 	Room.objects.create(blocker=user, blocked=user_to_block)
	# 	# remove_friend(request, user_id)
	# 	return JsonResponse({'message': 'User blocked successfully'})
	# except ObjectDoesNotExist:
	# 	return JsonResponse({'error': 'Object not found'}, status=404)
	# except:
	# 	return JsonResponse({'error': 'Server error'}, status=500)

    # try:
	# 	u_id = request.COOKIES.get('userId')
	# 	# if request.user.is_authenticated:
	# 	# 	user = request.user
	# 	# else:
	# 	# 	status = verify_token(request)
	# 	# 	if (status == 200):
	# 	# 		u_id = request.GET.get('UserId')
	# 	# 		if not u_id:
	# 	# 			u_id = request.COOKIES.get('userId')

	# 	user = User.objects.get(id=u_id)
	# 	# 	else:
	# 	# 		return JsonResponse({'error': 'User is not logged in'}, status=401)
		