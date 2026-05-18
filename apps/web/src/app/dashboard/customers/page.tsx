'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Users, MapPin, Phone, Mail, Star, X, ChevronDown } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate, getInitials, cn } from '@/lib/utils';
import type { Customer } from '@/lib/types';

const tagColors: Record<string, string> = {
  vip: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  repeat: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  trekker: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  local: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  family: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  solo: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  photographer: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  corporate: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
};

function CustomerProfileModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const { bookings } = useStore();
  const customerBookings = bookings.filter((b) => b.customerId === customer.id);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
        className="glass rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
        {/* Profile Header */}
        <div className="p-6 relative" style={{ borderBottom: '1px solid var(--border)' }}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg btn-ghost flex items-center justify-center"><X size={16} /></button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
              style={{ background: 'var(--gradient-1)' }}>{getInitials(customer.name)}</div>
            <div>
              <h2 className="text-xl font-bold">{customer.name}</h2>
              <div className="flex items-center gap-1.5 mt-1" style={{ color: 'var(--text-muted)' }}>
                <MapPin size={12} /><span className="text-xs">{customer.country}</span>
              </div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {customer.tags.map((tag) => (
                  <span key={tag} className={cn('badge text-xs', tagColors[tag] || 'text-slate-400 bg-slate-400/10 border-slate-400/20')}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: 'Total Spent', value: formatCurrency(customer.totalSpent) },
              { label: 'Total Bookings', value: customer.totalBookings.toString() },
              { label: 'Last Visit', value: formatDate(customer.lastVisit) },
            ].map(({ label, value }) => (
              <div key={label} className="glass rounded-xl p-3 text-center">
                <p className="text-sm font-bold">{value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Contact */}
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Contact</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3"><Mail size={14} style={{ color: 'var(--accent-blue)' }} /><span className="text-sm">{customer.email}</span></div>
            <div className="flex items-center gap-3"><Phone size={14} style={{ color: 'var(--accent-emerald)' }} /><span className="text-sm">{customer.phone}</span></div>
          </div>
          {customer.notes && <p className="mt-3 text-sm p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)' }}>{customer.notes}</p>}
        </div>
        {/* Booking History */}
        {customerBookings.length > 0 && (
          <div className="px-6 py-4">
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Booking History ({customerBookings.length})</h3>
            <div className="space-y-2">
              {customerBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl glass">
                  <div>
                    <p className="text-sm font-medium">{b.service}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatDate(b.checkIn)} · {b.bookingRef}</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--accent-emerald)' }}>{formatCurrency(b.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function AddCustomerModal({ onClose }: { onClose: () => void }) {
  const { addCustomer, saving, error } = useStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: '' });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCustomer({ ...form, tags: [], notes: '' });
    onClose();
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
        className="glass rounded-2xl p-6 w-full max-w-md" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">Add Customer</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg btn-ghost flex items-center justify-center"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {[
            { k: 'name', label: 'Full Name', type: 'text', ph: 'John Doe' },
            { k: 'email', label: 'Email', type: 'email', ph: 'john@email.com' },
            { k: 'phone', label: 'Phone', type: 'text', ph: '+977 9800000000' },
            { k: 'country', label: 'Country', type: 'text', ph: 'Nepal' },
          ].map(({ k, label, type, ph }) => (
            <div key={k}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
              <input type={type} placeholder={ph} value={form[k as keyof typeof form]} onChange={(e) => set(k, e.target.value)}
                className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" required />
            </div>
          ))}
          {error && <p className="text-xs" style={{ color: 'var(--accent-rose)' }}>{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl btn-ghost text-sm font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-medium">
              {saving ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function CustomersPage() {
  const { customers } = useStore();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('spent');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = customers
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'spent' ? b.totalSpent - a.totalSpent : sort === 'bookings' ? b.totalBookings - a.totalBookings : a.name.localeCompare(b.name));

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="p-6 space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Customers', value: customers.length, color: 'var(--accent-blue)' },
          { label: 'VIP Customers', value: customers.filter(c => c.tags.includes('vip')).length, color: 'var(--accent-amber)' },
          { label: 'Repeat Customers', value: customers.filter(c => c.totalBookings > 1).length, color: 'var(--accent-emerald)' },
          { label: 'Countries', value: new Set(customers.map(c => c.country)).size, color: 'var(--accent-purple)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-xl p-4">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or country…"
            className="input-dark w-full pl-9 pr-4 py-2.5 rounded-xl text-sm" />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-dark pl-3 pr-8 py-2.5 rounded-xl text-sm appearance-none cursor-pointer">
              <option value="spent">Sort by Spent</option>
              <option value="bookings">Sort by Bookings</option>
              <option value="name">Sort by Name</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium">
            <Plus size={15} /> Add Customer
          </button>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(c)} className="glass rounded-2xl p-5 glass-hover cursor-pointer transition-all-smooth">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: c.tags.includes('vip') ? 'var(--gradient-3)' : 'var(--gradient-1)' }}>
                  {getInitials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{c.name}</p>
                    {c.tags.includes('vip') && <Star size={12} fill="currentColor" style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    <MapPin size={10} /><span className="text-xs">{c.country}</span>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {c.tags.slice(0, 2).map((t) => (
                      <span key={t} className={cn('badge text-xs', tagColors[t] || 'text-slate-400 bg-slate-400/10 border-slate-400/20')}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 grid grid-cols-3 gap-2" style={{ borderTop: '1px solid var(--border)' }}>
                {[
                  { label: 'Spent', value: formatCurrency(c.totalSpent), color: 'var(--accent-emerald)' },
                  { label: 'Bookings', value: c.totalBookings.toString(), color: 'var(--text-primary)' },
                  { label: 'Last Visit', value: formatDate(c.lastVisit), color: 'var(--text-secondary)' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <p className="text-xs font-semibold" style={{ color }}>{value}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 glass rounded-2xl" style={{ color: 'var(--text-muted)' }}>
          <Users size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No customers found</p>
        </div>
      )}

      <AnimatePresence>
        {selected && <CustomerProfileModal customer={selected} onClose={() => setSelected(null)} />}
        {showAdd && <AddCustomerModal onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
