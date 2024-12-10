from rest_framework import serializers
from base.models import HelpRequest, Review

class HelpRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = HelpRequest
        fields = '__all__'

    def validate_concept(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Concept must be at least 3 characters long.")
        return value

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'

    def validate_duration(self, value):
        if value < 10:
            raise serializers.ValidationError("Duration must be at least 10 minutes.")
        if value > 1439:
            raise serializers.ValidationError("Duration cannot exceed 1439 minutes (24 hours).")
        return value