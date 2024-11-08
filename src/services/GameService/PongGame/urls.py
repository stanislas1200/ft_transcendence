from django.urls import path, re_path
from . import views

urlpatterns = [
    # path('start/', views.start_game, name='start_game'),
    # re_path(r'^game/(?P<game_id>\d+)/move$', views.record_move, name='record_move'),
    # re_path(r'^game/(?P<game_id>\d+)/state$', views.get_game_state, name='game_state'),
    # re_path(r'^game/(?P<game_id>\d+)/end$', views.end_game, name='end_game'),
	# re_path(r'^game/(?P<game_id>\d+)/join$', views.join_game, name='join_game'),
	path('list', views.list_game, name='list_game'),
	path('party', views.get_party),
	path('join', views.join_game),
	path('create', views.start_game),
	path('action', views.record_move),
	path('state', views.get_game_state),
	path('leave', views.leave_game),
	path('stats', views.get_stats),
	path('hist', views.get_history),
	path('create_tournament', views.create_tournament),
	path('join_tournament/<int:tournament_id>', views.join_tournament),
	path('get_tournament/<int:tournament_id>', views.get_tournament),
	path('list_achievements', views.list_achievements),
	path('send-notification/', views.send_notification),
	path('list_tournament', views.list_tournament),
	path('leaderboard', views.leaderboard),

	path('search', views.search)
	
    # # User-related endpoints...
    # path('users', views.list_users, name='list_users'),  # Lists all users
    # path('users/<int:user_id>', views.get_user, name='get_user'),  # Gets a specific user's profile
    # path('users/<int:user_id>', views.update_user, name='update_user'),  # Updates a specific user's profile
    # path('users/<int:user_id>/games', views.get_user_games, name='get_user_games'),  # Gets all games a user is part of

]
