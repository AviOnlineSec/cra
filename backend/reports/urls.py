from django.urls import path
from .views import monthly_report, yearly_report

urlpatterns = [
    path('monthly/', monthly_report, name='monthly_report'),
    path('yearly/', yearly_report, name='yearly_report'),
]