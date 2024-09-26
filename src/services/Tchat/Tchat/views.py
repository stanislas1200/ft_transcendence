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
