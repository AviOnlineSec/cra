from django.contrib import admin
from .models import CustomUser, UserApproval

admin.site.register(CustomUser)
admin.site.register(UserApproval)
