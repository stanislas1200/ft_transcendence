from django.urls import path
from . import views

urlpatterns = [
    path('', views.load_page, {'page': 'index'}, name='index'),
    path('<str:page>/', views.load_page, name='load_page'),
]