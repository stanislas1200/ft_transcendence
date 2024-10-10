from django.urls import path
from . import views

urlpatterns = [
    path('', views.load_page, {'page': 'index'}, name='index'),
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
    path('bootstrap/', views.bootstrap, name='bootstrap'),
    path('privacy-policy/', views.privacy_policy, name='privacy_policy'),
    path('terms-of-service/', views.terms_of_service, name='terms_of_service'),
    path('<str:page>/', views.load_page, name='load_page'),
]