from django.db import models
from django.conf import settings


class DistributionChannel(models.Model):
    CHANNEL_CHOICES = [
        ('headoffice', 'Head Office'),
        ('branch', 'Branch'),
        ('agents', 'Agents'),
    ]
    
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, unique=True)
    channel_type = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.get_channel_type_display()})"

    class Meta:
        verbose_name = "Distribution Channel"
        verbose_name_plural = "Distribution Channels"


class DistributionChannelMembership(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="channel_memberships")
    channel = models.ForeignKey(DistributionChannel, on_delete=models.CASCADE, related_name="memberships")
    role = models.CharField(max_length=50, blank=True)  # optional per-channel role
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "channel")
        verbose_name = "Distribution Channel Membership"
        verbose_name_plural = "Distribution Channel Memberships"

    def __str__(self):
        return f"{self.user} @ {self.channel}"