# RhinoConnect API

Django REST Framework backend foundation for the global local-services marketplace.

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

## Notes

The first backend milestone is intentionally focused on the database and admin foundation. Public marketplace APIs will be added in the next step.
