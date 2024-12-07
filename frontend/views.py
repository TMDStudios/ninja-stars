from django.shortcuts import render, redirect
from .forms import CustomUserCreationForm, HelpRequestForm
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from base.models import HelpRequest

def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            custom_login(request, user)
            return redirect('frontend:home')
    else:
        form = CustomUserCreationForm()
    return render(request, 'register.html', {'form': form})

def custom_login(request, user=None):
    form = AuthenticationForm(data=request.POST or None)

    if request.method == 'POST' and form.is_valid():
        username = form.cleaned_data.get('username')
        password = form.cleaned_data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            auth_login(request, user)
            return redirect('frontend:home')

    return render(request, 'login.html', {'form': form})

def logout(request):
    auth_logout(request)
    form = AuthenticationForm(data=request.POST or None)
    return render(request, 'login.html', {'form': form})

@login_required
def home(request):
    form = HelpRequestForm()  # Initialize the form
    return render(request, 'home.html', {'form': form})

@login_required
def fetch_help_requests(request):
    help_requests = HelpRequest.objects.all()

    help_requests_data = [
        {
            'id': help_request.id,
            'concept': help_request.concept,
            'course': help_request.course,
            'module_link': help_request.module_link,
            'note': help_request.note,
            'active': help_request.active,
            'created_at': help_request.created_at.isoformat(),
            'updated_at': help_request.updated_at.isoformat(),
        }
        for help_request in help_requests
    ]

    return JsonResponse({'help_requests': help_requests_data})

@login_required
def submit_help_request(request):
    if request.method == 'POST':
        form = HelpRequestForm(request.POST)
        if form.is_valid():
            form.save(user=request.user)
            return JsonResponse({'message': 'Help request submitted successfully!'})
        else:
            return JsonResponse({'message': 'Failed to submit request.', 'errors': form.errors}, status=400)