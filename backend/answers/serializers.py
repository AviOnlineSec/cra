from rest_framework import serializers
from .models import AssessmentAnswer


class AssessmentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentAnswer
        fields = ['id', 'assessment', 'question', 'selected_text', 'score_value', 'created_at']
        extra_kwargs = {
            # In replace endpoint, assessment is provided separately; allow omission in items
            'assessment': { 'required': False },
            'created_at': { 'read_only': True },
        }