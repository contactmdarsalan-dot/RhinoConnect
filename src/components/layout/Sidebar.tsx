'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Users, CreditCard, BarChart3,
  Settings, ChevronLeft, ChevronRight, Zap, Mountain, CalendarDays,
  Bell, HelpCircle, LogOut, Package,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/bookings', icon: Calendar, label: 'Bookings' },
  { href: '/dashboard/services', icon: Package, label: 'Services' },
  { href: '/dashboard/availability', icon: CalendarDays, label: 'Availability' },
  { href: '/dashboard/customers', icon: Users, label: 'Customers' },
  { href: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, unreadCount } = useStore();
  const count = unreadCount();

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col flex-shrink-0 h-screen overflow-hidden"
      style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 overflow-hidden">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--accent-warm)' }}>
          <Mountain size={18} color="var(--text-primary)" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-bold text-sm leading-none" style={{ color: 'var(--text-on-image)' }}>RhinoPeak</p>
              <p className="text-xs mt-0.5" style={{ color: 'oklch(78% 0.018 224)' }}>Connect</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Plan badge */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-4 px-3 py-2 rounded-lg flex items-center gap-2"
            style={{ background: 'oklch(31% 0.045 224)', border: '1px solid oklch(42% 0.05 224)' }}
          >
            <Zap size={12} style={{ color: 'var(--accent-warm)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-on-image)' }}>Pro Plan Active</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn('nav-item', isActive && 'active')}
              title={!sidebarOpen ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {label === 'Dashboard' && count > 0 && sidebarOpen && (
                <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--accent-rose)', color: 'white' }}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 pb-4 space-y-1 border-t" style={{ borderColor: 'var(--border)', paddingTop: '12px' }}>
        <button className="nav-item w-full" title={!sidebarOpen ? 'Notifications' : undefined}>
          <div className="relative flex-shrink-0">
            <Bell size={18} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: 'var(--accent-rose)', color: 'white' }}>
                {count}
              </span>
            )}
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Notifications
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button className="nav-item w-full" title={!sidebarOpen ? 'Help' : undefined}>
          <HelpCircle size={18} className="flex-shrink-0" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Help & Support</motion.span>
            )}
          </AnimatePresence>
        </button>
        <Link href="/login" className="nav-item w-full" title={!sidebarOpen ? 'Sign out' : undefined}>
          <LogOut size={18} className="flex-shrink-0" style={{ color: 'var(--accent-rose)' }} />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ color: 'var(--accent-rose)' }}>
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full flex items-center justify-center z-50 transition-all-smooth hover:scale-110"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
      >
        {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </motion.aside>
  );
}
