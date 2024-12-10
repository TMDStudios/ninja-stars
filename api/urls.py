from django.urls import path
from . import views

app_name = 'api'

urlpatterns = [
    path('fetch-help-requests/', views.fetch_help_requests, name='fetch_help_requests'),
    path('help/request/', views.submit_help_request, name='submit_help_request'),
    path('fetch-reviews/', views.fetch_reviews, name='fetch_reviews'),
    path('review/start/', views.add_review, name='add_review'),
]