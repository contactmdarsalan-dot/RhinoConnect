'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, CheckCheck, Calendar, CreditCard, Users, Info } from 'lucide-react';
import { useStore } from '@/lib/store';
import { currentUser } from '@/lib/mock-data';
import { getInitials, timeAgo, cn } from '@/lib/utils';

const notifIcons = {
  booking: Calendar,
  payment: CreditCard,
  customer: Users,
  system: Info,
};

const notifColors = {
  booking: 'var(--accent-blue)',
  payment: 'var(--accent-emerald)',
  customer: 'var(--accent-purple)',
  system: 'var(--accent-amber)',
};

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadCount } = useStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const count = unreadCount();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 flex-shrink-0"
      style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-raised)' }}>

      {/* Title */}
      <div>
        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <AnimatePresence>
          {searchOpen ? (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex items-center"
            >
              <div className="relative w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }} />
                <input
                  autoFocus
                  placeholder="Search bookings, customers…"
                  className="input-dark w-full pl-9 pr-4 py-2 rounded-lg text-sm"
                  onBlur={() => setSearchOpen(false)}
                />
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center btn-ghost"
            >
              <Search size={16} />
            </button>
          )}
        </AnimatePresence>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center btn-ghost"
          >
            <Bell size={16} />
            {count > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full pulse-dot"
                style={{ background: 'var(--accent-rose)' }} />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 rounded-xl glass z-50 overflow-hidden"
                style={{ boxShadow: 'var(--shadow-soft)' }}
              >
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="font-semibold text-sm">Notifications</span>
                  <button onClick={markAllNotificationsRead}
                    className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
                    style={{ color: 'var(--accent-blue)' }}>
                    <CheckCheck size={12} /> Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => {
                    const Icon = notifIcons[n.type];
                    const color = notifColors[n.type];
                    return (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={cn(
                          'flex gap-3 px-4 py-3 transition-all cursor-pointer',
                          !n.read && 'bg-white/[0.02]',
                          'hover:bg-white/[0.04]'
                        )}
                        style={{ borderBottom: '1px solid var(--border)' }}
                      >
                        <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                          style={{ background: `${color}18`, color }}>
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{n.title}</p>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ background: 'var(--accent-blue)' }} />
                            )}
                          </div>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {n.message}
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-2" style={{ borderLeft: '1px solid var(--border)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}>
            {getInitials(currentUser.name)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none" style={{ color: 'var(--text-primary)' }}>
              {currentUser.name.split(' ')[0]}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
