from rest_framework.routers import DefaultRouter
from .views import DistributionChannelViewSet

router = DefaultRouter()
router.register(r'distribution-channels', DistributionChannelViewSet, basename='distribution-channel')

urlpatterns = router.urls