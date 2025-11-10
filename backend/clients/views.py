from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Client
from .serializers import ClientSerializer
from django.conf import settings
from .external_db import (
    is_external_db_enabled,
    fetch_external_clients,
    push_results_to_external,
)
from assessments.models import Assessment


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # Non-superusers are restricted to their selected company
        if not user.is_superuser:
            company = getattr(self.request, 'company', None)
            if not company:
                return Client.objects.none()
            return qs.filter(company=company)
        # Superusers can optionally filter by company via query param
        company_id = self.request.query_params.get('company')
        if company_id:
            return qs.filter(company_id=company_id)
        return qs

    def perform_create(self, serializer):
        # Automatically set the creator to the authenticated user
        company = getattr(self.request, 'company', None)
        # For non-superusers company context is mandatory and set via middleware
        serializer.save(created_by=self.request.user, company=company)

    @action(detail=False, methods=["get"], url_path="import-external")
    def import_external(self, request):
        """Optionally fetch clients from an external MySQL DB and preview or import.

        Query params:
        - import: "true" to import into local DB, otherwise just preview
        - limit: number of rows to fetch (default: 50)
        - query: optional override SELECT query matching the other app schema
        """
        if not is_external_db_enabled():
            return Response({
                "detail": "External DB integration disabled",
                "enabled": False,
            }, status=status.HTTP_501_NOT_IMPLEMENTED)

        import_flag = request.query_params.get("import", "false").lower() == "true"
        limit = int(request.query_params.get("limit", "50"))
        query = request.query_params.get("query")

        rows = fetch_external_clients(limit=limit, query=query)
        if not rows:
            return Response({
                "detail": "No data or external connector unavailable",
                "count": 0,
                "enabled": True,
                "imported": 0,
                "preview": [],
            })

        imported = 0
        if import_flag:
            for r in rows:
                # Map external fields to our Client model conservatively
                data = {
                    "clientType": r.get("client_type") or "individual",
                    "distributionChannel": r.get("distribution_channel") or "HeadOffice",
                    "fullName": r.get("full_name") or "",
                    "nationalId": r.get("national_id") or "",
                    "corporateName": r.get("corporate_name") or "",
                    "email": r.get("email") or "",
                    "phone": r.get("phone") or "",
                    "address": r.get("address") or "",
                    "city": r.get("city") or "",
                }
                # Deduplicate based on nationalId or email when available
                lookup = {}
                if data["nationalId"]:
                    lookup["nationalId"] = data["nationalId"]
                elif data["email"]:
                    lookup["email"] = data["email"]
                else:
                    lookup = {"fullName": data["fullName"], "phone": data["phone"]}

                # Always scope to the active company when importing
                company = getattr(request, 'company', None)
                if company:
                    data["company"] = company.id
                obj, created = Client.objects.get_or_create(company=company, **lookup, defaults=data)
                if not created:
                    # Update existing with latest data
                    for k, v in data.items():
                        setattr(obj, k, v)
                    obj.save()
                imported += 1

        return Response({
            "enabled": True,
            "count": len(rows),
            "imported": imported,
            "preview": rows[: min(10, len(rows))],
        })

    @action(detail=False, methods=["post"], url_path="push-results")
    def push_results(self, request):
        """Create/update local assessment results and optionally push to external DB.

        Body JSON:
        - clientReference or clientId (one required)
        - status (optional; defaults to 'submitted')
        - riskLevel (optional)
        - externalTable (optional; override destination table)
        - data (optional dict to forward to external DB)
        """
        client_ref = request.data.get("clientReference")
        client_id = request.data.get("clientId")
        status_val = request.data.get("status", "submitted")
        risk_level = request.data.get("riskLevel")
        external_table = request.data.get("externalTable")
        extra_data = request.data.get("data", {}) or {}

        client_obj = None
        if client_id:
            client_obj = Client.objects.filter(id=client_id).first()
        elif client_ref:
            client_obj = Client.objects.filter(reference=client_ref).first()

        if not client_obj:
            return Response({"detail": "Client not found"}, status=status.HTTP_404_NOT_FOUND)

        # Create an assessment locally
        assessment = Assessment.objects.create(
            client=client_obj,
            submitted_by=request.user,
            status=status_val,
            risk_level=risk_level,
        )

        external_ok = False
        if is_external_db_enabled():
            payload = {
                "client_reference": client_obj.reference,
                "client_id": client_obj.id,
                "status": assessment.status,
                "risk_level": assessment.risk_level,
                "submitted_at": assessment.submitted_at.strftime("%Y-%m-%d %H:%M:%S"),
            }
            # Merge any extra fields provided by caller
            payload.update({k: v for k, v in extra_data.items()})
            external_ok = push_results_to_external(external_table, payload)

        return Response({
            "ok": True,
            "assessmentId": assessment.id,
            "externalPushed": external_ok,
        }, status=status.HTTP_201_CREATED)
