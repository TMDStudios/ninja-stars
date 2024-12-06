from django.shortcuts import render, redirect
from .forms import CustomUserCreationForm
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required

def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('frontend:home')
    else:
        form = CustomUserCreationForm()
    return render(request, 'register.html', {'form': form})

def login(request, user=None):
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
    return render(request, 'home.html')