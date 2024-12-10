from rest_framework import serializers
from base.models import HelpRequest, Review

class HelpRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = HelpRequest
        fields = '__all__'

    def validate_concept(self, value):
        """Custom validation for the concept field"""
        if len(value) < 3:
            raise serializers.ValidationError("Concept must be at least 3 characters long.")
        return value

    def validate_course(self, value):
        """Custom validation for the course field"""
        valid_courses = [choice[0] for choice in HelpRequest.COURSE_CHOICES]
        if value not in valid_courses:
            raise serializers.ValidationError(f"Invalid course. Must be one of {valid_courses}")
        return value

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'

    def validate_duration(self, value):
        """Custom validation for the duration field"""
        if value < 10:
            raise serializers.ValidationError("Duration must be at least 10 minutes.")
        if value > 1439:
            raise serializers.ValidationError("Duration cannot exceed 1439 minutes (24 hours).")
        return value