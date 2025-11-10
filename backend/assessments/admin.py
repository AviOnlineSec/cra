from django.contrib import admin
from .models import Assessment

class AssessmentAdmin(admin.ModelAdmin):
    list_display = ('client', 'submitted_by', 'submitted_at', 'status', 'risk_level', 'total_score')
    list_filter = ('status', 'risk_level', 'submitted_at')
    search_fields = ('client__fullName', 'client__corporateName', 'submitted_by__username')
    readonly_fields = ('submitted_at',)

admin.site.register(Assessment, AssessmentAdmin)
