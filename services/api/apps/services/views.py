from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets

from apps.permissions import IsProviderOwnerOrStaffOrReadOnly, is_staff_user

from .models import ServiceListing, ServiceMedia
from .serializers import ServiceListingSerializer, ServiceMediaSerializer


class ServiceListingViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceListingSerializer
    permission_classes = [IsProviderOwnerOrStaffOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "provider", "service_type", "active", "instant_booking_enabled", "currency"]
    search_fields = [
        "title",
        "description",
        "provider__business_name",
        "provider__city",
        "provider__country",
        "category__name",
    ]
    ordering_fields = ["base_price", "rating_average", "created_at", "title"]

    def get_queryset(self):
        queryset = (
            ServiceListing.objects.select_related("provider", "provider__owner", "category")
            .prefetch_related("media")
            .all()
        )
        user = self.request.user
        if is_staff_user(user):
            return queryset
        if user.is_authenticated:
            return queryset.filter(Q(active=True) | Q(provider__owner=user))
        return queryset.filter(active=True)

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated()]
        return super().get_permissions()


class ServiceMediaViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceMediaSerializer
    permission_classes = [IsProviderOwnerOrStaffOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["service", "media_type"]
    ordering_fields = ["sort_order", "created_at"]

    def get_queryset(self):
        queryset = ServiceMedia.objects.select_related("service", "service__provider", "service__provider__owner")
        user = self.request.user
        if is_staff_user(user):
            return queryset
        if user.is_authenticated:
            return queryset.filter(Q(service__active=True) | Q(service__provider__owner=user))
        return queryset.filter(service__active=True)

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated()]
        return super().get_permissions()
