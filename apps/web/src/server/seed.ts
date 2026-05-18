import type {
  AutomationLog,
  AvailabilityBlock,
  BootstrapPayload,
  BusinessProfile,
  MobileUser,
  ServiceOffering,
} from '@/lib/types';
import {
  bookings,
  currentUser,
  customers,
  notifications,
  payments,
} from '@/lib/mock-data';

export type AppDatabase = Omit<BootstrapPayload, 'dashboard' | 'availability'> & {
  version: number;
  mobileUsers: MobileUser[];
};

const now = new Date().toISOString();

export const seedBusiness: BusinessProfile = {
  id: 'biz_himalaya_haven',
  slug: 'himalaya-haven',
  name: currentUser.businessName,
  type: currentUser.businessType,
  plan: currentUser.plan,
  email: currentUser.email,
  phone: '+977 9801234567',
  website: 'www.himalayahaven.com',
  address: 'Thamel, Kathmandu, Nepal',
  description:
    'A premium lodge and travel operator offering hospitality, trekking packages, wellness retreats, and airport transfers in Nepal.',
  currency: 'NPR',
  timezone: 'Asia/Kathmandu',
  branding: {
    primaryColor: '#3b82f6',
    logoText: 'Himalaya Haven',
    showRhinoPeakBranding: false,
  },
  automation: {
    emailEnabled: true,
    whatsappEnabled: false,
    remindersEnabled: true,
  },
  limits: {
    monthlyBookings: null,
    staffUsers: 5,
  },
  updatedAt: now,
};

export const seedServices: ServiceOffering[] = [
  {
    id: 'svc_deluxe_room',
    name: 'Deluxe Mountain View Room',
    type: 'hotel',
    description: 'Private room with mountain view, breakfast, and airport pickup support.',
    capacity: 12,
    durationDays: 1,
    basePrice: 6500,
    depositPercent: 30,
    active: true,
    color: '#3b82f6',
    gallery: [
      {
        id: 'media_deluxe_room_1',
        type: 'image',
        title: 'Mountain view room',
        url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
        description: 'A quiet room base for travelers arriving in Kathmandu before heading into the hills.',
      },
      {
        id: 'media_deluxe_room_2',
        type: 'image',
        title: 'Morning valley light',
        url: 'https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=1200&q=80',
        description: 'Showcase the atmosphere guests can expect around the lodge.',
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'svc_family_suite',
    name: 'Family Suite',
    type: 'hotel',
    description: 'Large family room with two beds, private bathroom, and city transfer option.',
    capacity: 6,
    durationDays: 1,
    basePrice: 11000,
    depositPercent: 30,
    active: true,
    color: '#10b981',
    gallery: [
      {
        id: 'media_family_suite_1',
        type: 'image',
        title: 'Family stay setup',
        url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        description: 'Comfortable private stay for families and small groups.',
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'svc_abc_trek',
    name: 'Annapurna Base Camp Trek (7D)',
    type: 'trekking',
    description: 'Guided seven day Annapurna trek with itinerary planning and porter option.',
    capacity: 16,
    durationDays: 7,
    basePrice: 45000,
    depositPercent: 40,
    active: true,
    color: '#f59e0b',
    gallery: [
      {
        id: 'media_abc_trek_1',
        type: 'image',
        title: 'Annapurna trail',
        url: 'https://images.unsplash.com/photo-1605649461784-ddd8a0fd7a3b?auto=format&fit=crop&w=1200&q=80',
        description: 'Trail view for guests comparing trekking routes.',
      },
      {
        id: 'media_abc_trek_video',
        type: 'video',
        title: 'Route preview',
        url: 'https://www.youtube.com/embed/ysz5S6PUM-U',
        description: 'Short trip preview video for customer research.',
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'svc_ebc_trek',
    name: 'Everest Base Camp Trek (14D)',
    type: 'trekking',
    description: 'Fourteen day Everest Base Camp package with guide coordination.',
    capacity: 10,
    durationDays: 14,
    basePrice: 98000,
    depositPercent: 40,
    active: true,
    color: '#a855f7',
    gallery: [
      {
        id: 'media_ebc_trek_1',
        type: 'image',
        title: 'Everest approach',
        url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80',
        description: 'A high-altitude visual for expedition-style bookings.',
      },
      {
        id: 'media_ebc_trek_video',
        type: 'video',
        title: 'Trek briefing',
        url: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
        description: 'Video slot for guide briefings, route explainers, or customer testimonials.',
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'svc_wellness_retreat',
    name: 'Yoga & Wellness Retreat (3D)',
    type: 'wellness',
    description: 'Three day retreat package with yoga, meals, and wellness activities.',
    capacity: 18,
    durationDays: 3,
    basePrice: 12000,
    depositPercent: 25,
    active: true,
    color: '#f43f5e',
    gallery: [
      {
        id: 'media_wellness_retreat_1',
        type: 'image',
        title: 'Retreat practice space',
        url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
        description: 'A calm wellness visual for guests choosing retreat packages.',
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'svc_sunrise_tour',
    name: 'Sunrise Photography Tour',
    type: 'travel',
    description: 'Early morning guided photography tour for international travelers.',
    capacity: 8,
    durationDays: 1,
    basePrice: 8000,
    depositPercent: 50,
    active: true,
    color: '#6366f1',
    gallery: [
      {
        id: 'media_sunrise_tour_1',
        type: 'image',
        title: 'Sunrise viewpoint',
        url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
        description: 'Show the kind of early morning view customers are booking.',
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
];

export const seedAvailabilityBlocks: AvailabilityBlock[] = [
  {
    id: 'blk_monsoon_maintenance',
    serviceId: 'svc_deluxe_room',
    startDate: '2026-06-12',
    endDate: '2026-06-14',
    reason: 'Room maintenance',
    capacityOverride: 8,
    createdAt: now,
  },
];

export const seedAutomations: AutomationLog[] = [
  {
    id: 'auto_seed_email_1',
    bookingId: 'b1',
    channel: 'email',
    recipient: 'emma@gmail.com',
    subject: 'Booking confirmation RPC-10234',
    status: 'sent',
    createdAt: '2026-05-10T10:30:00.000Z',
  },
  {
    id: 'auto_seed_email_2',
    bookingId: 'b6',
    channel: 'email',
    recipient: 'h.tanaka@jpmail.jp',
    subject: 'Pending payment reminder RPC-10239',
    status: 'queued',
    createdAt: '2026-05-17T09:15:00.000Z',
  },
];

export function createSeedDatabase(): AppDatabase {
  return {
    version: 1,
    business: seedBusiness,
    services: seedServices,
    availabilityBlocks: seedAvailabilityBlocks,
    customers,
    bookings,
    payments,
    notifications,
    automations: seedAutomations,
    mobileUsers: [],
    updatedAt: now,
  };
}
