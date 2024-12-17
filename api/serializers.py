from rest_framework import serializers
from base.models import HelpRequest, Review, CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'discord_handle']

class HelpRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = HelpRequest
        fields = ['id', 'concept', 'course', 'module_link', 'note', 'user', 'created_at']
        read_only_fields = ['user']

    def validate_concept(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Concept must be at least 3 characters long.")
        return value

class PartialHelpRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = HelpRequest
        fields = ['concept', 'course', 'module_link', 'created_at']

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Review
        fields = ['id', 'concept', 'course', 'module_link', 'note', 'duration', 'user', 'created_at']
        read_only_fields = ['user']

    def validate_duration(self, value):
        if value < 10:
            raise serializers.ValidationError("Duration must be at least 10 minutes.")
        if value > 1439:
            raise serializers.ValidationError("Duration cannot exceed 1439 minutes (24 hours).")
        return value
    
class PartialReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['concept', 'course', 'module_link', 'created_at']