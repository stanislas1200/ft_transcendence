from django.urls import path
from . import views

urlpatterns = [
    path('', views.load_page, {'page': 'index'}, name='index'),
    path('lologin/', views.lologin, name='lologin'),
    path('register/', views.register, name='register'),
    path('bootstrap/', views.bootstrap, name='bootstrap'),
    path('<str:page>/', views.load_page, name='load_page'),
]