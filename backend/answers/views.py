from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import AssessmentAnswer
from .serializers import AssessmentAnswerSerializer


class AssessmentAnswerViewSet(viewsets.ModelViewSet):
    queryset = AssessmentAnswer.objects.all()
    serializer_class = AssessmentAnswerSerializer

    def get_queryset(self):
        qs = super().get_queryset().select_related('assessment__client')
        user = self.request.user
        if not user.is_superuser:
            company = getattr(self.request, 'company', None)
            if not company:
                return AssessmentAnswer.objects.none()
            qs = qs.filter(assessment__client__company=company)
        assessment_id = self.request.query_params.get('assessment')
        if assessment_id:
            qs = qs.filter(assessment_id=assessment_id).order_by('question__display_order')
        return qs

    @action(detail=False, methods=['post'], url_path='bulk')
    def bulk_create(self, request):
        data = request.data
        if not isinstance(data, list):
            return Response({'detail': 'Expected a list of answers.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = AssessmentAnswerSerializer(data=data, many=True)
        serializer.is_valid(raise_exception=True)
        objs = [AssessmentAnswer(**item) for item in serializer.validated_data]
        AssessmentAnswer.objects.bulk_create(objs)
        return Response({'created': len(objs)}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='replace')
    def replace(self, request):
        assessment = request.data.get('assessment')
        answers = request.data.get('answers')
        if not assessment or not isinstance(answers, list):
            return Response({'detail': 'Provide assessment and answers list.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = AssessmentAnswerSerializer(data=answers, many=True)
        serializer.is_valid(raise_exception=True)
        AssessmentAnswer.objects.filter(assessment_id=assessment).delete()
        objs = [AssessmentAnswer(assessment_id=assessment, **item) for item in serializer.validated_data]
        AssessmentAnswer.objects.bulk_create(objs)
        return Response({'replaced': len(objs)}, status=status.HTTP_201_CREATED)