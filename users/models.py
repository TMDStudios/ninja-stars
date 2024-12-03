from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    AVAILABILITY_CHOICES = [
        ('mornings', 'Mornings'),
        ('afternoons', 'Afternoons'),
        ('evenings', 'Evenings'),
        ('nights', 'Nights'),
    ]

    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True, blank=False)
    discord_handle = models.CharField(max_length=32, blank=True, null=True)
    availability = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default='evenings')
    stars = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username
