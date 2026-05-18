# MVP Roadmap

## MVP Goal

Launch a focused marketplace where customers can discover and book trusted local services in Nepal, while providers can manage listings, calendars, bookings, and payments.

## MVP Scope

### Customer App

- Register/login
- Browse categories
- Search by location and date
- View service profile
- View image/video gallery
- Request booking
- Pay deposit
- Track booking status
- Leave review after completion

### Provider Tools

- Provider onboarding
- Profile setup
- Service listing CRUD
- Gallery upload or URL entry
- Availability management
- Booking inbox
- Accept/reject booking
- Payment status tracking

### Admin Tools

- Provider approval
- Category management
- Listing moderation
- Booking visibility
- Payment/dispute overview

## Version Plan

### V0.1: Current SaaS MVP

Already built in this repo.

- Next.js web app
- Provider dashboard
- Public booking page
- Service CRUD with gallery
- Local JSON storage

### V0.2: Marketplace Foundation

- Monorepo structure
- Django API skeleton
- PostgreSQL schema
- Auth and roles
- Provider, category, listing, and booking models
- OpenAPI schema

### V0.3: Customer Booking API

- Public listing search
- Service detail API
- Booking request API
- Booking status API
- Basic review API

### V0.4: Flutter Customer MVP

- Auth
- Discovery
- Service detail
- Gallery preview
- Booking flow
- Booking history

### V0.5: Provider Operations

- Provider mobile/web dashboard
- Listing management
- Calendar
- Booking inbox
- Notifications

### V0.6: Payments

- Stripe test mode
- Deposit payment
- Webhook verification
- Payment status sync
- Provider payout records

### V0.7: Trust and Admin

- Provider verification
- Listing moderation
- Review moderation
- Dispute records
- Refund tracking

### V1.0: Production Launch

- Staging and production deployments
- Monitoring
- Backups
- Rate limits
- Error tracking
- Legal pages
- Support workflow

## Launch Metrics

Track these from the beginning:

- Customer signup conversion
- Search-to-service-detail conversion
- Service-detail-to-booking conversion
- Booking acceptance rate
- Payment success rate
- Provider response time
- Repeat booking rate
- Average rating
- Dispute rate

## First Market

Start with Nepal and high-intent categories:

- Trekking packages
- Hotels and homestays
- Airport transfer
- Wellness retreats
- Local tours
- Event spaces

These match the current RhinoPeak Connect domain and make the transition easier.
