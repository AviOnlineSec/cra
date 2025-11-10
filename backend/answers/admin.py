from django.contrib import admin
from .models import AssessmentAnswer


@admin.register(AssessmentAnswer)
class AssessmentAnswerAdmin(admin.ModelAdmin):
    list_display = ('assessment', 'question', 'selected_text', 'score_value', 'created_at')
    list_filter = ('assessment',)