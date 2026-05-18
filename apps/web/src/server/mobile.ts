import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import type { Booking, Customer, MobileUser, Payment, ServiceMedia, ServiceOffering } from '@/lib/types';
import { ApiError } from './http';
import { createBooking } from './repository';
import { readDb, writeDb } from './storage';

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().max(180),
  password: z.string().min(8).max(120),
  first_name: z.string().trim().max(80).optional().default(''),
  last_name: z.string().trim().max(80).optional().default(''),
  country: z.string().trim().max(80).optional().default('Nepal'),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(180),
  password: z.string().min(1).max(120),
});

const bookingSchema = z.object({
  service_id: z.string().trim().min(1).optional(),
  serviceId: z.string().trim().min(1).optional(),
  start_at: z.string().trim().min(1),
  end_at: z.string().trim().min(1),
  guests: z.coerce.number().int().min(1).max(200),
  notes: z.string().trim().max(1000).optional().default(''),
});

const paymentIntentSchema = z.object({
  booking: z.string().trim().min(1),
  payment_kind: z.enum(['deposit', 'full']).optional().default('deposit'),
  gateway: z.string().trim().max(40).optional().default('test'),
});

type TokenPayload = {
  sub: string;
  exp: number;
};

function authSecret() {
  return process.env.RPC_AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'unsafe-local-rhinoconnect-mobile-auth-secret';
}

function base64UrlJson(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function signToken(userId: string) {
  const payload = base64UrlJson({
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  } satisfies TokenPayload);
  const signature = createHmac('sha256', authSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyToken(token: string): TokenPayload {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) throw new ApiError('Invalid or missing authentication token', 401);

  const expected = createHmac('sha256', authSecret()).update(payload).digest('base64url');
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new ApiError('Invalid or missing authentication token', 401);
  }

  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as TokenPayload;
  if (!decoded.sub || decoded.exp < Math.floor(Date.now() / 1000)) {
    throw new ApiError('Authentication token has expired', 401);
  }
  return decoded;
}

function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  return {
    salt,
    hash: scryptSync(password, salt, 64).toString('hex'),
  };
}

function verifyPassword(password: string, user: MobileUser) {
  const hash = scryptSync(password, user.passwordSalt, 64);
  const stored = Buffer.from(user.passwordHash, 'hex');
  return stored.length === hash.length && timingSafeEqual(hash, stored);
}

function dateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function dateFromApi(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new ApiError('Invalid booking date', 422);
  return dateOnly(parsed);
}

function categoryName(type: string) {
  const labels: Record<string, string> = {
    hotel: 'Hotels',
    homestay: 'Homestays',
    trekking: 'Trekking',
    travel: 'Travel',
    cafe: 'Cafes',
    wellness: 'Wellness',
    event: 'Events',
  };
  return labels[type] ?? 'Services';
}

