from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.bookings.models import Booking
from apps.categories.models import Category
from apps.notifications.models import Notification
from apps.providers.models import ProviderProfile
from apps.reviews.models import Review
from apps.services.models import ServiceListing, ServiceMedia

User = get_user_model()


class MarketplaceApiTests(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="StrongPass123!",
            first_name="Customer",
        )
        self.provider_user = User.objects.create_user(
            username="provider",
            email="provider@example.com",
            password="StrongPass123!",
            role=User.Role.PROVIDER,
        )
        self.category = Category.objects.create(name="Wellness", slug="wellness")
        self.provider = ProviderProfile.objects.create(
            owner=self.provider_user,
            category=self.category,
            business_name="Himalaya Haven Lodge",
            slug="himalaya-haven",
            verification_status=ProviderProfile.VerificationStatus.VERIFIED,
            city="Kathmandu",
            country="Nepal",
        )
        self.service = ServiceListing.objects.create(
            provider=self.provider,
            category=self.category,
            title="Yoga & Wellness Retreat",
            slug="yoga-wellness-retreat",
            description="Three day retreat with yoga, meals, and wellness activities.",
            service_type=ServiceListing.ServiceType.WELLNESS,
            base_price=12000,
            capacity=4,
            duration_minutes=180,
        )
        ServiceMedia.objects.create(
            service=self.service,
            media_type=ServiceMedia.MediaType.IMAGE,
            title="Retreat room",
            url="https://example.com/retreat.jpg",
        )

    def booking_payload(self):
        start_at = timezone.now() + timedelta(days=10)
        end_at = start_at + timedelta(days=3)
        return {
            "service_id": self.service.id,
            "start_at": start_at.isoformat(),
            "end_at": end_at.isoformat(),
            "guests": 2,
            "notes": "Vegetarian meals preferred.",
        }

    def test_auth_register_returns_token_and_user(self):
        response = self.client.post(
            "/api/v1/auth/register/",
            {
                "email": "new.customer@example.com",
                "password": "StrongPass123!",
                "first_name": "New",
                "last_name": "Customer",
                "country": "Nepal",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["user"]["email"], "new.customer@example.com")

    def test_public_service_discovery_includes_media(self):
        response = self.client.get("/api/v1/services/", {"search": "wellness"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        service = response.data["results"][0]
        self.assertEqual(service["title"], "Yoga & Wellness Retreat")
        self.assertEqual(len(service["media"]), 1)

    def test_customer_can_create_booking_request(self):
        self.client.force_authenticate(self.customer)
        response = self.client.post("/api/v1/bookings/", self.booking_payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], Booking.Status.PENDING)
        self.assertEqual(response.data["total_amount"], "12000.00")
        self.assertTrue(Notification.objects.filter(user=self.provider_user, title="New booking request").exists())

    def test_provider_can_confirm_customer_booking(self):
        self.client.force_authenticate(self.customer)
        booking_response = self.client.post("/api/v1/bookings/", self.booking_payload(), format="json")
        booking_id = booking_response.data["id"]

        self.client.force_authenticate(self.provider_user)
        response = self.client.post(
            f"/api/v1/bookings/{booking_id}/set-status/",
            {"status": Booking.Status.CONFIRMED},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], Booking.Status.CONFIRMED)

    def test_customer_can_review_completed_booking(self):
        booking = Booking.objects.create(
            booking_ref="RHC-TEST-001",
            customer=self.customer,
            provider=self.provider,
            service=self.service,
            status=Booking.Status.COMPLETED,
            start_at=timezone.now() - timedelta(days=5),
            end_at=timezone.now() - timedelta(days=2),
            guests=2,
            subtotal_amount=12000,
            commission_amount=1200,
            provider_payout_amount=10800,
            total_amount=12000,
        )

        self.client.force_authenticate(self.customer)
        response = self.client.post(
            "/api/v1/reviews/",
            {"booking_id": booking.id, "rating": 5, "comment": "Excellent service."},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Review.objects.filter(booking=booking, rating=5).exists())
        self.service.refresh_from_db()
        self.assertEqual(self.service.rating_count, 1)
