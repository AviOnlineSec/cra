from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, KycDocumentViewSet

router = DefaultRouter()
router.register(r'clients', ClientViewSet)
router.register(r'kyc-documents', KycDocumentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]