function durationMinutes(service: ServiceOffering) {
  return Math.max(1, service.durationDays) * 24 * 60;
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

function publicUser(user: MobileUser) {
  const { firstName, lastName } = splitName(user.name);
  return {
    id: user.id,
    email: user.email,
    username: user.email.split('@')[0],
    first_name: firstName,
    last_name: lastName,
    full_name: user.name,
    phone: '',
    role: 'customer',
    country: user.country,
    avatar_url: '',
    is_verified: true,
    created_at: user.createdAt,
  };
}

function authPayload(user: MobileUser) {
  return {
    token: signToken(user.id),
    user: publicUser(user),
  };
}

function mediaToApi(media: ServiceMedia) {
  return {
    id: media.id,
    media_type: media.type,
    type: media.type,
    title: media.title,
    url: media.url,
    thumbnail_url: media.thumbnailUrl ?? '',
    description: media.description ?? '',
  };
}

export function serviceToApi(service: ServiceOffering, currency = 'NPR') {
  return {
    id: service.id,
    title: service.name,
    category_detail: {
      name: categoryName(service.type),
      slug: service.type,
    },
    service_type: service.type,
    description: service.description,
    base_price: service.basePrice,
    currency,
    duration_minutes: durationMinutes(service),
    capacity: service.capacity,
    deposit_percent: service.depositPercent,
    instant_booking_enabled: false,
    rating_average: 4.8,
    rating_count: 184,
    provider_detail: {
      business_name: 'Himalaya Haven Lodge',
      name: 'Himalaya Haven Lodge',
      city: 'Kathmandu',
      country: 'Nepal',
      verification_status: 'verified',
      rating_average: 4.8,
      rating_count: 184,
    },
    media: service.gallery.map(mediaToApi),
  };
}

export function bookingToApi(booking: Booking, service?: ServiceOffering, currency = 'NPR') {
  return {
    id: booking.id,
    booking_ref: booking.bookingRef,
    service: service
      ? serviceToApi(service, currency)
      : {
          id: booking.serviceId ?? booking.service,
          title: booking.service,
          service_type: booking.serviceType,
          description: '',
          base_price: booking.amount,
          currency,
          duration_minutes: 1440,
          capacity: booking.guests,
          deposit_percent: 30,
          provider_detail: null,
          media: [],
        },
    start_at: `${booking.checkIn}T00:00:00.000Z`,
    end_at: `${booking.checkOut}T00:00:00.000Z`,
    guests: booking.guests,
    status: booking.status,
    payment_status: booking.paymentStatus,
    total_amount: booking.amount,
    currency,
    notes: booking.notes ?? '',
    created_at: booking.createdAt,
    updated_at: booking.updatedAt,
  };
}

function paymentToApi(payment: Payment) {
  return {
    id: payment.id,
    booking: payment.bookingId,
    gateway: payment.method || 'test',
    gateway_payment_id: payment.invoiceNumber ?? payment.id,
    amount: payment.remaining > 0 ? payment.remaining : payment.amount,
    currency: 'NPR',
    status: payment.status === 'unpaid' ? 'requires_payment' : payment.status,
    paid_at: payment.status === 'paid' || payment.status === 'partial' ? new Date().toISOString() : null,
    created_at: payment.date,
  };
}

export async function registerMobileUser(rawInput: unknown) {
  const input = registerSchema.parse(rawInput);
  const email = input.email.toLowerCase();
  const name = input.name?.trim() || [input.first_name, input.last_name].filter(Boolean).join(' ').trim();
  const { hash, salt } = hashPassword(input.password);

  const user = await writeDb((db) => {
    if (db.mobileUsers.some((item) => item.email.toLowerCase() === email)) {
      throw new ApiError('A user with this email already exists.', 409, { email: 'A user with this email already exists.' });
    }

    const nowIso = new Date().toISOString();
    let customer = db.customers.find((item) => item.email.toLowerCase() === email);
    if (!customer) {
      customer = {
        id: randomUUID(),
        name: name || email.split('@')[0],
        email,
        phone: '',
        country: input.country || 'Nepal',
        totalBookings: 0,
        totalSpent: 0,
        lastVisit: dateOnly(new Date()),
        createdAt: dateOnly(new Date()),
        tags: ['mobile'],
        notes: 'Created from RhinoConnect mobile app.',
      } satisfies Customer;
      db.customers.push(customer);
    }

    const mobileUser: MobileUser = {
      id: randomUUID(),
      name: customer.name,
      email,
      country: customer.country,
      customerId: customer.id,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    db.mobileUsers.push(mobileUser);
    return mobileUser;
  });

  return authPayload(user);
}

export async function loginMobileUser(rawInput: unknown) {
  const input = loginSchema.parse(rawInput);
  const email = input.email.toLowerCase();
  const db = await readDb();
  const user = db.mobileUsers.find((item) => item.email.toLowerCase() === email);
  if (!user || !verifyPassword(input.password, user)) {
    throw new ApiError('Invalid email or password.', 400, { non_field_errors: 'Invalid email or password.' });
  }
  return authPayload(user);
}

export async function getMobileUserFromRequest(request: Request) {
  const header = request.headers.get('authorization') ?? '';
  const token = header.replace(/^Token\s+/i, '').replace(/^Bearer\s+/i, '').trim();
  if (!token) throw new ApiError('Authentication credentials were not provided.', 401);

  const payload = verifyToken(token);
  const db = await readDb();
  const user = db.mobileUsers.find((item) => item.id === payload.sub);
  if (!user) throw new ApiError('User account no longer exists.', 401);
  return user;
}

export async function getMobileServices() {
  const db = await readDb();
  return {
    count: db.services.filter((service) => service.active).length,
    results: db.services.filter((service) => service.active).map((service) => serviceToApi(service, db.business.currency)),
  };
}

export async function getMobileBookings(user: MobileUser) {
  const db = await readDb();
  const bookings = db.bookings
    .filter((booking) => booking.customerId === user.customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return {
    count: bookings.length,
    results: bookings.map((booking) =>
      bookingToApi(
        booking,
        db.services.find((service) => service.id === booking.serviceId),
        db.business.currency
      )
    ),
  };
}

export async function createMobileBooking(user: MobileUser, rawInput: unknown) {
  const input = bookingSchema.parse(rawInput);
  const db = await readDb();
  const serviceId = input.service_id ?? input.serviceId;
  const service = db.services.find((item) => item.id === serviceId && item.active);
  if (!service) throw new ApiError('Service not found', 404);

  const result = await createBooking({
    customerName: user.name,
    customerEmail: user.email,
    customerPhone: '',
    country: user.country,
    serviceId: service.id,
    service: service.name,
    serviceType: service.type,
    checkIn: dateFromApi(input.start_at),
    checkOut: dateFromApi(input.end_at),
    guests: input.guests,
    paid: 0,
    paymentMethod: 'test',
    notes: input.notes,
    source: 'public-booking',
  });

  return bookingToApi(result.booking, service, db.business.currency);
}

export async function createMobilePaymentIntent(user: MobileUser, rawInput: unknown) {
  const input = paymentIntentSchema.parse(rawInput);
  const db = await readDb();
  const booking = db.bookings.find((item) => item.id === input.booking && item.customerId === user.customerId);
  if (!booking) throw new ApiError('Booking not found', 404);

  const payment = db.payments.find((item) => item.bookingId === booking.id);
  if (!payment) throw new ApiError('Payment record not found', 404);

  return {
    payment: paymentToApi(payment),
    client_secret: `${payment.id}_secret_mobile`,
    mode: input.gateway === 'test' || input.gateway === 'manual' ? 'test' : 'gateway',
  };
}

export async function markMobilePaymentSucceeded(user: MobileUser, paymentId: string) {
  return writeDb((db) => {
    const payment = db.payments.find((item) => item.id === paymentId);
    if (!payment) throw new ApiError('Payment not found', 404);

    const booking = db.bookings.find((item) => item.id === payment.bookingId);
    if (!booking || booking.customerId !== user.customerId) throw new ApiError('Payment not found', 404);

    const service = db.services.find((item) => item.id === booking.serviceId);
    const depositPercent = service?.depositPercent ?? 30;
    const depositAmount = Math.round(payment.amount * depositPercent) / 100;
    const nextPaid = Math.min(payment.amount, Math.max(payment.paid, depositAmount));

    payment.paid = nextPaid;
    payment.remaining = Math.max(0, payment.amount - nextPaid);
    payment.status = payment.remaining === 0 ? 'paid' : 'partial';
    booking.paymentStatus = payment.status;
    booking.updatedAt = new Date().toISOString();

    return paymentToApi(payment);
  });
}
