from django.urls import path
from . import views

# urlpatterns = [
#     path('', views.master, name='master'),
#     path('index/', views.index, name='index'),
#     path('login/', views.login, name='login'),
#     path('game/', views.game, name='game'),
#     path('lologin/', views.lologin, name='game'),
# ]

urlpatterns = [
    path('', views.load_page, {'page': 'index'}, name='index'),
    path('<str:page>/', views.load_page, name='load_page'),
]
