from django import forms
from base.models import HelpRequest, Review
from users.models import CustomUser

class CustomUserCreationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, label='Password')
    confirm_password = forms.CharField(widget=forms.PasswordInput, label='Confirm Password')

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'discord_handle', 'availability', 'password', 'confirm_password']
    
    def clean_discord_handle(self):
        discord_handle = self.cleaned_data.get('discord_handle')
        if CustomUser.objects.filter(discord_handle=discord_handle).exists():
            raise forms.ValidationError('This Discord handle is already taken.')
        return discord_handle

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm_password')

        if password and confirm_password:
            if password != confirm_password:
                self.add_error('confirm_password', 'Passwords must match')
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.set_password(self.cleaned_data["password"])
            user.save()
        return user

class HelpRequestForm(forms.ModelForm):
    class Meta:
        model = HelpRequest
        fields = ['concept', 'course', 'module_link', 'note']

    def clean_concept(self):
        concept = self.cleaned_data.get('concept')
        if len(concept) < 3:
            raise forms.ValidationError("Concept must be at least 3 characters long.")
        return concept
    
    def save(self, user, commit=True):
        help_request = super().save(commit=False)
        help_request.user = user
        if commit:
            help_request.save()
        return help_request

class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        fields = ['concept', 'course', 'module_link', 'note', 'duration']

    def clean_concept(self):
        concept = self.cleaned_data.get('concept')
        if len(concept) < 3:
            raise forms.ValidationError("Concept must be at least 3 characters long.")
        return concept
    
    def clean_duration(self):
        duration = self.cleaned_data.get('duration')
        if duration < 10:
            raise forms.ValidationError("Duration must be at least 10 minutes.")
        if duration > 1439:
            raise forms.ValidationError("Duration cannot exceed 1439 minutes (24 hours).")
        return duration

    def save(self, user, commit=True):
        review = super().save(commit=False)
        review.user = user
        if commit:
            review.save()
        return review