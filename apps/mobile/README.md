# RhinoConnect Mobile

Premium Flutter customer app for the RhinoConnect local-services marketplace.

## Current Customer MVP

- Login and register screen
- Service discovery with category and search filters
- Premium service cards
- Service detail screen
- Image gallery and full-screen media preview
- Video preview layout with play affordance
- Booking request flow
- Trip history and deposit action
- Profile and account settings shell
- API client configured for the MongoDB-backed Next.js backend

## Run

Install Flutter, then run:

```bash
cd apps/mobile
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api/v1
```

Use `10.0.2.2` for Android emulator access to localhost. Use your machine IP for a physical phone.

## Design Direction

The mobile app is designed as a calm premium marketplace for travelers booking under time pressure, often from airports, hotel lobbies, or outdoor travel contexts. It uses clear touch targets, safe-area-aware navigation, high contrast text, restrained color, and progressive booking steps.

## Next Mobile Steps

- Harden token refresh and password reset
- Add saved providers and favorite services
- Add provider chat after customer booking works end to end
- Add provider app flows after customer booking works end to end
