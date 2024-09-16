from django.http import HttpResponse

def homepage(request):
    return HttpResponse("Hello welcome to ft_transcandance chat")

def about(request):
    return HttpResponse("So you gonna soon be able to chat with this django module")
