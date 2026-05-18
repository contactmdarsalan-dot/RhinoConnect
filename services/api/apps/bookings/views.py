from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, mixins, permissions, response, status, viewsets
from rest_framework.decorators import action

from apps.notifications.models import Notification
from apps.permissions import is_staff_user

from .models import Booking
from .serializers import BookingSerializer, BookingStatusSerializer


class BookingViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "payment_status", "provider", "service"]
    ordering_fields = ["created_at", "start_at", "total_amount"]

    def get_queryset(self):
        queryset = Booking.objects.select_related(
            "customer",
            "provider",
            "provider__owner",
            "provider__category",
            "service",
            "service__category",
        ).prefetch_related("service__media")
        user = self.request.user
        if is_staff_user(user):
            return queryset
        return queryset.filter(Q(customer=user) | Q(provider__owner=user))

    def perform_create(self, serializer):
        booking = serializer.save()
        Notification.objects.create(
            user=booking.provider.owner,
            title="New booking request",
            body=f"{booking.customer} requested {booking.service.title}.",
            payload={"booking_id": booking.id, "booking_ref": booking.booking_ref},
        )

    @action(detail=True, methods=["post"], url_path="set-status")
    def set_status(self, request, pk=None):
        booking = self.get_object()
        next_status = request.data.get("status")
        user = request.user
        provider_owned = booking.provider.owner_id == user.id
        customer_owned = booking.customer_id == user.id

        if not is_staff_user(user):
            if next_status in {Booking.Status.CONFIRMED, Booking.Status.REJECTED, Booking.Status.COMPLETED, Booking.Status.DISPUTED}:
                allowed_actor = provider_owned
            elif next_status == Booking.Status.CANCELLED:
                allowed_actor = customer_owned or provider_owned
            else:
                allowed_actor = False
            if not allowed_actor:
                return response.Response(
                    {"detail": "You do not have permission to apply this booking status."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = BookingStatusSerializer(data=request.data, context={"booking": booking})
        serializer.is_valid(raise_exception=True)
        booking.status = serializer.validated_data["status"]
        if booking.status == Booking.Status.CANCELLED:
            booking.cancellation_reason = serializer.validated_data.get("cancellation_reason", "")
        booking.save(update_fields=["status", "cancellation_reason", "updated_at"])

        target_user = booking.customer if provider_owned else booking.provider.owner
        Notification.objects.create(
            user=target_user,
            title="Booking status updated",
            body=f"{booking.booking_ref} is now {booking.get_status_display()}.",
            payload={"booking_id": booking.id, "booking_ref": booking.booking_ref, "status": booking.status},
        )
        return response.Response(BookingSerializer(booking, context={"request": request}).data)
