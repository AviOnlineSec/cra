from rest_framework import serializers
from .models import DistributionChannel, DistributionChannelMembership


class DistributionChannelSerializer(serializers.ModelSerializer):
    channel_type_display = serializers.CharField(source='get_channel_type_display', read_only=True)
    
    class Meta:
        model = DistributionChannel
        fields = ["id", "name", "code", "channel_type", "channel_type_display", 
                  "address", "phone", "email", "is_active", "created_at"]


class DistributionChannelMembershipSerializer(serializers.ModelSerializer):
    channel = DistributionChannelSerializer(read_only=True)

    class Meta:
        model = DistributionChannelMembership
        fields = ["id", "channel", "role", "is_active", "created_at"]