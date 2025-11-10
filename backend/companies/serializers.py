from rest_framework import serializers
from .models import Company, CompanyMembership


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "slug", "is_active", "created_at"]


class CompanyMembershipSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)

    class Meta:
        model = CompanyMembership
        fields = ["id", "company", "role", "is_active", "created_at"]