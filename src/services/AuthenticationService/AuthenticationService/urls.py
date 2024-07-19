
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
    path('oauth42/', views.oauth42),
    path('me', views.me),
    path('get_user/', views.get_user_from_session),
    path('users/<int:user_id>/edit', views.update_user),
    path('users/<int:user_id>/avatar', views.get_avatar)
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
