import { create } from 'zustand';
import type {
  AutomationLog,
  AvailabilityBlock,
  AvailabilityCell,
  Booking,
  BootstrapPayload,
  BusinessProfile,
  Customer,
  DashboardSnapshot,
  Notification,
  Payment,
  ServiceMedia,
  ServiceOffering,
} from './types';
import {
  bookings as initialBookings,
  customers as initialCustomers,
  dashboardStats,
  notifications as initialNotifications,
  payments as initialPayments,
  revenueData,
} from './mock-data';

type ApiEnvelope<T> = { data: T } | { error: { message: string; details?: unknown } };

type BookingDraft = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  country?: string;
  serviceId?: string;
  service: string;
  serviceType?: Booking['serviceType'];
  checkIn: string;
  checkOut: string;
  guests: number | string;
  amount?: number | string;
  paid?: number | string;
  paymentMethod?: string;
  notes?: string;
  source?: Booking['source'];
};

type CustomerDraft = Pick<Customer, 'name' | 'email' | 'phone' | 'country'> &
  Partial<Pick<Customer, 'tags' | 'notes'>>;

type PaymentPatch = Partial<Omit<Pick<Payment, 'paid' | 'method' | 'status' | 'date' | 'dueDate'>, 'paid'>> & {
  paid?: number | string;
};

type ServiceDraft = Pick<
  ServiceOffering,
  'name' | 'type' | 'description' | 'capacity' | 'durationDays' | 'basePrice' | 'depositPercent' | 'active' | 'color'
> & {
  gallery: Array<Omit<ServiceMedia, 'id'> & { id?: string }>;
};

type ServicePatch = Partial<ServiceDraft>;

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || 'error' in payload) {
    throw new Error('error' in payload ? payload.error.message : 'Request failed');
  }

  return payload.data;
}

interface AppState {
  business?: BusinessProfile;
  services: ServiceOffering[];
  availabilityBlocks: AvailabilityBlock[];
  availability: AvailabilityCell[];
  bookings: Booking[];
  customers: Customer[];
  payments: Payment[];
  notifications: Notification[];
  automations: AutomationLog[];
  dashboard: DashboardSnapshot;

  sidebarOpen: boolean;
  activePage: string;
  loading: boolean;
  saving: boolean;
  hasHydrated: boolean;
  lastSyncedAt?: string;
  error?: string;

  setSidebarOpen: (open: boolean) => void;
  setActivePage: (page: string) => void;
  loadAppData: (force?: boolean) => Promise<void>;

