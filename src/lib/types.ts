// ============================================================
// RhinoPeak Connect — Core Type Definitions
// ============================================================

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';
export type BusinessType = 'hotel' | 'homestay' | 'trekking' | 'travel' | 'cafe' | 'wellness' | 'event';
export type UserRole = 'admin' | 'staff' | 'viewer';
export type SubscriptionPlan = 'free' | 'pro';
export type AutomationChannel = 'email' | 'whatsapp';
export type DeliveryStatus = 'queued' | 'sent' | 'failed';
export type ServiceMediaType = 'image' | 'video';

export interface BusinessProfile {
  id: string;
  slug: string;
  name: string;
  type: BusinessType;
  plan: SubscriptionPlan;
  email: string;
  phone: string;
  website: string;
  address: string;
  description: string;
  currency: 'NPR' | 'USD';
  timezone: string;
  branding: {
    primaryColor: string;
    logoText: string;
    showRhinoPeakBranding: boolean;
  };
  automation: {
    emailEnabled: boolean;
    whatsappEnabled: boolean;
    remindersEnabled: boolean;
  };
  limits: {
    monthlyBookings: number | null;
    staffUsers: number;
  };
  updatedAt: string;
}

export interface ServiceMedia {
  id: string;
  type: ServiceMediaType;
  title: string;
  url: string;
  description?: string;
  thumbnailUrl?: string;
}

export interface ServiceOffering {
  id: string;
  name: string;
  type: BusinessType;
  description: string;
  capacity: number;
  durationDays: number;
  basePrice: number;
  depositPercent: number;
  active: boolean;
  color: string;
  gallery: ServiceMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityBlock {
  id: string;
  serviceId: string;
  startDate: string;
  endDate: string;
  reason: string;
  capacityOverride?: number;
  createdAt: string;
}

export interface AutomationLog {
  id: string;
  bookingId?: string;
  channel: AutomationChannel;
  recipient: string;
  subject: string;
  status: DeliveryStatus;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  avatar?: string;
  totalBookings: number;
  totalSpent: number;
  lastVisit: string;
  createdAt: string;
  tags: string[];
  notes?: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  service: string;
  serviceId?: string;
  serviceType: BusinessType;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  notes?: string;
  source?: 'dashboard' | 'public-booking';
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  bookingRef: string;
  customerName: string;
  amount: number;
  paid: number;
  remaining: number;
  status: PaymentStatus;
  method: string;
  invoiceNumber?: string;
  date: string;
  dueDate: string;
}

export interface StatsCard {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
  color: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
  customers: number;
}

export interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'customer' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessName: string;
  businessType: BusinessType;
  avatar?: string;
  plan: SubscriptionPlan;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalBookings: number;
  bookingsChange: number;
  totalCustomers: number;
  customersChange: number;
  occupancyRate: number;
  occupancyChange: number;
}

export interface DashboardSnapshot {
  stats: DashboardStats;
  revenueData: RevenueData[];
  serviceRevenue: { name: string; value: number }[];
  countryBreakdown: { name: string; value: number }[];
}

export interface AvailabilityCell {
  serviceId: string;
  serviceName: string;
  date: string;
  booked: number;
  capacity: number;
  available: number;
  blocked: boolean;
}

export interface BootstrapPayload {
  business: BusinessProfile;
  services: ServiceOffering[];
  availabilityBlocks: AvailabilityBlock[];
  customers: Customer[];
  bookings: Booking[];
  payments: Payment[];
  notifications: Notification[];
  automations: AutomationLog[];
  dashboard: DashboardSnapshot;
  availability: AvailabilityCell[];
  updatedAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
