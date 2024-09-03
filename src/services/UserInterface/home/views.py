from django.shortcuts import render

def master(request):
    return render(request, 'home/master.html')

# def index(request):
#     return render(request, 'home/index.html')

# def login(request):
#     return render(request, 'home/login.html')

# def game(request):
#     return render(request, 'home/game.html')

def register(request):
    return render(request, 'home/register.html')

def lologin(request):
    return render(request, 'home/lologin.html')

def load_page(request, page):
    # Determine if the request is an AJAX request (for SPA)
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        # Return only the requested page's content
        return render(request, f'home/{page}.html')
    
    # For a full page load, render the master template with the requested page's content
    return render(request, 'home/master.html', {'content': f'home/{page}.html'})