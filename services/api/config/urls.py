from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter

from apps.accounts.views import LoginView, MeView, RegisterView
from apps.bookings.views import BookingViewSet
from apps.categories.views import CategoryViewSet
from apps.notifications.views import NotificationViewSet
from apps.payments.views import PaymentViewSet, PayoutViewSet
from apps.providers.views import ProviderProfileViewSet
from apps.reviews.views import ReviewViewSet
from apps.services.views import ServiceListingViewSet, ServiceMediaViewSet


def health(_request):
    return JsonResponse({"status": "ok", "service": "rhinoconnect-api"})


router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("providers", ProviderProfileViewSet, basename="provider")
router.register("services", ServiceListingViewSet, basename="service")
router.register("service-media", ServiceMediaViewSet, basename="service-media")
router.register("bookings", BookingViewSet, basename="booking")
router.register("reviews", ReviewViewSet, basename="review")
router.register("payments", PaymentViewSet, basename="payment")
router.register("payouts", PayoutViewSet, basename="payout")
router.register("notifications", NotificationViewSet, basename="notification")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/health/", health, name="api-health"),
    path("api/v1/auth/register/", RegisterView.as_view(), name="api-register"),
    path("api/v1/auth/login/", LoginView.as_view(), name="api-login"),
    path("api/v1/auth/me/", MeView.as_view(), name="api-me"),
    path("api/v1/", include(router.urls)),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
