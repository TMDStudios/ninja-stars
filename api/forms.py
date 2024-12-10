from django import forms
from base.models import HelpRequest, Review

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