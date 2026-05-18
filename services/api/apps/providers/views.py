from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, response, viewsets
from rest_framework.decorators import action

from apps.permissions import IsProviderOwnerOrStaffOrReadOnly, is_staff_user

from .models import ProviderProfile
from .serializers import ProviderProfileSerializer


class ProviderProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProviderProfileSerializer
    permission_classes = [IsProviderOwnerOrStaffOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "verification_status", "city", "country"]
    search_fields = ["business_name", "description", "city", "country"]
    ordering_fields = ["business_name", "rating_average", "created_at"]

    def get_queryset(self):
        queryset = ProviderProfile.objects.select_related("owner", "category")
        user = self.request.user
        if is_staff_user(user):
            return queryset
        if user.is_authenticated:
            return queryset.filter(Q(verification_status=ProviderProfile.VerificationStatus.VERIFIED) | Q(owner=user))
        return queryset.filter(verification_status=ProviderProfile.VerificationStatus.VERIFIED)

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        queryset = self.get_queryset().filter(owner=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return response.Response(serializer.data)
