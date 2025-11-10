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
        if not user.is_superuser:
            company = getattr(self.request, 'company', None)
            if not company:
                return Assessment.objects.none()
            return qs.filter(client__company=company)
        # Optional filter for superusers
        company_id = self.request.query_params.get('company')
        if company_id:
            return qs.filter(client__company_id=company_id)
        return qs

    def perform_create(self, serializer):
        # Automatically associate the authenticated user as the submitter
        client = serializer.validated_data.get('client')
        company = getattr(self.request, 'company', None)
        user = self.request.user
        if not user.is_superuser:
            if not company or not client or client.company_id != getattr(company, 'id', None):
                # Prevent creating assessments for clients outside the selected company
                raise ValidationError({'client': 'Client does not belong to the selected company'})
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
