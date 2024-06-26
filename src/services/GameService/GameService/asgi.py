"""
ASGI config for GameService project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'GameService.settings')
import django
django.setup()  # Ensure Django is set up before using models
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from channels.auth import AuthMiddlewareStack
from channels.sessions import SessionMiddlewareStack
import PongGame.routing


application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    "websocket": SessionMiddlewareStack(
        URLRouter(
            PongGame.routing.websocket_urlpatterns
        )
    ),
})
