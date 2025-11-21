from django.contrib import admin
from .models import DistributionChannel, DistributionChannelMembership


@admin.register(DistributionChannel)
class DistributionChannelAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "channel_type", "phone", "email", "is_active", "created_at")
    search_fields = ("name", "code", "address", "phone", "email")
    list_filter = ("channel_type", "is_active")


@admin.register(DistributionChannelMembership)
class DistributionChannelMembershipAdmin(admin.ModelAdmin):
    list_display = ("user", "channel", "role", "is_active", "created_at")
    search_fields = ("user__username", "channel__name", "role")
    list_filter = ("is_active", "channel__channel_type")