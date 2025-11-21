from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, UserApprovalViewSet, ChangePasswordView

router = DefaultRouter()
router.register(r'approvals', UserApprovalViewSet, basename='user-approval')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('', include(router.urls)),
]