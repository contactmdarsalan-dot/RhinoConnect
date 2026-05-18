'use client';

import { motion } from 'framer-motion';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

const PIE_COLORS = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#a855f7'];

type ChartPayload = {
  name?: string;
  value: number;
  color?: string;
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: ChartPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-4 py-3 text-sm" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-bold" style={{ color: p.color }}>
          {p.name === 'revenue' ? formatCurrency(p.value) : p.value}
          <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-muted)' }}>{p.name}</span>
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { customers, dashboard } = useStore();
  const revenueData = dashboard.revenueData;

  const pieData = dashboard.serviceRevenue.slice(0, 5);
  const countryChartData = dashboard.countryBreakdown;

  const conversionData = revenueData.map((d) => ({
    ...d,
    avgBookingValue: d.bookings > 0 ? Math.round(d.revenue / d.bookings) : 0,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="p-6 space-y-6">

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Avg Booking Value', value: formatCurrency(Math.round(388000 / 35)), delta: '+12%' },
          { label: 'Customer LTV', value: formatCurrency(Math.round(customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length)), delta: '+18%' },
          { label: 'Booking Conv. Rate', value: '68%', delta: '+5%' },
          { label: 'Repeat Customer Rate', value: `${Math.round((customers.filter(c => c.totalBookings > 1).length / customers.length) * 100)}%`, delta: '+8%' },
        ].map(({ label, value, delta }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <p className="text-2xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="text-xs mt-1 font-semibold" style={{ color: 'var(--accent-emerald)' }}>{delta} vs last month</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue + Customers Trend */}
        <div className="xl:col-span-2 glass rounded-2xl p-5">
          <h3 className="font-semibold mb-1">Revenue & Customer Growth</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Side-by-side monthly comparison</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#8b97b0' }} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" name="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
              <Line yAxisId="right" type="monotone" dataKey="customers" name="customers" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Service Pie */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-1">Revenue by Service</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Top 5 services by revenue</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', color: '#f0f4ff', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.slice(0, 4).map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                <p className="text-xs truncate flex-1" style={{ color: 'var(--text-secondary)' }}>{d.name}</p>
                <p className="text-xs font-semibold">{formatCurrency(d.value)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Avg Booking Value */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-1">Avg Booking Value Trend</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Monthly average revenue per booking</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgBookingValue" name="avg value" fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Country Breakdown */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-1">Customers by Country</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Where your customers come from</p>
          <div className="space-y-3">
            {countryChartData.map((d, i) => {
              const pct = Math.round((d.value / customers.length) * 100);
              return (
                <div key={d.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{d.name}</span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{d.value} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
