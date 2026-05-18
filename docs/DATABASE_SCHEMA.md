# Database Schema

This is the production schema direction for the Django/PostgreSQL version. Use UUID primary keys for public-facing records.

## Core Tables

### users

- id
- email
- phone
- password_hash
- role: customer, provider, staff, admin
- is_active
- is_verified
- created_at
- updated_at

Indexes:

- unique email
- unique phone where phone is not null
- role

### customer_profiles

- id
- user_id
- full_name
- avatar_url
- country
- default_location
- created_at

### provider_profiles

- id
- owner_user_id
- business_name
- slug
- description
- category_id
- verification_status
- rating_average
- rating_count
- address
- city
- country
- location geography(Point, 4326)
- created_at
- updated_at

Indexes:

- unique slug
- category_id
- verification_status
- city, country
- location GiST index

### categories

- id
- parent_id
- name
- slug
- icon
- active
- sort_order

### service_listings

- id
- provider_id
- category_id
- title
- slug
- description
- service_type
- base_price
- currency
- pricing_unit
- duration_minutes
- capacity
- deposit_percent
- instant_booking_enabled
- active
- rating_average
- rating_count
- created_at
- updated_at

Indexes:

- provider_id
- category_id
- active
- base_price
- rating_average
- provider_id, slug unique

### service_media

- id
- service_id
- media_type: image, video
- url
- thumbnail_url
- title
- description
- sort_order
- created_at

### availability_rules

- id
- service_id
- weekday
- start_time
- end_time
- capacity
- active

### availability_blocks

- id
- service_id
- start_at
- end_at
- reason
- capacity_override
- created_at

### bookings

- id
- booking_ref
- customer_id
- provider_id
- service_id
- status: pending, confirmed, cancelled, completed, disputed
- payment_status: unpaid, partial, paid, refunded
- start_at
- end_at
- guests
- subtotal_amount
- discount_amount
- commission_amount
- provider_payout_amount
- total_amount
- currency
- notes
- cancellation_reason
- created_at
- updated_at

Indexes:

- unique booking_ref
- customer_id
- provider_id
- service_id
- status
- payment_status
- start_at, end_at

### payments

- id
- booking_id
- provider_id
- customer_id
- gateway
- gateway_payment_id
- amount
- currency
- status
- paid_at
- created_at

### payouts

- id
- provider_id
- booking_id
- amount
- currency
- status
- scheduled_at
- paid_at

### reviews

- id
- booking_id
- customer_id
- provider_id
- service_id
- rating
- comment
- provider_reply
- created_at

Indexes:

- provider_id
- service_id
- rating

### chat_threads

- id
- booking_id
- customer_id
- provider_id
- last_message_at
- created_at

### chat_messages

- id
- thread_id
- sender_id
- message_type: text, image, system
- body
- media_url
- read_at
- created_at

### notifications

- id
- user_id
- channel: in_app, email, push, whatsapp
- title
- body
- status
- payload_json
- created_at
- sent_at

## High-Traffic Notes

- Use pagination on every list endpoint.
- Add composite indexes around provider calendars and booking lookup paths.
- Cache popular discovery queries in Redis.
- Keep media in object storage, not PostgreSQL.
- Use background jobs for notifications, payment reconciliation, and analytics.
- Avoid storing large AI prompts or media blobs in relational rows.
