
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from authentication import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('register', views.register),
    path('login', views.login_view),
    path('logout', views.logout_view),
    path('oauth42', views.oauth42),
    path('me', views.me),
    path('verify_token/', views.verify_user_token),
    path('users/<int:user_id>', views.get_user_info),
    path('users/<int:user_id>/edit', views.update_user),
    path('users/<int:user_id>/avatar', views.get_avatar), # call pour la pp

	path('game/main.css', views.get_css, name='views_game'),
	path('game/', views.get_game_page, name='views_game'),
	path('game/pong.js', views.get_js),

    
    path('send-request/<int:user_id>/', views.send_friend_request, name='send_friend_request'),
    path('accept-request/<int:request_id>/', views.accept_friend_request, name='accept_friend_request'),
    path('decline-request/<int:request_id>/', views.decline_friend_request, name='decline_friend_request'),
    path('friends/<int:user_id>/', views.list_friends, name='list_friends'),
    path('list_request/', views.list_friend_requests, name='list_request'),
    path('remove_friend/<int:user_id>/', views.remove_friend, name='remove_friend'),
    path('block_user/<int:user_id>/', views.block_user, name='block_user'),
    path('list_blocked_user/', views.list_blocked_user, name='list_blocked_user'),
    path('unblock_user/<int:user_id>/', views.unblock_user, name='unblock_user'),
    path('delete_user/', views.delete_user, name='delete_user'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

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
