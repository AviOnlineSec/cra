from django.contrib import admin
from .models import Client, KycDocument

admin.site.register(Client)
admin.site.register(KycDocument)
