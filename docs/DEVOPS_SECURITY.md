# DevOps, Security, and Performance

## Environments

Use three environments:

- Local: developer machines
- Staging: production-like testing
- Production: real users and payments

Each environment needs separate:

- Database
- Redis
- Object storage bucket
- Payment keys
- Email/push credentials
- Environment variables

## Deployment Architecture

Recommended production shape:

```text
Mobile App -> API Gateway / Load Balancer -> Django API
                                      |-> WebSocket server
                                      |-> Celery workers
                                      |-> Redis
                                      |-> PostgreSQL + PostGIS
                                      |-> Object storage
```

## CI Pipeline

Run on every pull request:

- Web lint
- Web build
- API lint
- API tests
- Migration check
- Flutter analyze
- Flutter tests
- Secret scanning

## Database Strategy

- PostgreSQL with automated backups
- Point-in-time recovery in production
- Read replicas after traffic grows
- PostGIS for location search
- Index high-traffic query paths early

## Caching Strategy

Use Redis for:

- Category lists
- Popular discovery searches
- Provider rating summaries
- Session/token metadata
- Rate limit counters
- Celery broker and result backend

Do not cache booking writes or payment state without strict invalidation.

## Storage Strategy

Store images and videos in object storage:

- S3
- Cloudflare R2
- DigitalOcean Spaces
- Backblaze B2

Store only URLs, metadata, sort order, and ownership in PostgreSQL.

## Security Baseline

- HTTPS everywhere
- Secure password hashing
- JWT or session tokens with refresh rotation
- Role-based permissions
- Object-level ownership checks
- Payment webhook signature verification
- Admin audit logs
- Input validation on every API
- Rate limits on auth, booking, chat, and payment endpoints
- File upload size/type checks

## Performance Baseline

- Paginate all lists.
- Use database indexes before adding complex caching.
- Use background jobs for notifications and AI.
- Keep media out of the API process.
- Avoid loading full booking histories on dashboard pages.
- Use cursor pagination for chat messages.
- Use geospatial indexes for nearby search.

## Monitoring

Track:

- API latency
- Error rate
- Payment failures
- Booking conversion
- Provider response time
- Worker queue delay
- Database query time
- WebSocket connection count

Recommended tools:

- Sentry for errors
- OpenTelemetry for traces
- Grafana/Prometheus or hosted monitoring
- Structured JSON logs

## Backup and Recovery

Minimum production recovery plan:

- Daily database backups
- Point-in-time recovery
- Object storage lifecycle policy
- Documented restore test
- Separate staging restore environment

Backups are not complete until a restore has been tested.
