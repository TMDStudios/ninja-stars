from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from base.models import HelpRequest, Review
from .serializers import HelpRequestSerializer, ReviewSerializer, PartialHelpRequestSerializer, PartialReviewSerializer, UserSerializer
from django.utils import timezone
from datetime import timedelta
from .forms import CustomUserCreationForm

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_data(request):
    """Fetch user data for the authenticated user"""
    user = request.user
    serializer = UserSerializer(user)
    return Response({'user_data': serializer.data})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_help_requests(request):
    """Fetch help requests with user data"""
    module = request.query_params.get('module', None)
    if module:
        help_requests = HelpRequest.objects.filter(module_link=module).filter(active=True)
    else:
        help_requests = HelpRequest.objects.filter(active=True)
    serializer = HelpRequestSerializer(help_requests, many=True)
    return Response({'help-requests': serializer.data})

@api_view(['GET'])
def get_partial_help_requests(request):
    """Fetch help requests without user data"""
    module = request.query_params.get('module', None)
    if module:
        help_requests = HelpRequest.objects.filter(module_link=module).filter(active=True)
    else:
        help_requests = HelpRequest.objects.filter(active=True)
    serializer = PartialHelpRequestSerializer(help_requests, many=True)
    return Response({'help-requests': serializer.data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_help_request(request):
    """Submit a new help request"""
    print(request.data)
    serializer = HelpRequestSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    print("Serializer Errors:", serializer.errors)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deactivate_help_request(request, id):
    """Deactivate help request"""
    try:
        help_request = HelpRequest.objects.get(id=id)
    except HelpRequest.DoesNotExist:
        return Response({'detail': 'Help request not found.'}, status=404)
    
    help_request.active = False
    help_request.save()
    serializer = HelpRequestSerializer(help_request)

    return Response(serializer.data, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_reviews(request):
    """Fetch reviews with user data, mark expired ones as inactive"""
    module = request.query_params.get('module', None)

    if module:
        reviews = Review.objects.filter(module_link=module, active=True)
    else:
        reviews = Review.objects.filter(active=True)
    
    current_time = timezone.localtime(timezone.now())
    active_reviews = []
    expired_reviews = []

    for review in reviews:
        review_created_at = timezone.localtime(review.created_at)
        duration_threshold = review_created_at + timedelta(minutes=review.duration)

        if current_time > duration_threshold:
            expired_reviews.append(review.id)
        else:
            active_reviews.append(review)

    if expired_reviews:
        Review.objects.filter(id__in=expired_reviews).update(active=False)

    serializer = ReviewSerializer(active_reviews, many=True)
    return Response({'reviews': serializer.data})

@api_view(['GET'])
def get_partial_reviews(request):
    """Fetch reviews without user data, mark expired ones as inactive"""
    module = request.query_params.get('module', None)

    if module:
        reviews = Review.objects.filter(module_link=module, active=True)
    else:
        reviews = Review.objects.filter(active=True)
    
    current_time = timezone.localtime(timezone.now())
    active_reviews = []
    expired_reviews = []

    for review in reviews:
        review_created_at = timezone.localtime(review.created_at)
        duration_threshold = review_created_at + timedelta(minutes=review.duration)

        if current_time > duration_threshold:
            expired_reviews.append(review.id)
        else:
            active_reviews.append(review)

    if expired_reviews:
        Review.objects.filter(id__in=expired_reviews).update(active=False)

    serializer = PartialReviewSerializer(active_reviews, many=True)
    return Response({'reviews': serializer.data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_review(request):
    """Add a new review"""
    request.data['duration'] = int(request.data['duration'])
    serializer = ReviewSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    print("Serializer Errors:", serializer.errors)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.data)
        if form.is_valid():
            form.save()
            return Response("User created successfully", status=201)
        return Response({"errors": form.errors}, status=400)
    return Response("Unable to create user", status=400)