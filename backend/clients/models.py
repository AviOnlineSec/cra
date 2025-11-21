from django.db import models
from django.db.models import Max
from django.utils import timezone
import os

class Client(models.Model):
    CLIENT_TYPE_CHOICES = (
        ('individual', 'Individual'),
        ('corporate', 'Corporate'),
    )
    DISTRIBUTION_CHANNEL_CHOICES = (
        ('HeadOffice', 'Head Office'),
        ('Branch', 'Branch'),
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
    distribution_channel = models.ForeignKey('companies.DistributionChannel', on_delete=models.CASCADE, related_name='clients', null=True, blank=True)
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

class KycDocument(models.Model):
    client = models.ForeignKey('Client', on_delete=models.CASCADE, related_name='kyc_documents')
    uploaded_by = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True, blank=True)
    document = models.FileField(upload_to='kyc_docs/%Y/%m/%d/')
    original_filename = models.CharField(max_length=255)
    upload_date = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        # Save file under kyc_docs/<client_name>/<date>/filename.ext
        client_name = self.client.fullName or self.client.corporateName or f"client_{self.client.id}"
        date_str = self.upload_date.strftime('%Y-%m-%d')
        base, ext = os.path.splitext(self.document.name)
        new_path = f"kyc_docs/{client_name}/{date_str}/{os.path.basename(self.document.name)}"
        self.document.name = new_path
        super().save(*args, **kwargs)

    def __str__(self):
        return f"KYC for {self.client} ({self.original_filename})"
