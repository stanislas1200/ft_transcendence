# routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<UserId>\d+)/(?P<Recipient>\w+)/(?P<token>\w+)/$', consumers.TChatConsumer.as_asgi()),
]
