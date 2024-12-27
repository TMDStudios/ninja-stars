from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

app_name = 'api'

urlpatterns = [
    path('help-requests/', views.get_help_requests, name='get_help_requests'),
    path('partial-help-requests/', views.get_partial_help_requests, name='get_partial_help_requests'),
    path('help/request/', views.submit_help_request, name='submit_help_request'),
    path('help-requests/<int:id>/delete', views.deactivate_help_request, name='deactivate_help_request'),
    path('reviews/', views.get_reviews, name='get_reviews'),
    path('partial-reviews/', views.get_partial_reviews, name='get_partial_reviews'),
    path('review/start/', views.add_review, name='add_review'),
    path('user/', views.user_data, name='user_data'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.register, name='register'),
]