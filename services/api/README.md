# RhinoConnect API

Django REST Framework backend for the global local-services marketplace.

## Included

- Django project configuration
- Optional PostgreSQL-ready relational API through `DATABASE_URL`
- Custom user model with marketplace roles
- Provider profiles
- Categories
- Service listings
- Service media
- Availability rules and blocks
- Bookings
- Payments and payouts
- Reviews
- Notifications
- Admin registrations
- Token-based customer registration and login
- Token logout
- Public marketplace discovery APIs
- City, country, category slug, provider slug, and price discovery filters
- Provider-owned service and media CRUD
- Booking request and status workflow
- Test/manual payment intent workflow
- Booking payment status sync
- Completed-booking review submission
- Health endpoint
- OpenAPI schema and Swagger UI

## Setup

```bash
cd services/api
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
$env:DATABASE_URL="postgresql://rhinoconnect:password@localhost:5432/rhinoconnect"
python manage.py migrate
python manage.py runserver 8000
```

The primary RhinoConnect web and mobile product uses the MongoDB-backed Next.js API in `apps/web`. This Django API is kept as an optional relational backend and no longer creates a local file database by default.

Health check:

```text
http://127.0.0.1:8000/api/v1/health/
```

API docs:

```text
http://127.0.0.1:8000/api/docs/
```

## Marketplace Routes

```text
POST /api/v1/auth/register/
POST /api/v1/auth/login/
POST /api/v1/auth/logout/
GET/PATCH /api/v1/auth/me/
GET /api/v1/categories/
GET/POST /api/v1/providers/
GET/POST /api/v1/services/
GET/POST /api/v1/service-media/
GET/POST /api/v1/bookings/
POST /api/v1/bookings/{id}/set-status/
GET/POST /api/v1/reviews/
GET /api/v1/payments/
POST /api/v1/payments/intents/
POST /api/v1/payments/{id}/mark-succeeded/
GET /api/v1/payouts/
GET /api/v1/notifications/
POST /api/v1/notifications/{id}/mark_read/
```

## Verification

```bash
python manage.py check
python manage.py test apps.bookings
python manage.py makemigrations --check --dry-run
```
