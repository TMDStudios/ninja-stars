from django import forms
from users.models import CustomUser

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