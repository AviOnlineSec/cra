from django.contrib import admin
from .models import Question, Option

class OptionInline(admin.TabularInline):
    model = Option
    extra = 1

class QuestionAdmin(admin.ModelAdmin):
    inlines = [OptionInline]
    list_display = ('question_text', 'category', 'field_type', 'display_order')
    list_filter = ('category',)

admin.site.register(Question, QuestionAdmin)
admin.site.register(Option)
