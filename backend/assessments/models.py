from django.db import models
from clients.models import Client
from users.models import CustomUser

class Assessment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    RISK_LEVEL_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    submitted_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    risk_level = models.CharField(max_length=10, choices=RISK_LEVEL_CHOICES, blank=True, null=True)
    total_score = models.IntegerField(default=0)

    def __str__(self):
        return f'Assessment for {self.client.fullName}'
