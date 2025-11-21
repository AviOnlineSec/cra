from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('compliance', 'Compliance'),
        ('user', 'User'),
    )
    DISTRIBUTION_CHANNEL_CHOICES = (
        ('HeadOffice', 'Head Office'),
        ('Branch', 'Branch'),
        ('Agent', 'Agent'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    distribution_channel = models.CharField(max_length=20, choices=DISTRIBUTION_CHANNEL_CHOICES, null=True, blank=True)
    is_approved = models.BooleanField(default=False, help_text="Admin approval status")
    must_change_password = models.BooleanField(default=False, help_text="Force password change on next login")
    registration_date = models.DateTimeField(auto_now_add=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, help_text="User's mobile/phone number")


class UserApproval(models.Model):
    """Track registration approval workflow"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='approval_record')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    temporary_password = models.CharField(max_length=255, blank=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='approvals_given')
    rejection_reason = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-requested_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.status}"
