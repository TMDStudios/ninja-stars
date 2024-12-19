from django import forms
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