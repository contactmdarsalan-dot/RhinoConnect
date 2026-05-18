import { randomUUID } from 'node:crypto';
import type { z } from 'zod';
import type {
  AutomationLog,
  AvailabilityCell,
  Booking,
  BootstrapPayload,
  BusinessProfile,
  Customer,
  DashboardSnapshot,
  Notification,
  PaginatedResult,
  Payment,
  PaymentStatus,
  ServiceMedia,
  RevenueData,
  ServiceOffering,
} from '@/lib/types';
import { ApiError } from './http';
import { readDb, writeDb } from './storage';
import type { AppDatabase } from './seed';
import type {
  availabilityBlockCreateSchema,
  bookingCreateSchema,
  bookingUpdateSchema,
  businessUpdateSchema,
  customerCreateSchema,
  customerUpdateSchema,
  paymentUpdateSchema,
  serviceCreateSchema,
  serviceUpdateSchema,
} from './validation';

type CreateBookingInput = z.infer<typeof bookingCreateSchema>;
type UpdateBookingInput = z.infer<typeof bookingUpdateSchema>;
type CreateCustomerInput = z.infer<typeof customerCreateSchema>;
type UpdateCustomerInput = z.infer<typeof customerUpdateSchema>;
type UpdatePaymentInput = z.infer<typeof paymentUpdateSchema>;
type UpdateBusinessInput = z.infer<typeof businessUpdateSchema>;
type CreateAvailabilityBlockInput = z.infer<typeof availabilityBlockCreateSchema>;
type CreateServiceInput = z.infer<typeof serviceCreateSchema>;
type UpdateServiceInput = z.infer<typeof serviceUpdateSchema>;

const MONTH_LABEL = new Intl.DateTimeFormat('en-US', { month: 'short' });

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDate(value: string) {
  return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date: Date, months: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

function isDateInRange(value: string, start: Date, end: Date) {
  const date = parseDate(value);
  return date >= start && date < end;
}

function daysForBooking(startValue: string, endValue: string) {
  const start = parseDate(startValue);
  const rawEnd = parseDate(endValue);
  const end = rawEnd > start ? rawEnd : addDays(start, 1);
  const days: string[] = [];

  for (let day = start; day < end; day = addDays(day, 1)) {
    days.push(dateOnly(day));
  }

  return days;
}

function bookingOverlapsDate(booking: Booking, date: string) {
  const dayStart = parseDate(date);
  const dayEnd = addDays(dayStart, 1);
  const bookingStart = parseDate(booking.checkIn);
  const rawEnd = parseDate(booking.checkOut);
  const bookingEnd = rawEnd > bookingStart ? rawEnd : addDays(bookingStart, 1);
  return bookingStart < dayEnd && bookingEnd > dayStart;
}

function serviceMatchesBooking(service: ServiceOffering, booking: Booking) {
  return booking.serviceId === service.id || booking.service.toLowerCase() === service.name.toLowerCase();
}

function normalizeGallery(gallery: CreateServiceInput['gallery'] | UpdateServiceInput['gallery']): ServiceMedia[] {
  return (gallery ?? []).map((media) => ({
    id: media.id || randomUUID(),
    type: media.type,
    title: media.title,
    url: media.url,
    description: media.description,
    thumbnailUrl: media.thumbnailUrl,
  }));
}

function assertUniqueServiceName(db: AppDatabase, name: string, serviceId?: string) {
  const existing = db.services.find(
    (service) => service.id !== serviceId && service.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) throw new ApiError('A service with this name already exists', 409);
}

function bookingUnits(service: ServiceOffering, booking: Pick<Booking, 'guests'>) {
  return service.type === 'hotel' || service.type === 'homestay' || service.type === 'event'
    ? 1
    : booking.guests;
}

function capacityForDate(db: AppDatabase, service: ServiceOffering, date: string) {
  const block = db.availabilityBlocks.find((item) => {
    const start = parseDate(item.startDate);
    const end = parseDate(item.endDate);
    const current = parseDate(date);
    return item.serviceId === service.id && current >= start && current <= end;
  });

  if (!block) {
    return { capacity: service.capacity, blocked: false };
  }

  if (typeof block.capacityOverride === 'number') {
    return { capacity: block.capacityOverride, blocked: block.capacityOverride === 0 };
  }

  return { capacity: 0, blocked: true };
}

function bookedUnitsForDate(db: AppDatabase, service: ServiceOffering, date: string, ignoreBookingId?: string) {
  return db.bookings
    .filter((booking) => booking.id !== ignoreBookingId)
    .filter((booking) => booking.status !== 'cancelled')
    .filter((booking) => serviceMatchesBooking(service, booking))
    .filter((booking) => bookingOverlapsDate(booking, date))
    .reduce((sum, booking) => sum + bookingUnits(service, booking), 0);
}

function assertValidBookingDates(checkIn: string, checkOut: string) {
  if (parseDate(checkOut) < parseDate(checkIn)) {
    throw new ApiError('Check-out date cannot be before check-in date', 422);
  }
}

function assertAvailability(
  db: AppDatabase,
  service: ServiceOffering | undefined,
  input: Pick<Booking, 'checkIn' | 'checkOut' | 'guests'>,
  ignoreBookingId?: string
) {
  if (!service) return;

  const requestedUnits = bookingUnits(service, input);
  for (const date of daysForBooking(input.checkIn, input.checkOut)) {
    const { capacity } = capacityForDate(db, service, date);
    const booked = bookedUnitsForDate(db, service, date, ignoreBookingId);
    if (capacity - booked < requestedUnits) {
      throw new ApiError(`Not enough availability for ${service.name} on ${date}`, 409);
    }
  }
}

function nextBookingRef(bookings: Booking[]) {
  const max = bookings.reduce((largest, booking) => {
    const number = Number(booking.bookingRef.replace(/\D/g, ''));
    return Number.isFinite(number) ? Math.max(largest, number) : largest;
  }, 10233);
  return `RPC-${String(max + 1).padStart(5, '0')}`;
}

function invoiceNumber(bookingRef: string) {
  return `INV-${bookingRef.replace('RPC-', '')}`;
}

function paymentStatusFromPaid(amount: number, paid: number): PaymentStatus {
  if (paid <= 0) return 'unpaid';
  if (paid >= amount) return 'paid';
  return 'partial';
}

function sortByCreatedDesc<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function paginate<T>(items: T[], page: number, limit: number): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    page,
    limit,
    total,
    totalPages,
  };
}

