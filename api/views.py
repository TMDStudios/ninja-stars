from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from base.models import HelpRequest, Review
from .serializers import HelpRequestSerializer, ReviewSerializer, PartialHelpRequestSerializer, PartialReviewSerializer, UserSerializer

@api_view(['GET'])
def user_data(request):
    """Fetch user data for the authenticated user"""
    user = request.user
    serializer = UserSerializer(user)
    return Response({'user_data': serializer.data})

@api_view(['GET'])
def get_help_requests(request):
    """Fetch help requests with user data"""
    module = request.query_params.get('module', None)
    if module:
        help_requests = HelpRequest.objects.filter(module_link=module)
    else:
        help_requests = HelpRequest.objects.all()
    serializer = HelpRequestSerializer(help_requests, many=True)
    return Response({'help_requests': serializer.data})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_partial_help_requests(request):
    """Fetch help requests without user data"""
    module = request.query_params.get('module', None)
    if module:
        help_requests = HelpRequest.objects.filter(module_link=module)
    else:
        help_requests = HelpRequest.objects.all()
    serializer = PartialHelpRequestSerializer(help_requests, many=True)
    return Response({'help_requests': serializer.data})

@api_view(['POST'])
def submit_help_request(request):
    """Submit a new help request"""
    serializer = HelpRequestSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def get_reviews(request):
    """Fetch reviews with user data"""
    module = request.query_params.get('module', None)
    if module:
        reviews = Review.objects.filter(module_link=module)
    else:
        reviews = Review.objects.all()
    serializer = ReviewSerializer(reviews, many=True)
    return Response({'reviews': serializer.data})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_partial_reviews(request):
    """Fetch reviews without user data"""
    module = request.query_params.get('module', None)
    if module:
        reviews = Review.objects.filter(module_link=module)
    else:
        reviews = Review.objects.all()
    serializer = PartialReviewSerializer(reviews, many=True)
    return Response({'reviews': serializer.data})

@api_view(['POST'])
def add_review(request):
    """Add a new review"""
    serializer = ReviewSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)