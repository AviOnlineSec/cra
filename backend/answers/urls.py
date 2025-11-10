from rest_framework.routers import DefaultRouter
from .views import AssessmentAnswerViewSet

router = DefaultRouter()
router.register(r'answers', AssessmentAnswerViewSet, basename='answers')

urlpatterns = router.urls