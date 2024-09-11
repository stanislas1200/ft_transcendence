"""
ASGI config for Tchat project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from Tchat import consumers

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Tchat.settings')

# Get the standard Django ASGI application
django_asgi_app = get_asgi_application()

# Define WebSocket routing
websocket_urlpatterns = [
    path('ws/chat/', consumers.TChatConsumer.as_asgi()),  # Adjust the path and consumer
]

# Create the ASGI application
application = ProtocolTypeRouter({
    "http": django_asgi_app,  # Handles traditional HTTP requests
    "websocket": AuthMiddlewareStack(  # Handles WebSocket connections with session authentication
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
