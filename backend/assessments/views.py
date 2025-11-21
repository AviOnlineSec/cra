from rest_framework import viewsets, status
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Assessment
from .serializers import AssessmentSerializer
from clients.external_db import is_external_db_enabled, push_results_to_external

class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer

    def get_queryset(self):
        qs = super().get_queryset().select_related('client')
        user = self.request.user
        
        # Admin and compliance can see all assessments
        if user.role in ['admin', 'compliance']:
            return qs
        
        # Regular users can only see assessments for clients from their distribution channel
        if user.distribution_channel:
            return qs.filter(client__distributionChannel=user.distribution_channel)
        
        # If no distribution channel set, return empty queryset
        return Assessment.objects.none()

    def perform_create(self, serializer):
        # Automatically associate the authenticated user as the submitter
        client = serializer.validated_data.get('client')
        user = self.request.user
        
        # Regular users can only create assessments for clients in their distribution channel
        if user.role not in ['admin', 'compliance']:
            if not user.distribution_channel or not client or client.distributionChannel != user.distribution_channel:
                raise ValidationError({'client': 'Client does not belong to your distribution channel'})
        
        serializer.save(submitted_by=self.request.user)

    @action(detail=True, methods=["post"], url_path="push-external")
    def push_external(self, request, pk=None):
        """Push this assessment's summary to the external database.

        Returns JSON with whether the external write succeeded.
        """
        assessment = self.get_object()
        client = assessment.client

        if not is_external_db_enabled():
            return Response({
                "detail": "External DB integration disabled",
                "externalPushed": False,
            }, status=status.HTTP_501_NOT_IMPLEMENTED)

        payload = {
            "assessment_id": assessment.id,
            "client_reference": getattr(client, "reference", None),
            "client_id": client.id,
            "status": assessment.status,
            "risk_level": assessment.risk_level,
            "total_score": assessment.total_score,
            "submitted_at": assessment.submitted_at.strftime("%Y-%m-%d %H:%M:%S"),
        }

        external_ok = push_results_to_external(None, payload)

        return Response({
            "ok": True,
            "assessmentId": assessment.id,
            "externalPushed": external_ok,
        })
