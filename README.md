# RhinoPeak Connect

Smart Booking + Customer Engagement Platform for tourism, hospitality, and service businesses in Nepal.

## What Is Included

- Public booking page at `/book/himalaya-haven`
- Admin dashboard with revenue, bookings, customers, occupancy, and charts
- Services catalog with CRUD, pricing, availability fields, and image/video galleries
- Booking CRUD flow with server-side validation and availability checks
- Customer CRM with profiles, tags, booking history, and spend tracking
- Payment tracker with invoice numbers, partial payments, paid/refunded states
- Availability calendar with capacity blocks and override controls
- Business settings, billing tier UI, and notification channel settings
- Backend API routes for all major data workflows
- Persistent local storage with atomic writes for demo/development

## Repository Structure

```text
apps/
  web/                  # Current Next.js provider/admin and public booking app
  mobile/               # Flutter app placeholder for the marketplace phase
services/
  api/                  # Django REST API foundation
  worker/               # Celery worker placeholder
packages/
  contracts/            # Shared API contract placeholder
infra/                  # Docker, Terraform, and Nginx placeholders
docs/                   # Marketplace blueprint and implementation roadmap
```

## Tech Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Zustand for client state
- Zod for backend input validation
- Recharts for analytics
- Framer Motion for product UI transitions

## Run Locally

```bash
npm install
npm run dev
```

The root scripts currently run the `apps/web` workspace.

Useful backend scripts:

```bash
npm run api:check
npm run api:migrate
npm run api:dev
```

Open:

- Admin login: `http://localhost:3000`
- Dashboard: `http://localhost:3000/dashboard`
- Public booking page: `http://localhost:3000/book/himalaya-haven`
- Health check: `http://localhost:3000/api/health`

Demo login is pre-filled on the home page.

## Backend Architecture

The current web MVP backend uses Next.js route handlers under `apps/web/src/app/api`.

Web app layers:

- `apps/web/src/server/validation.ts`: Zod schemas for incoming API payloads
- `apps/web/src/server/repository.ts`: business logic, analytics, availability checks, customer stats
- `apps/web/src/server/storage.ts`: persistent JSON storage with serialized writes
- `apps/web/src/server/seed.ts`: initial demo dataset and service catalog

The current local data file is created automatically at:

```text
apps/web/data/rhinopeak-connect.json
```

Set `RPC_DATA_DIR` to move local storage elsewhere.

## Django API Foundation

The marketplace backend lives in `services/api`.

It includes:

- Django REST Framework setup
- Custom user roles
- Provider profiles
- Categories
- Service listings and media
- Token-based customer registration and login
- Public marketplace discovery APIs
- Provider-owned service and media CRUD
- Booking request and status workflow
- Availability rules and blocks
- Bookings
- Payments and payouts
- Reviews
- Notifications
- Admin panel registration
- Health endpoint at `/api/v1/health/`
- OpenAPI schema at `/api/schema/`
- Swagger UI at `/api/docs/`

Local setup:

```bash
cd services/api
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

Key marketplace endpoints:

- `POST /api/v1/auth/register/`
- `POST /api/v1/auth/login/`
- `GET/PATCH /api/v1/auth/me/`
- `GET /api/v1/categories/`
- `GET/POST /api/v1/providers/`
- `GET/POST /api/v1/services/`
- `GET/POST /api/v1/service-media/`
- `GET/POST /api/v1/bookings/`
- `POST /api/v1/bookings/{id}/set-status/`
- `GET/POST /api/v1/reviews/`

## Main API Routes

- `GET /api/bootstrap`
- `GET /api/dashboard`
- `GET/POST /api/services`
- `GET/PATCH/DELETE /api/services/:id`
- `GET/POST /api/bookings`
- `GET/PATCH/DELETE /api/bookings/:id`
- `GET/POST /api/customers`
- `PATCH /api/customers/:id`
- `GET /api/payments`
- `PATCH /api/payments/:id`
- `GET/POST /api/availability`
- `DELETE /api/availability/:id`
- `GET/PATCH /api/settings`
- `GET /api/public/business/:slug`
- `POST /api/public/bookings`

## Scaling Path

The MVP is functional without external services, but the code is organized so production scaling is straightforward:

- Replace `apps/web/src/server/storage.ts` with PostgreSQL access through Prisma, Drizzle, or node-postgres.
- Add indexes for `business_id`, `customer_id`, `booking_ref`, `check_in`, `check_out`, `status`, and `created_at`.
- Put Redis in front of read-heavy dashboard aggregates and availability lookups.
- Move automation delivery to a queue worker for WhatsApp, email, and reminders.
- Add authentication, tenant isolation, and role-based access before real customer deployment.
- Keep route pagination limits in place for memory efficiency under high traffic.

## Global Marketplace Roadmap

The next product direction is RhinoConnect as a global local-services marketplace mobile platform.

Read the implementation blueprint in [`docs/`](./docs/README.md):

- [Global marketplace blueprint](./docs/GLOBAL_MARKETPLACE_BLUEPRINT.md)
- [Mobile and backend architecture](./docs/MOBILE_BACKEND_ARCHITECTURE.md)
- [Database schema](./docs/DATABASE_SCHEMA.md)
- [API design](./docs/API_DESIGN.md)
- [Implementation steps](./docs/IMPLEMENTATION_STEPS.md)
- [MVP roadmap](./docs/MVP_ROADMAP.md)
- [DevOps, security, and performance](./docs/DEVOPS_SECURITY.md)

## Verification

```bash
npm run lint
npm run build
```

Both commands pass on the current project state.
