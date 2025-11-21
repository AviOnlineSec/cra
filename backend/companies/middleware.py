from django.http import JsonResponse
from .models import DistributionChannel, DistributionChannelMembership


class DistributionChannelContextMiddleware:
    """Attach request.distribution_channel based on X-Channel-ID header or session.

    Rules:
    - Superusers: optional channel context; access not restricted.
    - Non-superusers: must provide a valid channel the user belongs to; otherwise 403.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = getattr(request, 'user', None)
        request.distribution_channel = None

        # Skip until authentication attaches a user
        if not user or not user.is_authenticated:
            return self.get_response(request)

        # Superuser bypasses restrictions; can optionally set a channel context
        channel_id = request.headers.get('X-Channel-ID') or request.session.get('active_channel_id')

        if user.is_superuser:
            if channel_id:
                request.distribution_channel = DistributionChannel.objects.filter(id=channel_id, is_active=True).first()
            return self.get_response(request)

        # For non-superusers, channel is mandatory and must be one the user belongs to
        if not channel_id:
            return JsonResponse({'detail': 'Distribution channel context required'}, status=403)

        channel = DistributionChannel.objects.filter(id=channel_id, is_active=True).first()
        if not channel:
            return JsonResponse({'detail': 'Invalid distribution channel'}, status=403)

        is_member = DistributionChannelMembership.objects.filter(user=user, channel=channel, is_active=True).exists()
        if not is_member:
            return JsonResponse({'detail': 'Not authorized for this distribution channel'}, status=403)

        request.distribution_channel = channel
        request.session['active_channel_id'] = channel.id

        return self.get_response(request)