'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Calendar, Users,
  CreditCard, Percent, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate, getStatusColor, getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

const statCards = [
  {
    title: 'Total Revenue', key: 'totalRevenue', changeKey: 'revenueChange',
    icon: CreditCard, color: 'var(--accent-blue)', glow: 'stat-glow-blue',
    format: (v: number) => formatCurrency(v),
  },
  {
    title: 'Total Bookings', key: 'totalBookings', changeKey: 'bookingsChange',
    icon: Calendar, color: 'var(--accent-emerald)', glow: 'stat-glow-emerald',
    format: (v: number) => v.toString(),
  },
  {
    title: 'Customers', key: 'totalCustomers', changeKey: 'customersChange',
    icon: Users, color: 'var(--accent-purple)', glow: 'stat-glow-purple',
    format: (v: number) => v.toString(),
  },
  {
    title: 'Occupancy Rate', key: 'occupancyRate', changeKey: 'occupancyChange',
    icon: Percent, color: 'var(--accent-amber)', glow: 'stat-glow-amber',
    format: (v: number) => `${v}%`,
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
};

type ChartPayload = {
  name?: string;
  value: number;
  color?: string;
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: ChartPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-4 py-3" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name === 'revenue' ? formatCurrency(p.value) : p.value}
          <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-muted)' }}>{p.name}</span>
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { bookings, customers, dashboard, loading } = useStore();
  const dashboardStats = dashboard.stats;
  const revenueData = dashboard.revenueData;
  const recentBookings = bookings.slice(0, 5);
  const topCustomers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 4);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 space-y-6"
    >
      {loading && (
        <motion.div variants={itemVariants} className="glass rounded-2xl px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Syncing latest bookings, payments, and availability from the backend...
        </motion.div>
      )}

      {/* Stat Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ title, key, changeKey, icon: Icon, color, glow, format }) => {
          const value = dashboardStats[key as keyof typeof dashboardStats] as number;
          const change = dashboardStats[changeKey as keyof typeof dashboardStats] as number;
          const isPositive = change >= 0;
          return (
            <div
              key={key}
              className={cn('glass rounded-2xl p-5 glass-hover transition-all-smooth', glow)}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}18`, color }}>
                  <Icon size={20} />
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
                  isPositive ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
                )}>
                  {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {Math.abs(change)}%
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {format(value)}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>vs. last month</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Revenue Overview</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Monthly revenue trend (Nov 2025 – May 2026)</p>
            </div>
            <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
              style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)' }}>
              <TrendingUp size={12} /> +24.4% YoY
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#3b82f6" strokeWidth={2}
                fill="url(#revenueGrad)" dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings Bar */}
        <div className="glass rounded-2xl p-5">
          <div className="mb-5">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Monthly Bookings</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Total reservations per month</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="bookings" name="bookings" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recent Bookings + Top Customers */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Bookings */}
        <div className="xl:col-span-2 glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Bookings</h3>
            <Link href="/dashboard/bookings"
              className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent-blue)' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {recentBookings.map((booking) => {
              return (
                <div key={booking.id}
                  className="flex items-center gap-4 px-5 py-3 table-row-hover transition-all-smooth">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'var(--gradient-1)' }}>
                    {getInitials(booking.customerName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{booking.customerName}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{booking.service}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold">{formatCurrency(booking.amount)}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatDate(booking.checkIn)}</p>
                  </div>
                  <span className={cn('badge text-xs', getStatusColor(booking.status))}>{booking.status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Customers */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Top Customers</h3>
            <Link href="/dashboard/customers"
              className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent-blue)' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {topCustomers.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl glass-hover transition-all-smooth">
                <span className="text-xs font-bold w-4" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: i === 0 ? 'var(--gradient-3)' : 'var(--gradient-2)' }}>
                  {getInitials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.country} · {c.totalBookings} stays</p>
                </div>
                <p className="text-sm font-bold text-right flex-shrink-0" style={{ color: 'var(--accent-emerald)' }}>
                  {formatCurrency(c.totalSpent)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