function updateCustomerStats(db: AppDatabase, customerId: string) {
  const customer = db.customers.find((item) => item.id === customerId);
  if (!customer) return;

  const customerBookings = db.bookings.filter(
    (booking) => booking.customerId === customerId && booking.status !== 'cancelled'
  );
  customer.totalBookings = customerBookings.length;
  customer.totalSpent = customerBookings.reduce((sum, booking) => sum + booking.amount, 0);
  customer.lastVisit =
    customerBookings
      .map((booking) => booking.checkIn)
      .sort()
      .at(-1) ?? customer.lastVisit;
}

function automationForBooking(db: AppDatabase, booking: Booking): AutomationLog[] {
  const logs: AutomationLog[] = [];

  if (db.business.automation.emailEnabled) {
    logs.push({
      id: randomUUID(),
      bookingId: booking.id,
      channel: 'email',
      recipient: booking.customerEmail,
      subject: `Booking confirmation ${booking.bookingRef}`,
      status: 'queued',
      createdAt: new Date().toISOString(),
    });
  }

  if (db.business.automation.whatsappEnabled && booking.customerPhone) {
    logs.push({
      id: randomUUID(),
      bookingId: booking.id,
      channel: 'whatsapp',
      recipient: booking.customerPhone,
      subject: `WhatsApp reminder ${booking.bookingRef}`,
      status: 'queued',
      createdAt: new Date().toISOString(),
    });
  }

  return logs;
}

function createNotification(input: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
  return {
    id: randomUUID(),
    read: false,
    createdAt: new Date().toISOString(),
    ...input,
  };
}

function compactDb(db: AppDatabase) {
  return {
    business: db.business,
    services: [...db.services].sort((a, b) => a.name.localeCompare(b.name)),
    availabilityBlocks: sortByCreatedDesc(db.availabilityBlocks),
    customers: sortByCreatedDesc(db.customers),
    bookings: sortByCreatedDesc(db.bookings),
    payments: [...db.payments].sort((a, b) => b.date.localeCompare(a.date)),
    notifications: sortByCreatedDesc(db.notifications),
    automations: sortByCreatedDesc(db.automations),
    updatedAt: db.updatedAt,
  };
}

