from django.shortcuts import render

from .models import Room

# @login_required
def rooms(request):
    print("Rooms view accessed")  # Debugging statement
    rooms = Room.objects.all()
    return render(request, 'room/rooms.html', {'rooms': rooms})
