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
- MongoDB-backed web storage with automatic indexes, demo seeding, and serialized writes
- Flutter customer mobile app scaffold with premium booking UX

## Repository Structure

```text
apps/
  web/                  # Current Next.js provider/admin and public booking app
  mobile/               # Flutter customer app source
services/
  api/                  # Optional Django REST API
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

The web app now uses MongoDB storage. Set one of these environment variables before running the app:

```powershell
$env:RPC_MONGODB_URI="mongodb://127.0.0.1:27017/rhinoconnect"
npm run dev
```

`MONGODB_URI` or `MONGO_URL` are also supported. Use `RPC_MONGODB_DB` or `MONGODB_DB` to override the database name. The storage adapter creates the required `rpc_*` collections, builds indexes, and seeds the Himalaya Haven demo data on first run.

Optional Django relational API scripts require `DATABASE_URL`:

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
- `apps/web/src/server/storage.ts`: MongoDB storage adapter using the official driver, `rpc_*` collections, indexed records, and lock-protected serialized writes
- `apps/web/src/server/seed.ts`: initial demo dataset and service catalog

The web adapter is intentionally compatible with the current repository contract, so existing dashboard, booking, services, CRM, payments, availability, and public booking routes keep working while the storage layer moves from local demo files to production database infrastructure.

Mobile-facing API routes live under `apps/web/src/app/api/v1` and use the same MongoDB storage layer.

## Optional Django API

An optional relational marketplace backend lives in `services/api`. The active web and mobile product uses the MongoDB-backed Next.js API.

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
$env:DATABASE_URL="postgresql://rhinoconnect:password@localhost:5432/rhinoconnect"
python manage.py migrate
python manage.py runserver 8000
```

Key marketplace endpoints:

- `POST /api/v1/auth/register/`
- `POST /api/v1/auth/login/`
- `POST /api/v1/auth/logout/`
- `GET/PATCH /api/v1/auth/me/`
- `GET /api/v1/categories/`
- `GET/POST /api/v1/providers/`
- `GET/POST /api/v1/services/`
- `GET/POST /api/v1/service-media/`
- `GET/POST /api/v1/bookings/`
- `POST /api/v1/bookings/{id}/set-status/`
- `GET/POST /api/v1/reviews/`
- `POST /api/v1/payments/intents/`
- `POST /api/v1/payments/{id}/mark-succeeded/`

## Mobile App

The Flutter customer MVP source lives in `apps/mobile`.

Current mobile flow:

- Login/register
- Browse and search services
- View service detail, image gallery, and full-screen media preview
- Request a booking
- Track trips and mark test deposit payment
- Manage profile shell

Run after installing Flutter:

```bash
cd apps/mobile
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api/v1
```

The mobile app now uses the MongoDB-backed Next.js API for registration, login, service discovery, booking creation, and test deposit payments. New mobile accounts are stored through `POST /api/v1/auth/register` in MongoDB.

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
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/services`
- `GET/POST /api/v1/bookings`
- `POST /api/v1/payments/intents`
- `POST /api/v1/payments/:id/mark-succeeded`

## Scaling Path

The MVP now uses MongoDB for the Next.js web and mobile APIs, while the Django API remains optional for future relational deployments. The next production scaling steps are:

- Keep `apps/web/src/server/storage.ts` pointed at managed MongoDB through `RPC_MONGODB_URI`, `MONGODB_URI`, or `MONGO_URL`.
- The MongoDB storage adapter creates indexes for mobile users, service type/name, customer email, booking ref, customer id, service id, check-in/check-out, status, payment status/date, notification read state, and created timestamps.
- Put Redis in front of read-heavy dashboard aggregates and availability lookups.
- Move automation delivery to a queue worker for WhatsApp, email, and reminders.
- Add authentication, tenant isolation, and role-based access before real customer deployment.
- Promote the hottest dashboard/report queries from full-document adapter reads into targeted MongoDB repository queries after the first live customer validates the workflow.
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
