# routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<Recipient>\w+)/$', consumers.TChatConsumer.as_asgi()),
]
