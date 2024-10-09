from django.shortcuts import render

from .models import Room

# @login_required
def room(request):
    print("Rooms view accessed")  # Debugging statement
    rooms = Room.objects.all()
    return render(request, 'room/room.html', {'room': room})

