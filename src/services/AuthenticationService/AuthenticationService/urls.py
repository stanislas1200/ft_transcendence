
from django.contrib import admin
from django.urls import path
# from . import views
from authentication.views import update_user, register, login_view, logout_view, oauth42, me, get_user_from_session, views_game, get_css, get_game_page, get_js

urlpatterns = [
    path('admin/', admin.site.urls),
    path('register', register),
    path('login', login_view),
    path('logout', logout_view),
    path('oauth42/', oauth42),
    path('me', me),
    path('get_user/', get_user_from_session),
    path('users/<int:user_id>', update_user)
]

# urlpatterns = [
# 	path('admin/', views.admin.site.urls),
# 	path('register', views.register),
# 	path('login', views.login_view),
# 	path('logout', views.logout_view),
# 	path('oauth42/', views.oauth42),
# 	path('me', views.me),
# 	path('get_user/', views.get_user_from_session),
# 	path('users/<int:user_id>', views.update_user),
    
# 	# path('views/', views_game, name='views_game'),
# 	# path('views/main.css', get_css, name='views_game'),
# 	# path('game/main.css', get_css, name='views_game'),
# 	# path('game/', get_game_page, name='views_game'),
# 	# path('game/pong.js', get_js)
# ]