  addBooking: (booking: BookingDraft) => Promise<Booking>;
  updateBooking: (id: string, data: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;

  addCustomer: (customer: CustomerDraft) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;

  addService: (service: ServiceDraft) => Promise<ServiceOffering>;
  updateService: (id: string, data: ServicePatch) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  updatePayment: (id: string, data: PaymentPatch) => Promise<void>;
  updateBusiness: (data: Partial<BusinessProfile>) => Promise<void>;

  addAvailabilityBlock: (block: Omit<AvailabilityBlock, 'id' | 'createdAt'>) => Promise<void>;
  deleteAvailabilityBlock: (id: string) => Promise<void>;

  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  unreadCount: () => number;
}

function applyBootstrap(payload: BootstrapPayload) {
  return {
    business: payload.business,
    services: payload.services,
    availabilityBlocks: payload.availabilityBlocks,
    availability: payload.availability,
    bookings: payload.bookings,
    customers: payload.customers,
    payments: payload.payments,
    notifications: payload.notifications,
    automations: payload.automations,
    dashboard: payload.dashboard,
    lastSyncedAt: payload.updatedAt,
    hasHydrated: true,
    error: undefined,
  };
}

export const useStore = create<AppState>((set, get) => ({
  business: undefined,
  services: [],
  availabilityBlocks: [],
  availability: [],
  bookings: initialBookings,
  customers: initialCustomers,
  payments: initialPayments,
  notifications: initialNotifications,
  automations: [],
  dashboard: {
    stats: dashboardStats,
    revenueData,
    serviceRevenue: [],
    countryBreakdown: [],
  },
  sidebarOpen: true,
  activePage: 'dashboard',
  loading: false,
  saving: false,
  hasHydrated: false,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActivePage: (page) => set({ activePage: page }),

  loadAppData: async (force = false) => {
    if (get().hasHydrated && !force) return;
    set({ loading: true, error: undefined });
    try {
      const payload = await apiFetch<BootstrapPayload>('/api/bootstrap');
      set({ ...applyBootstrap(payload), loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Could not load data' });
      throw error;
    }
  },

  addBooking: async (booking) => {
    set({ saving: true, error: undefined });
    try {
      const result = await apiFetch<{
        booking: Booking;
        customer: Customer;
        payment: Payment;
        notification: Notification;
        automations: AutomationLog[];
        dashboard: DashboardSnapshot;
      }>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(booking),
      });
      set((state) => ({
        bookings: [result.booking, ...state.bookings],
        customers: [result.customer, ...state.customers.filter((customer) => customer.id !== result.customer.id)],
        payments: [result.payment, ...state.payments],
        notifications: [result.notification, ...state.notifications],
        automations: [...result.automations, ...state.automations],
        dashboard: result.dashboard,
        saving: false,
      }));
      await get().loadAppData(true);
      return result.booking;
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Could not create booking' });
      throw error;
    }
  },

  updateBooking: async (id, data) => {
    set({ saving: true, error: undefined });
    try {
      const result = await apiFetch<{ booking: Booking; payment?: Payment; dashboard: DashboardSnapshot }>(
        `/api/bookings/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
        }
      );
      set((state) => ({
        bookings: state.bookings.map((booking) => (booking.id === id ? result.booking : booking)),
        payments: result.payment
          ? state.payments.map((payment) => (payment.id === result.payment?.id ? result.payment : payment))
          : state.payments,
        dashboard: result.dashboard,
        saving: false,
      }));
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Could not update booking' });
      throw error;
    }
  },

  deleteBooking: async (id) => {
    set({ saving: true, error: undefined });
    try {
      const result = await apiFetch<{ booking: Booking; dashboard: DashboardSnapshot }>(`/api/bookings/${id}`, {
        method: 'DELETE',
      });
      set((state) => ({
        bookings: state.bookings.filter((booking) => booking.id !== id),
        payments: state.payments.filter((payment) => payment.bookingId !== id),
        customers: state.customers.map((customer) =>
          customer.id === result.booking.customerId
            ? {
                ...customer,
                totalBookings: Math.max(0, customer.totalBookings - 1),
                totalSpent: Math.max(0, customer.totalSpent - result.booking.amount),
              }
            : customer
        ),
        dashboard: result.dashboard,
        saving: false,
      }));
      await get().loadAppData(true);
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Could not delete booking' });
      throw error;
    }
  },

  addCustomer: async (customer) => {
    set({ saving: true, error: undefined });
    try {
      const result = await apiFetch<{ customer: Customer; dashboard: DashboardSnapshot }>('/api/customers', {
        method: 'POST',
        body: JSON.stringify(customer),
      });
      set((state) => ({
        customers: [result.customer, ...state.customers],
        dashboard: result.dashboard,
        saving: false,
      }));
      return result.customer;
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Could not create customer' });
      throw error;
    }
  },

  updateCustomer: async (id, data) => {
    set({ saving: true, error: undefined });
    try {
      const result = await apiFetch<{ customer: Customer; dashboard: DashboardSnapshot }>(`/api/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((state) => ({
        customers: state.customers.map((customer) => (customer.id === id ? result.customer : customer)),
        dashboard: result.dashboard,
        saving: false,
      }));
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Could not update customer' });
      throw error;
    }
  },

  addService: async (service) => {
    set({ saving: true, error: undefined });
    try {
      const result = await apiFetch<{
        service: ServiceOffering;
        services: ServiceOffering[];
        dashboard: DashboardSnapshot;
        availability: AvailabilityCell[];
      }>('/api/services', {
        method: 'POST',
        body: JSON.stringify(service),
      });
      set({
        services: result.services,
        dashboard: result.dashboard,
        availability: result.availability,
        saving: false,
      });
      return result.service;
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Could not create service' });
      throw error;
    }
  },

  updateService: async (id, data) => {
    set({ saving: true, error: undefined });
    try {
      const result = await apiFetch<{
        service: ServiceOffering;
        services: ServiceOffering[];
        dashboard: DashboardSnapshot;
        availability: AvailabilityCell[];
      }>(`/api/services/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set({
        services: result.services,
        dashboard: result.dashboard,
        availability: result.availability,
        saving: false,
      });
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Could not update service' });
      throw error;
    }
  },

  deleteService: async (id) => {
    set({ saving: true, error: undefined });
    try {
      const result = await apiFetch<{
        service: ServiceOffering;
        services: ServiceOffering[];
        dashboard: DashboardSnapshot;
        availability: AvailabilityCell[];
        deactivated: boolean;
      }>(`/api/services/${id}`, {
        method: 'DELETE',
      });
      set({
        services: result.services,
        dashboard: result.dashboard,
        availability: result.availability,
        saving: false,
      });
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Could not delete service' });
      throw error;
    }
  },

  updatePayment: async (id, data) => {
    set({ saving: true, error: undefined });
    try {
      const result = await apiFetch<{
        payment: Payment;
        booking?: Booking;
        notification?: Notification;
        dashboard: DashboardSnapshot;
      }>(`/api/payments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((state) => ({
        payments: state.payments.map((payment) => (payment.id === id ? result.payment : payment)),
        bookings: result.booking
          ? state.bookings.map((booking) => (booking.id === result.booking?.id ? result.booking : booking))
          : state.bookings,
        notifications: result.notification ? [result.notification, ...state.notifications] : state.notifications,
        dashboard: result.dashboard,
        saving: false,
      }));
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Could not update payment' });
      throw error;
    }
  },

  updateBusiness: async (data) => {
    set({ saving: true, error: undefined });
    try {
      const result = await apiFetch<{ business: BusinessProfile }>('/api/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set({ business: result.business, saving: false });
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Could not update settings' });
      throw error;
    }
  },

  addAvailabilityBlock: async (block) => {
    set({ saving: true, error: undefined });
    try {
      const result = await apiFetch<{ availabilityBlock: AvailabilityBlock; availability: AvailabilityCell[] }>(
        '/api/availability',
        {
          method: 'POST',
          body: JSON.stringify(block),
        }
      );
      set((state) => ({
        availabilityBlocks: [result.availabilityBlock, ...state.availabilityBlocks],
        availability: result.availability,
        saving: false,
      }));
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Could not update availability' });
      throw error;
    }
  },

  deleteAvailabilityBlock: async (id) => {
    set({ saving: true, error: undefined });
    try {
      const result = await apiFetch<{ availabilityBlock: AvailabilityBlock; availability: AvailabilityCell[] }>(
        `/api/availability/${id}`,
        { method: 'DELETE' }
      );
      set((state) => ({
        availabilityBlocks: state.availabilityBlocks.filter((block) => block.id !== id),
        availability: result.availability,
        saving: false,
      }));
    } catch (error) {
      set({ saving: false, error: error instanceof Error ? error.message : 'Could not update availability' });
      throw error;
    }
  },

  markNotificationRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      ),
    }));
    await apiFetch(`/api/notifications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
    });
  },

  markAllNotificationsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
    }));
    await apiFetch('/api/notifications', { method: 'PATCH' });
  },

  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
