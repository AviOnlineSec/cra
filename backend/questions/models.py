from django.db import models
from categories.models import Category

class Question(models.Model):
    FIELD_TYPE_CHOICES = [
        ('select', 'Select'),
        ('radio', 'Radio'),
        ('text', 'Text'),
    ]

    category = models.ForeignKey(Category, related_name='questions', on_delete=models.CASCADE)
    question_text = models.CharField(max_length=255)
    field_type = models.CharField(max_length=10, choices=FIELD_TYPE_CHOICES, default='select')
    display_order = models.IntegerField(default=0)

    def __str__(self):
        return self.question_text

class Option(models.Model):
    question = models.ForeignKey(Question, related_name='options', on_delete=models.CASCADE)
    option_text = models.CharField(max_length=255)
    score_value = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.option_text} ({self.score_value})"
