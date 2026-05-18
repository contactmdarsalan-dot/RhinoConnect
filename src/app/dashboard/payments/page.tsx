'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Clock, CheckCircle, XCircle, Download, Edit3, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate, getStatusColor, getInitials, cn } from '@/lib/utils';
import type { Payment } from '@/lib/types';
import { paymentMethods } from '@/lib/mock-data';

const methodColors: Record<string, string> = {
  'eSewa': '#60a5fa',
  'Khalti': '#a78bfa',
  'Stripe': '#34d399',
  'Bank Transfer': '#f59e0b',
  'Cash': '#94a3b8',
};

function PaymentEditModal({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const { updatePayment, saving, error } = useStore();
  const [form, setForm] = useState({
    paid: String(payment.paid),
    method: payment.method || paymentMethods[0],
    status: payment.status,
    dueDate: payment.dueDate,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePayment(payment.id, form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass rounded-2xl p-6 w-full max-w-md" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-lg">Update Payment</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--accent-blue)' }}>{payment.bookingRef}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg btn-ghost flex items-center justify-center"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Paid Amount</label>
            <input type="number" value={form.paid} onChange={(e) => setForm((prev) => ({ ...prev, paid: e.target.value }))}
              className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Method</label>
            <select value={form.method} onChange={(e) => setForm((prev) => ({ ...prev, method: e.target.value }))}
              className="input-dark w-full px-3 py-2.5 rounded-lg text-sm">
              {paymentMethods.map((method) => <option key={method}>{method}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status</label>
            <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as Payment['status'] }))}
              className="input-dark w-full px-3 py-2.5 rounded-lg text-sm">
              {['unpaid', 'partial', 'paid', 'refunded'].map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Due Date</label>
            <input type="date" value={form.dueDate} onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
              className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" />
          </div>
          {error && <p className="text-xs" style={{ color: 'var(--accent-rose)' }}>{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl btn-ghost text-sm font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-medium">
              {saving ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function PaymentsPage() {
  const { payments } = useStore();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const totalCollected = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.paid, 0);
  const totalPending = payments.filter(p => p.status !== 'paid' && p.status !== 'refunded').reduce((s, p) => s + p.remaining, 0);
  const totalRefunded = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.paid, 0);
  const pendingCount = payments.filter(p => p.status === 'unpaid' || p.status === 'partial').length;

  const methodTotals = payments.reduce((acc, p) => {
    if (p.method && p.status === 'paid') acc[p.method] = (acc[p.method] || 0) + p.paid;
    return acc;
  }, {} as Record<string, number>);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="p-6 space-y-6">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Collected', value: formatCurrency(totalCollected), icon: CheckCircle, color: 'var(--accent-emerald)', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Outstanding', value: formatCurrency(totalPending), icon: Clock, color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Refunded', value: formatCurrency(totalRefunded), icon: XCircle, color: 'var(--accent-rose)', bg: 'rgba(244,63,94,0.1)' },
          { label: 'Pending Invoices', value: pendingCount.toString(), icon: CreditCard, color: 'var(--accent-blue)', bg: 'rgba(59,130,246,0.1)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass rounded-2xl p-5 glass-hover transition-all-smooth">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: bg, color }}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold" style={{ color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Payment Methods Breakdown */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {Object.entries(methodTotals).map(([method, amount]) => {
              const pct = Math.round((amount / totalCollected) * 100);
              return (
                <div key={method}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{method}</span>
                    <span className="text-sm font-bold">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full rounded-full" style={{ background: methodColors[method] || '#3b82f6' }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatCurrency(amount)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payments Table */}
        <div className="xl:col-span-2 glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-semibold">Payment Tracker</h3>
            <button className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium">
              <Download size={12} /> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Customer', 'Ref', 'Amount', 'Paid', 'Remaining', 'Method', 'Due Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {payments.map((p) => (
                  <tr key={p.id} className="table-row-hover">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--gradient-2)' }}>
                          {getInitials(p.customerName)}
                        </div>
                        <span className="text-sm font-medium">{p.customerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs font-mono" style={{ color: 'var(--accent-blue)' }}>{p.bookingRef}</span></td>
                    <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--accent-emerald)' }}>{formatCurrency(p.paid)}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: p.remaining > 0 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                      {formatCurrency(p.remaining)}
                    </td>
                    <td className="px-4 py-3">
                      {p.method ? (
                        <span className="text-xs px-2 py-1 rounded-lg font-medium"
                          style={{ background: `${methodColors[p.method] || '#3b82f6'}18`, color: methodColors[p.method] || '#3b82f6' }}>
                          {p.method}
                        </span>
                      ) : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{formatDate(p.dueDate)}</td>
                    <td className="px-4 py-3"><span className={cn('badge', getStatusColor(p.status))}>{p.status}</span></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedPayment(p)} className="w-7 h-7 rounded-lg btn-ghost flex items-center justify-center">
                        <Edit3 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {selectedPayment && <PaymentEditModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} />}
    </motion.div>
  );
}
