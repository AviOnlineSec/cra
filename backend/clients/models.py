from django.db import models
from django.db.models import Max

class Client(models.Model):
    CLIENT_TYPE_CHOICES = (
        ('individual', 'Individual'),
        ('corporate', 'Corporate'),
    )
    DISTRIBUTION_CHANNEL_CHOICES = (
        ('HeadOffice', 'Head Office'),
        ('Broker', 'Broker'),
        ('Agent', 'Agent'),
    )

    reference = models.CharField(max_length=100, unique=True, blank=True)
    clientType = models.CharField(max_length=20, choices=CLIENT_TYPE_CHOICES, default='individual')
    distributionChannel = models.CharField(max_length=20, choices=DISTRIBUTION_CHANNEL_CHOICES, default='HeadOffice')
    fullName = models.CharField(max_length=100, blank=True)
    nationalId = models.CharField(max_length=100, blank=True)
    corporateName = models.CharField(max_length=100, blank=True)
    ubo = models.CharField(max_length=100, blank=True)
    natureOfBusiness = models.CharField(max_length=100, blank=True)
    brn = models.CharField(max_length=100, blank=True)
    vat = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='clients', null=True, blank=True)
    created_by = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_clients')

    def __str__(self):
        return self.fullName or self.corporateName

    def save(self, *args, **kwargs):
        if not self.reference:
            prefix = self.clientType[:4].upper()
            
            # Get the last created client's number
            last_ref = Client.objects.filter(reference__startswith=prefix).aggregate(
                max_num=Max('reference')
            )['max_num']

            if last_ref:
                # Extract number from last reference and increment
                last_number = int(last_ref.split('-')[1])
                new_number = last_number + 1
            else:
                # Start from 1100001 if none exists
                new_number = 1100001

            self.reference = f"{prefix}-{new_number}"

        super().save(*args, **kwargs)
