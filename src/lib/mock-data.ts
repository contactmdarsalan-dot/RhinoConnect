import type { Customer, Booking, Payment, RevenueData, Notification, User } from './types';

export const currentUser: User = {
  id: 'u1',
  name: 'Arjun Sharma',
  email: 'arjun@himalayahaven.com',
  role: 'admin',
  businessName: 'Himalaya Haven Lodge',
  businessType: 'hotel',
  plan: 'pro',
};

export const customers: Customer[] = [
  { id: 'c1', name: 'Emma Wilson', email: 'emma@gmail.com', phone: '+44 7700 900123', country: 'United Kingdom', totalBookings: 3, totalSpent: 85000, lastVisit: '2026-05-10', createdAt: '2025-11-01', tags: ['vip', 'repeat'], notes: 'Prefers quiet rooms with mountain view.' },
  { id: 'c2', name: 'Lucas Müller', email: 'lucas.m@web.de', phone: '+49 170 1234567', country: 'Germany', totalBookings: 1, totalSpent: 32000, lastVisit: '2026-05-12', createdAt: '2026-04-20', tags: ['trekker'], notes: '' },
  { id: 'c3', name: 'Priya Thapa', email: 'priya.thapa@nepal.com', phone: '+977 9801234567', country: 'Nepal', totalBookings: 5, totalSpent: 120000, lastVisit: '2026-05-15', createdAt: '2025-06-15', tags: ['vip', 'repeat', 'local'], notes: 'Corporate client — invoice required.' },
  { id: 'c4', name: 'James Chen', email: 'jchen@outlook.com', phone: '+1 415 555 0192', country: 'USA', totalBookings: 2, totalSpent: 55000, lastVisit: '2026-04-28', createdAt: '2026-01-10', tags: ['family'], notes: '' },
  { id: 'c5', name: 'Sophie Dubois', email: 'sophie.d@mail.fr', phone: '+33 6 12 34 56 78', country: 'France', totalBookings: 1, totalSpent: 18000, lastVisit: '2026-05-01', createdAt: '2026-04-25', tags: ['solo'], notes: 'Solo traveler, needs airport transfer.' },
  { id: 'c6', name: 'Hiroshi Tanaka', email: 'h.tanaka@jpmail.jp', phone: '+81 90 1234 5678', country: 'Japan', totalBookings: 4, totalSpent: 98000, lastVisit: '2026-05-17', createdAt: '2025-09-03', tags: ['repeat', 'vip'], notes: '' },
  { id: 'c7', name: 'Anita Rai', email: 'anita.rai@yahoo.com', phone: '+977 9851234567', country: 'Nepal', totalBookings: 2, totalSpent: 28000, lastVisit: '2026-03-20', createdAt: '2026-02-14', tags: ['local'], notes: '' },
  { id: 'c8', name: 'Marco Rossi', email: 'm.rossi@libero.it', phone: '+39 347 123 4567', country: 'Italy', totalBookings: 1, totalSpent: 22000, lastVisit: '2026-05-08', createdAt: '2026-05-02', tags: ['photographer'], notes: 'Interested in sunrise tours.' },
];

