# Mobile and Backend Architecture

## Current Repository Shape

The current Next.js app now lives in `apps/web`. Mobile, backend, worker, contracts, and infrastructure folders are scaffolded for the next phases.

```text
RhinoConnect/
  apps/
    web/                 # Current Next.js admin and public booking app
    mobile/              # Flutter customer/provider mobile app
  services/
    api/                 # Django REST API
    worker/              # Celery workers for async jobs
  packages/
    contracts/           # Shared OpenAPI schema and generated clients
  infra/
    docker/
    terraform/
    nginx/
  docs/
```

The web app should continue to work from the repo root through the workspace scripts while the mobile and backend modules are built.

## Flutter App Structure

```text
apps/mobile/lib/
  main.dart
  app/
    router.dart
    theme.dart
    config.dart
  features/
    auth/
    discovery/
    service_detail/
    booking/
    payments/
    chat/
    provider_dashboard/
    profile/
  core/
    api/
    models/
    storage/
    location/
    notifications/
    widgets/
```

## Django API Structure

```text
services/api/
  manage.py
  config/
    settings/
    urls.py
    asgi.py
    celery.py
  apps/
    accounts/
    providers/
    services/
    bookings/
    payments/
    reviews/
    chat/
    notifications/
    marketplace/
    ai/
```

## Backend Responsibilities

- Django REST Framework exposes versioned API endpoints.
- PostgreSQL stores transactional marketplace data.
- PostGIS powers distance and map queries.
- Redis handles caching, throttling, sessions, and Celery broker duties.
- Celery runs email, push notification, payment reconciliation, AI jobs, and scheduled reminders.
- WebSockets support chat and live booking updates.
- Object storage holds provider gallery images and videos.

## API Style

Use versioned REST first:

```text
/api/v1/auth/
/api/v1/categories/
/api/v1/providers/
/api/v1/services/
/api/v1/bookings/
/api/v1/payments/
/api/v1/reviews/
/api/v1/chat/
/api/v1/notifications/
```

Generate an OpenAPI schema from Django REST Framework and use it to create typed clients for Flutter and the web app.

## Maps and Location

- Store provider and service coordinates with PostGIS.
- Use bounding-box search for map viewport results.
- Use distance indexes for nearby services.
- Use Google Maps, Mapbox, or OpenStreetMap depending on cost and target country.

## Real-Time Features

Start with polling for the MVP where possible. Add WebSockets when the workflow needs immediacy:

- Chat messages
- Booking status updates
- Provider availability changes
- Admin support notifications

## AI Features

AI should be added after the core marketplace is stable.

Useful first AI features:

- Listing description assistant
- Customer support assistant
- Smart search intent matching
- Price suggestion based on demand, season, rating, and location
- Review quality and fraud detection signals

Keep AI outputs explainable and editable by providers.
