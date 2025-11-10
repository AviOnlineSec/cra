from django.http import JsonResponse
from django.db.models.functions import TruncMonth, TruncYear
from django.db.models import Count
from assessments.models import Assessment
from datetime import datetime, date, time, timedelta
from django.utils import timezone

def monthly_report(request):
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')

    if not start_date_str or not end_date_str:
        return JsonResponse({'error': 'start_date and end_date are required'}, status=400)

    try:
        # Parse into date objects so we can build clear day boundaries
        start_d = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_d = datetime.strptime(end_date_str, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=400)

    if end_d < start_d:
        return JsonResponse({'error': 'end_date must be on or after start_date'}, status=400)

    # Build timezone-aware datetime boundaries: [start, end_next_day)
    tz = timezone.get_current_timezone()
    start_dt = timezone.make_aware(datetime.combine(start_d, time.min), tz)
    end_next_day = end_d + timedelta(days=1)
    end_dt = timezone.make_aware(datetime.combine(end_next_day, time.min), tz)

    qs = Assessment.objects.filter(submitted_at__gte=start_dt, submitted_at__lt=end_dt)
    user = getattr(request, 'user', None)
    if user and user.is_authenticated and not user.is_superuser:
        company = getattr(request, 'company', None)
        if not company:
            return JsonResponse({'error': 'Company context required'}, status=403)
        qs = qs.filter(client__company=company)

    # Prefer DB-side grouping; if DB lacks timezone definitions, fallback to Python grouping
    try:
        data = (
            qs.annotate(month=TruncMonth('submitted_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        summary = {item['month'].strftime('%Y-%m'): item['count'] for item in data}
    except Exception:
        # Fallback: group in Python to avoid DB timezone conversion issues
        counts = {}
        for dt in qs.values_list('submitted_at', flat=True):
            # Normalize to current timezone, then truncate to month
            local_dt = timezone.localtime(dt, tz)
            month_key = local_dt.strftime('%Y-%m')
            counts[month_key] = counts.get(month_key, 0) + 1
        # Sort keys chronologically
        summary = {k: counts[k] for k in sorted(counts.keys())}

    # Build detailed rows
    details = []
    for a in qs.select_related('client'):
        client_obj = a.client
        client_name = getattr(client_obj, 'fullName', None) or getattr(client_obj, 'corporateName', None)
        details.append({
            'client_reference': getattr(client_obj, 'reference', None),
            'client_name': client_name,
            'score_level': a.risk_level,
            'total_score': a.total_score,
            'approval_status': a.status,
        })

    return JsonResponse({'summary': summary, 'details': details})

def yearly_report(request):
    start_year_str = request.GET.get('start_year')
    end_year_str = request.GET.get('end_year')

    if not start_year_str or not end_year_str:
        return JsonResponse({'error': 'start_year and end_year are required'}, status=400)

    try:
        start_year = int(start_year_str)
        end_year = int(end_year_str)
    except ValueError:
        return JsonResponse({'error': 'Invalid year format. Use YYYY'}, status=400)

    if end_year < start_year:
        return JsonResponse({'error': 'end_year must be on or after start_year'}, status=400)

    # Build timezone-aware datetime boundaries for entire years
    tz = timezone.get_current_timezone()
    start_dt = timezone.make_aware(datetime.combine(date(start_year, 1, 1), time.min), tz)
    end_dt = timezone.make_aware(datetime.combine(date(end_year + 1, 1, 1), time.min), tz)

    qs = Assessment.objects.filter(submitted_at__gte=start_dt, submitted_at__lt=end_dt)
    user = getattr(request, 'user', None)
    if user and user.is_authenticated and not user.is_superuser:
        company = getattr(request, 'company', None)
        if not company:
            return JsonResponse({'error': 'Company context required'}, status=403)
        qs = qs.filter(client__company=company)

    try:
        data = (
            qs.annotate(year=TruncYear('submitted_at'))
            .values('year')
            .annotate(count=Count('id'))
            .order_by('year')
        )

        summary = {item['year'].strftime('%Y'): item['count'] for item in data}
    except Exception:
        counts = {}
        for dt in qs.values_list('submitted_at', flat=True):
            local_dt = timezone.localtime(dt, tz)
            year_key = local_dt.strftime('%Y')
            counts[year_key] = counts.get(year_key, 0) + 1
        summary = {k: counts[k] for k in sorted(counts.keys())}

    details = []
    for a in qs.select_related('client'):
        client_obj = a.client
        client_name = getattr(client_obj, 'fullName', None) or getattr(client_obj, 'corporateName', None)
        details.append({
            'client_reference': getattr(client_obj, 'reference', None),
            'client_name': client_name,
            'score_level': a.risk_level,
            'total_score': a.total_score,
            'approval_status': a.status,
        })

    return JsonResponse({'summary': summary, 'details': details})
