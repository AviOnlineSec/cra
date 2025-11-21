from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import DistributionChannel, DistributionChannelMembership
from .serializers import DistributionChannelSerializer, DistributionChannelMembershipSerializer


class DistributionChannelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DistributionChannel.objects.filter(is_active=True)
    serializer_class = DistributionChannelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return DistributionChannel.objects.filter(is_active=True)
        channel_ids = DistributionChannelMembership.objects.filter(user=user, is_active=True).values_list("channel_id", flat=True)
        return DistributionChannel.objects.filter(id__in=list(channel_ids), is_active=True)

    @action(detail=False, methods=["get"], url_path="me")
    def my_channels(self, request):
        memberships = DistributionChannelMembership.objects.filter(user=request.user, is_active=True).select_related("channel")
        return Response(DistributionChannelMembershipSerializer(memberships, many=True).data)