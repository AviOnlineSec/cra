from rest_framework import serializers
from .models import Assessment

class AssessmentSerializer(serializers.ModelSerializer):
    # submitted_by is set server-side; do not require it from the client
    submitted_by = serializers.PrimaryKeyRelatedField(read_only=True)
    submitted_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Assessment
        fields = '__all__'
        extra_kwargs = {
            'submitted_at': { 'read_only': True },
            'submitted_by': { 'read_only': True },
        }

    def get_submitted_by_name(self, obj):
        user = getattr(obj, 'submitted_by', None)
        if not user:
            return None
        name = getattr(user, 'name', None) or getattr(user, 'full_name', None)
        if not name and hasattr(user, 'get_full_name'):
            name = user.get_full_name()
        return name or getattr(user, 'username', None) or getattr(user, 'email', None)