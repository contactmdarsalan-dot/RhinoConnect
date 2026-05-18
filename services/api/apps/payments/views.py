from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets

from apps.permissions import is_staff_user

from .models import Payment, Payout
from .serializers import PaymentSerializer, PayoutSerializer


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["booking", "provider", "customer", "gateway", "status"]
    ordering_fields = ["created_at", "amount", "paid_at"]

    def get_queryset(self):
        queryset = Payment.objects.select_related("booking", "provider", "provider__owner", "customer")
        user = self.request.user
        if is_staff_user(user):
            return queryset
        return queryset.filter(Q(customer=user) | Q(provider__owner=user))


class PayoutViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PayoutSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["provider", "booking", "status"]
    ordering_fields = ["created_at", "amount", "scheduled_at", "paid_at"]

    def get_queryset(self):
        queryset = Payout.objects.select_related("booking", "provider", "provider__owner")
        user = self.request.user
        if is_staff_user(user):
            return queryset
        return queryset.filter(provider__owner=user)
