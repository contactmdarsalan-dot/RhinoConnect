import { z } from 'zod';

const businessTypes = ['hotel', 'homestay', 'trekking', 'travel', 'cafe', 'wellness', 'event'] as const;
const bookingStatuses = ['pending', 'confirmed', 'cancelled', 'completed'] as const;
const paymentStatuses = ['unpaid', 'partial', 'paid', 'refunded'] as const;
const serviceMediaTypes = ['image', 'video'] as const;

const optionalTrimmed = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

export const bookingCreateSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().trim().email().max(180),
  customerPhone: z.string().trim().max(40).optional().default(''),
  country: z.string().trim().max(80).optional().default('Unknown'),
  serviceId: optionalTrimmed,
  service: z.string().trim().min(2).max(160),
  serviceType: z.enum(businessTypes).optional(),
  checkIn: z.string().trim().min(1),
  checkOut: z.string().trim().min(1),
  guests: z.coerce.number().int().min(1).max(200),
  amount: z.coerce.number().min(0).optional(),
  paid: z.coerce.number().min(0).optional().default(0),
  paymentMethod: z.string().trim().max(60).optional().default(''),
  notes: z.string().trim().max(1000).optional().default(''),
  source: z.enum(['dashboard', 'public-booking']).optional().default('dashboard'),
});

export const bookingUpdateSchema = z.object({
  status: z.enum(bookingStatuses).optional(),
  paymentStatus: z.enum(paymentStatuses).optional(),
  paymentMethod: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(1000).optional(),
  checkIn: z.string().trim().min(1).optional(),
  checkOut: z.string().trim().min(1).optional(),
  guests: z.coerce.number().int().min(1).max(200).optional(),
  amount: z.coerce.number().min(0).optional(),
});

export const customerCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().max(40),
  country: z.string().trim().min(2).max(80),
  tags: z.array(z.string().trim().min(1).max(30)).optional().default([]),
  notes: z.string().trim().max(1000).optional().default(''),
});

export const customerUpdateSchema = customerCreateSchema.partial();

const serviceMediaSchema = z.object({
  id: z.string().trim().optional(),
  type: z.enum(serviceMediaTypes),
  title: z.string().trim().min(2).max(120),
  url: z.string().trim().url().max(600),
  description: z.string().trim().max(240).optional().default(''),
  thumbnailUrl: z
    .union([z.string().trim().url().max(600), z.literal('')])
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export const serviceCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  type: z.enum(businessTypes),
  description: z.string().trim().min(10).max(700),
  capacity: z.coerce.number().int().min(1).max(10000),
  durationDays: z.coerce.number().int().min(1).max(365),
  basePrice: z.coerce.number().min(0).max(100000000),
  depositPercent: z.coerce.number().int().min(0).max(100),
  active: z.boolean().optional().default(true),
  color: z.string().trim().min(4).max(20).optional().default('#0f766e'),
  gallery: z.array(serviceMediaSchema).max(24).optional().default([]),
});

export const serviceUpdateSchema = serviceCreateSchema.partial();

export const paymentUpdateSchema = z.object({
  paid: z.coerce.number().min(0).optional(),
  method: z.string().trim().max(60).optional(),
  status: z.enum(paymentStatuses).optional(),
  date: z.string().trim().min(1).optional(),
  dueDate: z.string().trim().min(1).optional(),
});

export const businessUpdateSchema = z.object({
  name: z.string().trim().min(2).max(140).optional(),
  email: z.string().trim().email().max(180).optional(),
  phone: z.string().trim().max(40).optional(),
  website: z.string().trim().max(140).optional(),
  address: z.string().trim().max(240).optional(),
  description: z.string().trim().max(1000).optional(),
  automation: z
    .object({
      emailEnabled: z.boolean().optional(),
      whatsappEnabled: z.boolean().optional(),
      remindersEnabled: z.boolean().optional(),
    })
    .optional(),
  branding: z
    .object({
      primaryColor: z.string().trim().max(20).optional(),
      logoText: z.string().trim().max(80).optional(),
      showRhinoPeakBranding: z.boolean().optional(),
    })
    .optional(),
});

export const availabilityBlockCreateSchema = z.object({
  serviceId: z.string().trim().min(1),
  startDate: z.string().trim().min(1),
  endDate: z.string().trim().min(1),
  reason: z.string().trim().min(2).max(160),
  capacityOverride: z.coerce.number().int().min(0).optional(),
});
