from rest_framework.decorators import api_view
from rest_framework.response import Response
from base.models import HelpRequest, Review
from .serializers import HelpRequestSerializer, ReviewSerializer, HelpRequestListSerializer, ReviewListSerializer
from django.contrib.auth.decorators import login_required

@api_view(['GET'])
@login_required
def fetch_help_requests(request):
    """Fetch all help requests"""
    help_requests = HelpRequest.objects.all()
    serializer = HelpRequestSerializer(help_requests, many=True)
    return Response({'help_requests': serializer.data})

@api_view(['GET'])
def fetch_help_requests_list(request):
    """Fetch list of help requests"""
    help_requests = HelpRequest.objects.all()
    serializer = HelpRequestListSerializer(help_requests, many=True)
    return Response({'help_requests': serializer.data})

@api_view(['POST'])
@login_required
def submit_help_request(request):
    """Submit a new help request"""
    serializer = HelpRequestSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@login_required
def fetch_reviews(request):
    """Fetch all reviews"""
    reviews = Review.objects.all()
    serializer = ReviewSerializer(reviews, many=True)
    return Response({'reviews': serializer.data})

@api_view(['GET'])
def fetch_reviews_list(request):
    """Fetch list of reviews"""
    reviews = Review.objects.all()
    serializer = ReviewListSerializer(reviews, many=True)
    return Response({'reviews': serializer.data})

@api_view(['POST'])
@login_required
def add_review(request):
    """Add a new review"""
    serializer = ReviewSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)