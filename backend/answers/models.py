from django.db import models

from assessments.models import Assessment
from questions.models import Question



class AssessmentAnswer(models.Model):
    assessment = models.ForeignKey(Assessment, related_name='answers', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, related_name='answers', on_delete=models.CASCADE)
    selected_text = models.CharField(max_length=255, blank=True)
    score_value = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Assessment {self.assessment_id} - Q{self.question_id}: {self.selected_text} ({self.score_value})"