export function buildAvailability(db: AppDatabase, days = 14): AvailabilityCell[] {
  const start = parseDate(dateOnly(new Date()));
  const cells: AvailabilityCell[] = [];

  for (const service of db.services.filter((item) => item.active)) {
    for (let index = 0; index < days; index += 1) {
      const date = dateOnly(addDays(start, index));
      const capacity = capacityForDate(db, service, date);
      const booked = bookedUnitsForDate(db, service, date);
      cells.push({
        serviceId: service.id,
        serviceName: service.name,
        date,
        booked,
        capacity: capacity.capacity,
        available: Math.max(0, capacity.capacity - booked),
        blocked: capacity.blocked,
      });
    }
  }

  return cells;
}

export function buildDashboard(db: AppDatabase): DashboardSnapshot {
  const now = new Date();
  const currentMonth = startOfMonth(now);
  const nextMonth = addMonths(currentMonth, 1);
  const previousMonth = addMonths(currentMonth, -1);

  const activeBookings = db.bookings.filter((booking) => booking.status !== 'cancelled');
  const currentBookings = activeBookings.filter((booking) => isDateInRange(booking.createdAt, currentMonth, nextMonth));
  const previousBookings = activeBookings.filter((booking) => isDateInRange(booking.createdAt, previousMonth, currentMonth));
  const currentRevenue = currentBookings.reduce((sum, booking) => sum + booking.amount, 0);
  const previousRevenue = previousBookings.reduce((sum, booking) => sum + booking.amount, 0);
  const newCustomers = db.customers.filter((customer) => isDateInRange(customer.createdAt, currentMonth, nextMonth)).length;
  const previousCustomers = db.customers.filter((customer) => isDateInRange(customer.createdAt, previousMonth, currentMonth)).length;

  const availability = buildAvailability(db);
  const totalCapacity = availability.reduce((sum, cell) => sum + cell.capacity, 0);
  const totalBooked = availability.reduce((sum, cell) => sum + cell.booked, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

  const monthStarts = Array.from({ length: 7 }, (_, index) => addMonths(currentMonth, index - 6));
  const revenueData: RevenueData[] = monthStarts.map((monthStart) => {
    const monthEnd = addMonths(monthStart, 1);
    const monthBookings = activeBookings.filter((booking) => isDateInRange(booking.createdAt, monthStart, monthEnd));
    const monthCustomers = db.customers.filter((customer) => isDateInRange(customer.createdAt, monthStart, monthEnd));
    return {
      month: MONTH_LABEL.format(monthStart),
      revenue: monthBookings.reduce((sum, booking) => sum + booking.amount, 0),
      bookings: monthBookings.length,
      customers: monthCustomers.length,
    };
  });

  const serviceRevenue = Object.entries(
    activeBookings.reduce<Record<string, number>>((acc, booking) => {
      acc[booking.service] = (acc[booking.service] ?? 0) + booking.amount;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const countryBreakdown = Object.entries(
    db.customers.reduce<Record<string, number>>((acc, customer) => {
      acc[customer.country] = (acc[customer.country] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const percentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 1000) / 10;
  };

  return {
    stats: {
      totalRevenue: currentRevenue,
      revenueChange: percentChange(currentRevenue, previousRevenue),
      totalBookings: currentBookings.length,
      bookingsChange: percentChange(currentBookings.length, previousBookings.length),
      totalCustomers: db.customers.length,
      customersChange: percentChange(newCustomers, previousCustomers),
      occupancyRate,
      occupancyChange: 0,
    },
    revenueData,
    serviceRevenue,
    countryBreakdown,
  };
}

export async function getBootstrap(): Promise<BootstrapPayload> {
  const db = await readDb();
  return {
    ...compactDb(db),
    dashboard: buildDashboard(db),
    availability: buildAvailability(db),
  };
}

export async function getDashboard() {
  return buildDashboard(await readDb());
}

export async function listServices() {
  const db = await readDb();
  return compactDb(db).services;
}

export async function getService(id: string) {
  const db = await readDb();
  const service = db.services.find((item) => item.id === id);
  if (!service) throw new ApiError('Service not found', 404);
  return service;
}

export async function createService(input: CreateServiceInput) {
  return writeDb((db) => {
    assertUniqueServiceName(db, input.name);

    const nowIso = new Date().toISOString();
    const service: ServiceOffering = {
      id: randomUUID(),
      name: input.name,
      type: input.type,
      description: input.description,
      capacity: input.capacity,
      durationDays: input.durationDays,
      basePrice: input.basePrice,
      depositPercent: input.depositPercent,
      active: input.active ?? true,
      color: input.color ?? '#0f766e',
      gallery: normalizeGallery(input.gallery),
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    db.services.push(service);

    return {
      service,
      services: compactDb(db).services,
      dashboard: buildDashboard(db),
      availability: buildAvailability(db),
    };
  });
}

export async function updateService(id: string, input: UpdateServiceInput) {
  return writeDb((db) => {
    const service = db.services.find((item) => item.id === id);
    if (!service) throw new ApiError('Service not found', 404);

    if (input.name && input.name !== service.name) {
      assertUniqueServiceName(db, input.name, id);
      db.bookings
        .filter((booking) => booking.serviceId === id)
        .forEach((booking) => {
          booking.service = input.name as string;
        });
    }

    Object.assign(service, input, {
      gallery: input.gallery !== undefined ? normalizeGallery(input.gallery) : service.gallery,
      updatedAt: new Date().toISOString(),
    });

    return {
      service,
      services: compactDb(db).services,
      dashboard: buildDashboard(db),
      availability: buildAvailability(db),
    };
  });
}

export async function deleteService(id: string) {
  return writeDb((db) => {
    const service = db.services.find((item) => item.id === id);
    if (!service) throw new ApiError('Service not found', 404);

    const hasBookings = db.bookings.some((booking) => serviceMatchesBooking(service, booking));
    if (hasBookings) {
      service.active = false;
      service.updatedAt = new Date().toISOString();
      return {
        service,
        services: compactDb(db).services,
        dashboard: buildDashboard(db),
        availability: buildAvailability(db),
        deactivated: true,
      };
    }

    db.services = db.services.filter((item) => item.id !== id);
    db.availabilityBlocks = db.availabilityBlocks.filter((block) => block.serviceId !== id);

    return {
      service,
      services: compactDb(db).services,
      dashboard: buildDashboard(db),
      availability: buildAvailability(db),
      deactivated: false,
    };
  });
}

export async function listBookings(options: {
  page: number;
  limit: number;
  search?: string | null;
  status?: string | null;
  paymentStatus?: string | null;
}) {
  const db = await readDb();
  const search = options.search?.trim().toLowerCase();
  const bookings = sortByCreatedDesc(db.bookings).filter((booking) => {
    const matchesSearch =
      !search ||
      booking.bookingRef.toLowerCase().includes(search) ||
      booking.customerName.toLowerCase().includes(search) ||
      booking.customerEmail.toLowerCase().includes(search) ||
      booking.service.toLowerCase().includes(search);
    const matchesStatus = !options.status || options.status === 'all' || booking.status === options.status;
    const matchesPayment =
      !options.paymentStatus || options.paymentStatus === 'all' || booking.paymentStatus === options.paymentStatus;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  return paginate(bookings, options.page, options.limit);
}

export async function getBooking(id: string) {
  const db = await readDb();
  const booking = db.bookings.find((item) => item.id === id);
  if (!booking) throw new ApiError('Booking not found', 404);
  return booking;
}

export async function createBooking(input: CreateBookingInput) {
  return writeDb((db) => {
    assertValidBookingDates(input.checkIn, input.checkOut);

    const service =
      db.services.find((item) => item.id === input.serviceId) ??
      db.services.find((item) => item.name.toLowerCase() === input.service.toLowerCase());
    assertAvailability(db, service, input);

    const nowIso = new Date().toISOString();
    let customer = db.customers.find((item) => item.email.toLowerCase() === input.customerEmail.toLowerCase());

    if (!customer) {
      customer = {
        id: randomUUID(),
        name: input.customerName,
        email: input.customerEmail,
        phone: input.customerPhone,
        country: input.country,
        totalBookings: 0,
        totalSpent: 0,
        lastVisit: input.checkIn,
        createdAt: dateOnly(new Date()),
        tags: [],
        notes: '',
      };
      db.customers.push(customer);
    } else {
      customer.name = input.customerName || customer.name;
      customer.phone = input.customerPhone || customer.phone;
      customer.country = input.country || customer.country;
    }

    const amount =
      typeof input.amount === 'number' && input.amount > 0
        ? input.amount
        : (service?.basePrice ?? 0) *
          input.guests *
          (service?.type === 'hotel' || service?.type === 'homestay'
            ? Math.max(1, daysForBooking(input.checkIn, input.checkOut).length)
            : 1);
    const paid = Math.min(input.paid ?? 0, amount);
    const paymentStatus = paymentStatusFromPaid(amount, paid);
    const booking: Booking = {
      id: randomUUID(),
      bookingRef: nextBookingRef(db.bookings),
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      service: service?.name ?? input.service,
      serviceId: service?.id ?? input.serviceId,
      serviceType: service?.type ?? input.serviceType ?? 'hotel',
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: input.guests,
      amount,
      status: input.source === 'public-booking' ? 'pending' : 'pending',
      paymentStatus,
      paymentMethod: input.paymentMethod,
      notes: input.notes,
      source: input.source,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    const payment: Payment = {
      id: randomUUID(),
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      customerName: booking.customerName,
      amount,
      paid,
      remaining: Math.max(0, amount - paid),
      status: paymentStatus,
      method: input.paymentMethod,
      invoiceNumber: invoiceNumber(booking.bookingRef),
      date: dateOnly(new Date()),
      dueDate: input.checkIn,
    };
    const notification = createNotification({
      type: 'booking',
      title: 'New booking received',
      message: `${booking.customerName} booked ${booking.service}.`,
    });
    const automations = automationForBooking(db, booking);

    db.bookings.push(booking);
    db.payments.push(payment);
    db.notifications.push(notification);
    db.automations.push(...automations);
    updateCustomerStats(db, customer.id);

    return { booking, customer, payment, notification, automations, dashboard: buildDashboard(db) };
  });
}

export async function updateBooking(id: string, input: UpdateBookingInput) {
  return writeDb((db) => {
    const booking = db.bookings.find((item) => item.id === id);
    if (!booking) throw new ApiError('Booking not found', 404);

    const nextBooking = { ...booking, ...input };
    assertValidBookingDates(nextBooking.checkIn, nextBooking.checkOut);
    const service = db.services.find((item) => serviceMatchesBooking(item, nextBooking));
    assertAvailability(db, service, nextBooking, booking.id);

    Object.assign(booking, input, { updatedAt: new Date().toISOString() });

    const payment = db.payments.find((item) => item.bookingId === booking.id);
    if (payment) {
      payment.amount = booking.amount;
      payment.remaining = Math.max(0, booking.amount - payment.paid);
      payment.status = booking.paymentStatus;
      payment.method = booking.paymentMethod ?? payment.method;
    }
    updateCustomerStats(db, booking.customerId);

    return { booking, payment, dashboard: buildDashboard(db) };
  });
}

export async function deleteBooking(id: string) {
  return writeDb((db) => {
    const booking = db.bookings.find((item) => item.id === id);
    if (!booking) throw new ApiError('Booking not found', 404);
    db.bookings = db.bookings.filter((item) => item.id !== id);
    db.payments = db.payments.filter((item) => item.bookingId !== id);
    updateCustomerStats(db, booking.customerId);
    return { booking, dashboard: buildDashboard(db) };
  });
}

export async function listCustomers(options: { page: number; limit: number; search?: string | null }) {
  const db = await readDb();
  const search = options.search?.trim().toLowerCase();
  const customers = sortByCreatedDesc(db.customers).filter((customer) => {
    if (!search) return true;
    return (
      customer.name.toLowerCase().includes(search) ||
      customer.email.toLowerCase().includes(search) ||
      customer.country.toLowerCase().includes(search) ||
      customer.phone.toLowerCase().includes(search)
    );
  });
  return paginate(customers, options.page, options.limit);
}

export async function createCustomer(input: CreateCustomerInput) {
  return writeDb((db) => {
    const existing = db.customers.find((item) => item.email.toLowerCase() === input.email.toLowerCase());
    if (existing) throw new ApiError('A customer with this email already exists', 409);

    const customer: Customer = {
      id: randomUUID(),
      ...input,
      totalBookings: 0,
      totalSpent: 0,
      lastVisit: dateOnly(new Date()),
      createdAt: dateOnly(new Date()),
    };
    db.customers.push(customer);

    return { customer, dashboard: buildDashboard(db) };
  });
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  return writeDb((db) => {
    const customer = db.customers.find((item) => item.id === id);
    if (!customer) throw new ApiError('Customer not found', 404);
    Object.assign(customer, input);

    db.bookings
      .filter((booking) => booking.customerId === id)
      .forEach((booking) => {
        booking.customerName = customer.name;
        booking.customerEmail = customer.email;
        booking.customerPhone = customer.phone;
      });

    db.payments
      .filter((payment) => db.bookings.some((booking) => booking.id === payment.bookingId && booking.customerId === id))
      .forEach((payment) => {
        payment.customerName = customer.name;
      });

    return { customer, dashboard: buildDashboard(db) };
  });
}

export async function listPayments(options: { page: number; limit: number; status?: string | null }) {
  const db = await readDb();
  const payments = [...db.payments]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((payment) => !options.status || options.status === 'all' || payment.status === options.status);
  return paginate(payments, options.page, options.limit);
}

export async function updatePayment(id: string, input: UpdatePaymentInput) {
  return writeDb((db) => {
    const payment = db.payments.find((item) => item.id === id);
    if (!payment) throw new ApiError('Payment not found', 404);
    const previousStatus = payment.status;

    if (typeof input.paid === 'number') {
      payment.paid = Math.min(input.paid, payment.amount);
      payment.remaining = Math.max(0, payment.amount - payment.paid);
      payment.status = paymentStatusFromPaid(payment.amount, payment.paid);
    }
    if (input.method !== undefined) payment.method = input.method;
    if (input.date !== undefined) payment.date = input.date;
    if (input.dueDate !== undefined) payment.dueDate = input.dueDate;
    if (input.status !== undefined) {
      payment.status = input.status;
      if (input.status === 'paid') {
        payment.paid = payment.amount;
        payment.remaining = 0;
      }
      if (input.status === 'refunded') {
        payment.remaining = 0;
      }
    }

    const booking = db.bookings.find((item) => item.id === payment.bookingId);
    if (booking) {
      booking.paymentStatus = payment.status;
      booking.paymentMethod = payment.method;
      booking.updatedAt = new Date().toISOString();
    }

    const notification =
      previousStatus !== 'paid' && payment.status === 'paid'
        ? createNotification({
            type: 'payment',
            title: 'Payment received',
            message: `${payment.customerName} paid ${payment.bookingRef}.`,
          })
        : undefined;
    if (notification) db.notifications.push(notification);

    return { payment, booking, notification, dashboard: buildDashboard(db) };
  });
}

export async function markNotification(id: string, read = true) {
  return writeDb((db) => {
    const notification = db.notifications.find((item) => item.id === id);
    if (!notification) throw new ApiError('Notification not found', 404);
    notification.read = read;
    return { notification };
  });
}

export async function markAllNotificationsRead() {
  return writeDb((db) => {
    db.notifications.forEach((notification) => {
      notification.read = true;
    });
    return { notifications: db.notifications };
  });
}

export async function updateBusiness(input: UpdateBusinessInput) {
  return writeDb((db) => {
    db.business = {
      ...db.business,
      ...input,
      automation: {
        ...db.business.automation,
        ...input.automation,
      },
      branding: {
        ...db.business.branding,
        ...input.branding,
      },
      updatedAt: new Date().toISOString(),
    } satisfies BusinessProfile;

    return { business: db.business };
  });
}

export async function createAvailabilityBlock(input: CreateAvailabilityBlockInput) {
  return writeDb((db) => {
    if (!db.services.some((service) => service.id === input.serviceId)) {
      throw new ApiError('Service not found', 404);
    }
    if (parseDate(input.endDate) < parseDate(input.startDate)) {
      throw new ApiError('End date cannot be before start date', 422);
    }

    const block = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    };
    db.availabilityBlocks.push(block);
    return { availabilityBlock: block, availability: buildAvailability(db) };
  });
}

export async function deleteAvailabilityBlock(id: string) {
  return writeDb((db) => {
    const block = db.availabilityBlocks.find((item) => item.id === id);
    if (!block) throw new ApiError('Availability block not found', 404);
    db.availabilityBlocks = db.availabilityBlocks.filter((item) => item.id !== id);
    return { availabilityBlock: block, availability: buildAvailability(db) };
  });
}

export async function getPublicBusiness(slug: string) {
  const db = await readDb();
  if (db.business.slug !== slug) throw new ApiError('Business not found', 404);

  return {
    business: {
      slug: db.business.slug,
      name: db.business.name,
      type: db.business.type,
      phone: db.business.phone,
      website: db.business.website,
      address: db.business.address,
      description: db.business.description,
      currency: db.business.currency,
      branding: db.business.branding,
    },
    services: db.services.filter((service) => service.active),
  };
}
