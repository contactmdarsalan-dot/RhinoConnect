'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Eye, Trash2, Calendar, X, ChevronDown } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate, getStatusColor, getInitials, cn } from '@/lib/utils';
import type { Booking } from '@/lib/types';
import { serviceTypes, paymentMethods } from '@/lib/mock-data';

const statusFilters = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

function BookingDetailModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
        className="glass rounded-2xl p-6 w-full max-w-lg" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-lg">Booking Details</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--accent-blue)' }}>{booking.bookingRef}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg btn-ghost flex items-center justify-center"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          {[
            ['Customer', booking.customerName], ['Email', booking.customerEmail],
            ['Service', booking.service], ['Check-in', formatDate(booking.checkIn)],
            ['Check-out', formatDate(booking.checkOut)], ['Guests', String(booking.guests)],
            ['Amount', formatCurrency(booking.amount)], ['Payment Method', booking.paymentMethod || '—'],
            ['Notes', booking.notes || '—'],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-4">
              <span className="text-xs font-medium w-28 flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <span className={cn('badge', getStatusColor(booking.status))}>{booking.status}</span>
            <span className={cn('badge', getStatusColor(booking.paymentStatus))}>{booking.paymentStatus}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AddBookingModal({ onClose }: { onClose: () => void }) {
  const { addBooking, services, saving, error } = useStore();
  const initialService = services[0];
  const [form, setForm] = useState({
    customerName: '', customerEmail: '', customerPhone: '', country: 'Nepal',
    serviceId: initialService?.id ?? '', service: initialService?.name ?? serviceTypes[0],
    checkIn: '', checkOut: '', guests: '1', amount: initialService ? String(initialService.basePrice) : '', paid: '0', notes: '', paymentMethod: paymentMethods[0],
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addBooking({
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      customerPhone: form.customerPhone,
      country: form.country,
      serviceId: form.serviceId || undefined,
      service: form.service,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      guests: form.guests,
      amount: form.amount,
      paid: form.paid,
      paymentMethod: form.paymentMethod,
      notes: form.notes,
    });
    onClose();
  };

  const serviceOptions = services.length
    ? services.map((service) => ({ id: service.id, name: service.name }))
    : serviceTypes.map((name) => ({ id: '', name }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
        className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">New Booking</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg btn-ghost flex items-center justify-center"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {[
            { k: 'customerName', label: 'Customer Name', type: 'text', ph: 'Full name' },
            { k: 'customerEmail', label: 'Email', type: 'email', ph: 'email@example.com' },
            { k: 'customerPhone', label: 'Phone', type: 'text', ph: '+977 9800000000' },
            { k: 'country', label: 'Country', type: 'text', ph: 'Nepal' },
            { k: 'checkIn', label: 'Check-in', type: 'date', ph: '' },
            { k: 'checkOut', label: 'Check-out', type: 'date', ph: '' },
            { k: 'guests', label: 'Guests', type: 'number', ph: '1' },
            { k: 'amount', label: 'Amount (NPR)', type: 'number', ph: '0' },
            { k: 'paid', label: 'Paid Now (NPR)', type: 'number', ph: '0' },
            { k: 'notes', label: 'Notes (optional)', type: 'text', ph: 'Any special requests' },
          ].map(({ k, label, type, ph }) => (
            <div key={k}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
              <input type={type} placeholder={ph} value={form[k as keyof typeof form]}
                onChange={(e) => set(k, e.target.value)}
                className="input-dark w-full px-3 py-2.5 rounded-lg text-sm"
                required={['customerName', 'customerEmail', 'country', 'checkIn', 'checkOut'].includes(k)} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Service</label>
            <select
              value={form.serviceId || form.service}
              onChange={(e) => {
                const selected = services.find((service) => service.id === e.target.value);
                setForm((prev) => ({
                  ...prev,
                  serviceId: selected?.id ?? '',
                  service: selected?.name ?? e.target.value,
                  amount: selected ? String(selected.basePrice) : prev.amount,
                }));
              }}
              className="input-dark w-full px-3 py-2.5 rounded-lg text-sm"
            >
              {serviceOptions.map((option) => <option key={option.id || option.name} value={option.id || option.name}>{option.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Payment Method</label>
            <select value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}
              className="input-dark w-full px-3 py-2.5 rounded-lg text-sm">
              {paymentMethods.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          {error && <p className="text-xs" style={{ color: 'var(--accent-rose)' }}>{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl btn-ghost text-sm font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-medium">
              {saving ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function BookingsPage() {
  const { bookings, deleteBooking } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = bookings.filter((b) => {
    const s = search.toLowerCase();
    const match = b.customerName.toLowerCase().includes(s) || b.bookingRef.toLowerCase().includes(s) || b.service.toLowerCase().includes(s);
    return match && (statusFilter === 'all' || b.status === statusFilter);
  });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ref, or service…" className="input-dark w-full pl-9 pr-4 py-2.5 rounded-xl text-sm" />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="input-dark pl-3 pr-8 py-2.5 rounded-xl text-sm appearance-none cursor-pointer">
              {statusFilters.map((s) => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium">
            <Plus size={15} /> New Booking
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all-smooth', statusFilter === s ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' : 'btn-ghost')}>
            {s === 'all' ? `All (${bookings.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${bookings.filter(b => b.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Ref', 'Customer', 'Service', 'Dates', 'Guests', 'Amount', 'Status', 'Payment', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              <AnimatePresence>
                {filtered.map((b) => (
                  <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="table-row-hover" onClick={() => setSelected(b)}>
                    <td className="px-4 py-3"><span className="text-xs font-mono font-semibold" style={{ color: 'var(--accent-blue)' }}>{b.bookingRef}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--gradient-1)' }}>{getInitials(b.customerName)}</div>
                        <div><p className="text-sm font-medium">{b.customerName}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.customerEmail}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><p className="text-sm max-w-[160px] truncate">{b.service}</p></td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</td>
                    <td className="px-4 py-3 text-sm text-center">{b.guests}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(b.amount)}</td>
                    <td className="px-4 py-3"><span className={cn('badge', getStatusColor(b.status))}>{b.status}</span></td>
                    <td className="px-4 py-3"><span className={cn('badge', getStatusColor(b.paymentStatus))}>{b.paymentStatus}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setSelected(b)} className="w-7 h-7 rounded-lg btn-ghost flex items-center justify-center"><Eye size={13} /></button>
                        <button onClick={() => deleteBooking(b.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-all" style={{ color: 'var(--text-muted)' }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
              <Calendar size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No bookings found</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && <BookingDetailModal booking={selected} onClose={() => setSelected(null)} />}
        {showAdd && <AddBookingModal onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
