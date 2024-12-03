from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import CustomUser

class HelpRequest(models.Model):
    concept = models.CharField(max_length=255)
    module_link = models.URLField(max_length=255, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(CustomUser, related_name="help_requests", on_delete = models.CASCADE)

    def __str__(self) -> str:
        return f'Concept: {self.concept}, Active: {self.active}, Created: {self.created_at}'
    
    @classmethod
    def get_all_requests(cls):
        return cls.objects.all()
    
    @classmethod
    def add_help_request(cls, data, user):
        return cls.objects.create(concept=data['concept'], module_link=data.get('module_link', None), note=data.get('note', None), user=user)
    
    @classmethod
    def get_by_id(cls, id):
        return cls.objects.get(id=id)
    
    @classmethod
    def resolve(cls, id):
        try:
            help_request = cls.objects.get(id=id)
            help_request.active = False
            help_request.save()
            return help_request
        except cls.DoesNotExist:
            return None
        
class Review(models.Model):
    concept = models.CharField(max_length=255)
    module_link = models.URLField(max_length=255, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    active = models.BooleanField(default=True)
    duration = models.IntegerField(default=60, validators=[MinValueValidator(10), MaxValueValidator(1439)]) # Minutes
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(CustomUser, related_name="reviews", on_delete = models.CASCADE)

    def __str__(self) -> str:
        return f'Concept: {self.concept}, Active: {self.active}, Created: {self.created_at}'
    
    @classmethod
    def get_all_reviews(cls):
        return cls.objects.all()
    
    @classmethod
    def add_review(cls, data, user):
        return cls.objects.create(
            concept=data['concept'], 
            module_link=data.get('module_link', None), 
            note=data.get('note', None), 
            duration=data.get('duration', 60),
            user=user)
    
    @classmethod
    def get_by_id(cls, id):
        return cls.objects.get(id=id)
    
    @classmethod
    def remove(cls, id):
        try:
            review = cls.objects.get(id=id)
            review.active = False
            review.save()
            return review
        except cls.DoesNotExist:
            return None