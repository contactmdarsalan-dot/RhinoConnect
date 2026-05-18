# RhinoConnect API

Django REST Framework backend for the global local-services marketplace.

## Included

- Django project configuration
- SQLite local default with PostgreSQL-ready `DATABASE_URL`
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
- Public marketplace discovery APIs
- Provider-owned service and media CRUD
- Booking request and status workflow
- Completed-booking review submission
- Health endpoint
- OpenAPI schema and Swagger UI

## Setup

```bash
cd services/api
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

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
GET/PATCH /api/v1/auth/me/
GET /api/v1/categories/
GET/POST /api/v1/providers/
GET/POST /api/v1/services/
GET/POST /api/v1/service-media/
GET/POST /api/v1/bookings/
POST /api/v1/bookings/{id}/set-status/
GET/POST /api/v1/reviews/
GET /api/v1/payments/
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
