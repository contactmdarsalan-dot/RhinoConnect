# API Design

The production backend should expose versioned REST APIs from Django REST Framework.

## API Principles

- Use `/api/v1` for all public mobile/web APIs.
- Use UUIDs for public resource IDs.
- Paginate every list endpoint.
- Validate all request bodies with serializers.
- Keep provider-only, customer-only, and admin-only actions permissioned.
- Return stable error shapes.
- Generate OpenAPI docs and typed clients.

## Response Shape

Successful response:

```json
{
  "data": {}
}
```

Validation error:

```json
{
  "error": {
    "message": "Validation failed",
    "details": {}
  }
}
```

Paginated response:

```json
{
  "data": {
    "items": [],
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

## Core Endpoints

### Auth

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Categories

```text
GET  /api/v1/categories
POST /api/v1/admin/categories
PATCH /api/v1/admin/categories/{id}
```

### Providers

```text
POST /api/v1/providers/onboarding
GET  /api/v1/providers/{id}
GET  /api/v1/providers/me
PATCH /api/v1/providers/me
POST /api/v1/admin/providers/{id}/approve
POST /api/v1/admin/providers/{id}/reject
```

### Services

```text
GET    /api/v1/services
GET    /api/v1/services/{id}
POST   /api/v1/provider/services
PATCH  /api/v1/provider/services/{id}
DELETE /api/v1/provider/services/{id}
POST   /api/v1/provider/services/{id}/media
DELETE /api/v1/provider/services/{id}/media/{media_id}
```

Common service query params:

```text
category
city
country
lat
lng
radius_km
min_price
max_price
date
guests
rating
sort
page
limit
```

### Bookings

```text
POST  /api/v1/bookings
GET   /api/v1/bookings
GET   /api/v1/bookings/{id}
POST  /api/v1/bookings/{id}/cancel
POST  /api/v1/provider/bookings/{id}/accept
POST  /api/v1/provider/bookings/{id}/reject
POST  /api/v1/provider/bookings/{id}/complete
```

### Payments

```text
POST /api/v1/payments/intents
GET  /api/v1/payments/{id}
POST /api/v1/payments/webhooks/stripe
POST /api/v1/payments/webhooks/esewa
POST /api/v1/payments/webhooks/khalti
```

### Reviews

```text
POST /api/v1/bookings/{id}/reviews
GET  /api/v1/services/{id}/reviews
GET  /api/v1/providers/{id}/reviews
```

### Chat

```text
GET  /api/v1/chat/threads
GET  /api/v1/chat/threads/{id}/messages
POST /api/v1/chat/threads/{id}/messages
```

WebSocket:

```text
/ws/chat/{thread_id}
/ws/bookings/{booking_id}
```

## Booking State Machine

```text
pending -> confirmed -> completed
pending -> rejected
pending -> cancelled
confirmed -> cancelled
confirmed -> disputed
completed -> disputed
```

Payment state:

```text
unpaid -> partial -> paid
unpaid -> failed
partial -> refunded
paid -> refunded
```

## API Security

- Use short-lived access tokens and refresh tokens.
- Verify payment webhooks with provider signatures.
- Rate-limit auth, booking, payment, and chat endpoints.
- Require ownership checks on provider resources.
- Log admin actions and booking status transitions.
- Store secrets only in environment variables or secret managers.