export const bookings: Booking[] = [
  { id: 'b1', bookingRef: 'RPC-10234', customerId: 'c1', customerName: 'Emma Wilson', customerEmail: 'emma@gmail.com', service: 'Deluxe Mountain View Room', serviceType: 'hotel', checkIn: '2026-05-20', checkOut: '2026-05-25', guests: 2, amount: 32000, status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'Khalti', notes: '', createdAt: '2026-05-10', updatedAt: '2026-05-10' },
  { id: 'b2', bookingRef: 'RPC-10235', customerId: 'c2', customerName: 'Lucas Müller', customerEmail: 'lucas.m@web.de', service: 'Annapurna Base Camp Trek (7D)', serviceType: 'trekking', checkIn: '2026-05-22', checkOut: '2026-05-29', guests: 1, amount: 45000, status: 'pending', paymentStatus: 'partial', paymentMethod: 'Bank Transfer', notes: 'Needs porter and guide.', createdAt: '2026-05-12', updatedAt: '2026-05-12' },
  { id: 'b3', bookingRef: 'RPC-10236', customerId: 'c3', customerName: 'Priya Thapa', customerEmail: 'priya.thapa@nepal.com', service: 'Corporate Package – 10 Rooms', serviceType: 'hotel', checkIn: '2026-06-01', checkOut: '2026-06-05', guests: 20, amount: 120000, status: 'confirmed', paymentStatus: 'partial', paymentMethod: 'Bank Transfer', notes: 'Invoice #INV-2026-045 issued.', createdAt: '2026-05-14', updatedAt: '2026-05-15' },
  { id: 'b4', bookingRef: 'RPC-10237', customerId: 'c4', customerName: 'James Chen', customerEmail: 'jchen@outlook.com', service: 'Family Suite', serviceType: 'hotel', checkIn: '2026-05-18', checkOut: '2026-05-23', guests: 4, amount: 55000, status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'eSewa', notes: '', createdAt: '2026-05-01', updatedAt: '2026-05-01' },
  { id: 'b5', bookingRef: 'RPC-10238', customerId: 'c5', customerName: 'Sophie Dubois', customerEmail: 'sophie.d@mail.fr', service: 'Standard Room + Airport Transfer', serviceType: 'hotel', checkIn: '2026-05-19', checkOut: '2026-05-22', guests: 1, amount: 18000, status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'Stripe', notes: '', createdAt: '2026-05-04', updatedAt: '2026-05-04' },
  { id: 'b6', bookingRef: 'RPC-10239', customerId: 'c6', customerName: 'Hiroshi Tanaka', customerEmail: 'h.tanaka@jpmail.jp', service: 'Everest Base Camp Trek (14D)', serviceType: 'trekking', checkIn: '2026-06-10', checkOut: '2026-06-24', guests: 2, amount: 98000, status: 'pending', paymentStatus: 'unpaid', paymentMethod: '', notes: 'Altitude sickness precautions required.', createdAt: '2026-05-17', updatedAt: '2026-05-17' },
  { id: 'b7', bookingRef: 'RPC-10240', customerId: 'c7', customerName: 'Anita Rai', customerEmail: 'anita.rai@yahoo.com', service: 'Yoga & Wellness Retreat (3D)', serviceType: 'wellness', checkIn: '2026-05-25', checkOut: '2026-05-28', guests: 1, amount: 12000, status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'eSewa', notes: '', createdAt: '2026-05-13', updatedAt: '2026-05-13' },
  { id: 'b8', bookingRef: 'RPC-10241', customerId: 'c8', customerName: 'Marco Rossi', customerEmail: 'm.rossi@libero.it', service: 'Sunrise Photography Tour', serviceType: 'travel', checkIn: '2026-05-21', checkOut: '2026-05-21', guests: 1, amount: 8000, status: 'cancelled', paymentStatus: 'refunded', paymentMethod: 'Stripe', notes: 'Flight delayed — cancelled by customer.', createdAt: '2026-05-05', updatedAt: '2026-05-08' },
  { id: 'b9', bookingRef: 'RPC-10242', customerId: 'c1', customerName: 'Emma Wilson', customerEmail: 'emma@gmail.com', service: 'Deluxe Mountain View Room', serviceType: 'hotel', checkIn: '2026-04-01', checkOut: '2026-04-08', guests: 2, amount: 42000, status: 'completed', paymentStatus: 'paid', paymentMethod: 'Khalti', notes: '', createdAt: '2026-03-20', updatedAt: '2026-04-08' },
  { id: 'b10', bookingRef: 'RPC-10243', customerId: 'c6', customerName: 'Hiroshi Tanaka', customerEmail: 'h.tanaka@jpmail.jp', service: 'Langtang Valley Trek (10D)', serviceType: 'trekking', checkIn: '2026-03-05', checkOut: '2026-03-15', guests: 2, amount: 65000, status: 'completed', paymentStatus: 'paid', paymentMethod: 'Bank Transfer', notes: '', createdAt: '2026-02-20', updatedAt: '2026-03-15' },
];

