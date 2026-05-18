'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useStore } from '@/lib/store';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard Overview', subtitle: "Welcome back, Arjun - here's what's happening today." },
  '/dashboard/bookings': { title: 'Bookings', subtitle: 'Manage reservations, customer details, and booking status.' },
  '/dashboard/services': { title: 'Services', subtitle: 'Manage bookable offers, pricing, availability, and customer-facing media.' },
  '/dashboard/availability': { title: 'Availability', subtitle: 'Control capacity, calendar blocks, and booking limits.' },
  '/dashboard/customers': { title: 'Customers', subtitle: 'Track and manage your customer relationships.' },
  '/dashboard/payments': { title: 'Payments', subtitle: 'Monitor revenue, invoices, and payment status.' },
  '/dashboard/analytics': { title: 'Analytics', subtitle: 'Deep insights into your business performance.' },
  '/dashboard/settings': { title: 'Settings', subtitle: 'Configure your business profile and preferences.' },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const page = pageTitles[pathname] || { title: 'RhinoPeak Connect', subtitle: '' };
  const loadAppData = useStore((state) => state.loadAppData);

  useEffect(() => {
    void loadAppData();
  }, [loadAppData]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={page.title} subtitle={page.subtitle} />
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
