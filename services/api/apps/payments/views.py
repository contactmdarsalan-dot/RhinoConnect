from django.db.models import Q
from django.db.models import Sum
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, response, status, viewsets
from rest_framework.decorators import action

from apps.bookings.models import Booking
from apps.notifications.models import Notification
from apps.permissions import is_staff_user

from .models import Payment, Payout
from .serializers import PaymentIntentSerializer, PaymentSerializer, PayoutSerializer


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

    @action(detail=False, methods=["post"], url_path="intents")
    def create_intent(self, request):
        serializer = PaymentIntentSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()
        data = {
            "payment": PaymentSerializer(payment).data,
            "client_secret": f"{payment.gateway_payment_id}_secret_{payment.id}",
            "mode": "test" if payment.gateway in {"test", "manual"} else "gateway",
        }
        return response.Response(data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="mark-succeeded")
    def mark_succeeded(self, request, pk=None):
        payment = self.get_object()
        user = request.user
        if not (is_staff_user(user) or payment.customer_id == user.id or payment.provider.owner_id == user.id):
            return response.Response({"detail": "You do not have permission to update this payment."}, status=403)
        if payment.status == Payment.Status.SUCCEEDED:
            return response.Response(PaymentSerializer(payment).data)
        if payment.status not in {Payment.Status.REQUIRES_PAYMENT, Payment.Status.PROCESSING}:
            return response.Response({"detail": "Only pending payments can be marked succeeded."}, status=400)

        payment.status = Payment.Status.SUCCEEDED
        payment.paid_at = timezone.now()
        payment.save(update_fields=["status", "paid_at"])

        booking = payment.booking
        paid_total = (
            Payment.objects.filter(booking=booking, status=Payment.Status.SUCCEEDED).aggregate(total=Sum("amount"))[
                "total"
            ]
            or 0
        )
        booking.payment_status = (
            Booking.PaymentStatus.PAID if paid_total >= booking.total_amount else Booking.PaymentStatus.PARTIAL
        )
        booking.save(update_fields=["payment_status", "updated_at"])

        if booking.payment_status == Booking.PaymentStatus.PAID:
            Payout.objects.get_or_create(
                booking=booking,
                provider=booking.provider,
                defaults={
                    "amount": booking.provider_payout_amount,
                    "currency": booking.currency,
                    "status": Payout.Status.PENDING,
                },
            )

        Notification.objects.create(
            user=booking.provider.owner,
            title="Payment received",
            body=f"{booking.booking_ref} received {payment.amount} {payment.currency}.",
            payload={"booking_id": booking.id, "payment_id": payment.id, "payment_status": booking.payment_status},
        )
        return response.Response(PaymentSerializer(payment).data)


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