export const payments: Payment[] = [
  { id: 'p1', bookingId: 'b2', bookingRef: 'RPC-10235', customerName: 'Lucas Müller', amount: 45000, paid: 20000, remaining: 25000, status: 'partial', method: 'Bank Transfer', date: '2026-05-12', dueDate: '2026-05-20' },
  { id: 'p2', bookingId: 'b3', bookingRef: 'RPC-10236', customerName: 'Priya Thapa', amount: 120000, paid: 60000, remaining: 60000, status: 'partial', method: 'Bank Transfer', date: '2026-05-15', dueDate: '2026-05-30' },
  { id: 'p3', bookingId: 'b6', bookingRef: 'RPC-10239', customerName: 'Hiroshi Tanaka', amount: 98000, paid: 0, remaining: 98000, status: 'unpaid', method: '', date: '2026-05-17', dueDate: '2026-06-01' },
  { id: 'p4', bookingId: 'b1', bookingRef: 'RPC-10234', customerName: 'Emma Wilson', amount: 32000, paid: 32000, remaining: 0, status: 'paid', method: 'Khalti', date: '2026-05-10', dueDate: '2026-05-10' },
  { id: 'p5', bookingId: 'b4', bookingRef: 'RPC-10237', customerName: 'James Chen', amount: 55000, paid: 55000, remaining: 0, status: 'paid', method: 'eSewa', date: '2026-05-01', dueDate: '2026-05-01' },
  { id: 'p6', bookingId: 'b5', bookingRef: 'RPC-10238', customerName: 'Sophie Dubois', amount: 18000, paid: 18000, remaining: 0, status: 'paid', method: 'Stripe', date: '2026-05-04', dueDate: '2026-05-04' },
  { id: 'p7', bookingId: 'b7', bookingRef: 'RPC-10240', customerName: 'Anita Rai', amount: 12000, paid: 12000, remaining: 0, status: 'paid', method: 'eSewa', date: '2026-05-13', dueDate: '2026-05-13' },
  { id: 'p8', bookingId: 'b8', bookingRef: 'RPC-10241', customerName: 'Marco Rossi', amount: 8000, paid: 8000, remaining: 0, status: 'refunded', method: 'Stripe', date: '2026-05-08', dueDate: '2026-05-08' },
];

export const revenueData: RevenueData[] = [
  { month: 'Nov', revenue: 145000, bookings: 12, customers: 10 },
  { month: 'Dec', revenue: 198000, bookings: 18, customers: 15 },
  { month: 'Jan', revenue: 165000, bookings: 14, customers: 12 },
  { month: 'Feb', revenue: 220000, bookings: 20, customers: 17 },
  { month: 'Mar', revenue: 285000, bookings: 26, customers: 22 },
  { month: 'Apr', revenue: 312000, bookings: 29, customers: 24 },
  { month: 'May', revenue: 388000, bookings: 35, customers: 30 },
];

export const notifications: Notification[] = [
  { id: 'n1', type: 'booking', title: 'New Booking', message: 'Hiroshi Tanaka made a new booking for EBC Trek.', read: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'n2', type: 'payment', title: 'Payment Received', message: 'Emma Wilson paid Rs. 32,000 via Khalti.', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n3', type: 'customer', title: 'New Customer', message: 'Marco Rossi registered as a new customer.', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'n4', type: 'system', title: 'Monthly Report Ready', message: 'Your May 2026 revenue report is ready to view.', read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
];

export const dashboardStats = {
  totalRevenue: 388000,
  revenueChange: 24.4,
  totalBookings: 35,
  bookingsChange: 20.7,
  totalCustomers: 30,
  customersChange: 25.0,
  occupancyRate: 78,
  occupancyChange: 8.3,
};

export const serviceTypes = [
  'Hotel Room',
  'Homestay Package',
  'Trekking Package',
  'Travel Tour',
  'Cafe / Dining',
  'Wellness Retreat',
  'Event Space',
  'Airport Transfer',
];

export const paymentMethods = ['eSewa', 'Khalti', 'Bank Transfer', 'Stripe', 'Cash'];
