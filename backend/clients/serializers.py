from rest_framework import serializers
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = '__all__'

    def get_created_by_name(self, obj):
        user = getattr(obj, 'created_by', None)
        if not user:
            return None
        # Try common name attributes in order of preference
        name = getattr(user, 'name', None) or getattr(user, 'full_name', None)
        if not name and hasattr(user, 'get_full_name'):
            name = user.get_full_name()
        # Fallbacks
        return name or getattr(user, 'username', None) or getattr(user, 'email', None)