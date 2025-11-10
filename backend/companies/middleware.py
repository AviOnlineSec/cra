from django.http import JsonResponse
from .models import Company, CompanyMembership


class CompanyContextMiddleware:
    """Attach request.company based on X-Company-ID header or session.

    Rules:
    - Superusers: optional company context; access not restricted.
    - Non-superusers: must provide a valid company the user belongs to; otherwise 403.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = getattr(request, 'user', None)
        request.company = None

        # Skip until authentication attaches a user
        if not user or not user.is_authenticated:
            return self.get_response(request)

        # Superuser bypasses restrictions; can optionally set a company context
        company_id = request.headers.get('X-Company-ID') or request.session.get('active_company_id')

        if user.is_superuser:
            if company_id:
                request.company = Company.objects.filter(id=company_id, is_active=True).first()
            return self.get_response(request)

        # For non-superusers, company is mandatory and must be one the user belongs to
        if not company_id:
            return JsonResponse({'detail': 'Company context required'}, status=403)

        company = Company.objects.filter(id=company_id, is_active=True).first()
        if not company:
            return JsonResponse({'detail': 'Invalid company'}, status=403)

        is_member = CompanyMembership.objects.filter(user=user, company=company, is_active=True).exists()
        if not is_member:
            return JsonResponse({'detail': 'Not authorized for this company'}, status=403)

        request.company = company
        request.session['active_company_id'] = company.id

        return self.get_response(request)