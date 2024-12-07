from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

app_name = 'frontend'

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register, name='register'),
    path('login/', views.custom_login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('help/request/', views.submit_help_request, name='submit_help_request'),
    path('fetch-help-requests/', views.fetch_help_requests, name='fetch_help_requests'),
]