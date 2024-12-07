from django import forms
from users.models import CustomUser
from base.models import HelpRequest, COURSE_CHOICES

class CustomUserCreationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, label='Password')

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'discord_handle', 'availability', 'password']
    
    def clean_discord_handle(self):
        discord_handle = self.cleaned_data.get('discord_handle')
        if CustomUser.objects.filter(discord_handle=discord_handle).exists():
            raise forms.ValidationError('This Discord handle is already taken.')
        return discord_handle

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