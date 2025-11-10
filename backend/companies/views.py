from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Company, CompanyMembership
from .serializers import CompanySerializer, CompanyMembershipSerializer


class CompanyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Company.objects.filter(is_active=True)
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Company.objects.filter(is_active=True)
        company_ids = CompanyMembership.objects.filter(user=user, is_active=True).values_list("company_id", flat=True)
        return Company.objects.filter(id__in=list(company_ids), is_active=True)

    @action(detail=False, methods=["get"], url_path="me")
    def my_companies(self, request):
        memberships = CompanyMembership.objects.filter(user=request.user, is_active=True).select_related("company")
        return Response(CompanyMembershipSerializer(memberships, many=True).data)