'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Plus, Trash2, X, Lock, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';

function CapacityBlockModal({ onClose }: { onClose: () => void }) {
  const { services, addAvailabilityBlock, saving, error } = useStore();
  const [form, setForm] = useState({
    serviceId: services[0]?.id ?? '',
    startDate: '',
    endDate: '',
    reason: '',
    capacityOverride: '',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAvailabilityBlock({
      serviceId: form.serviceId,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason,
      capacityOverride: form.capacityOverride === '' ? undefined : Number(form.capacityOverride),
    });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }} className="glass rounded-2xl p-6 w-full max-w-md"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-lg">Block or Limit Capacity</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Use 0 to fully block a date range.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg btn-ghost flex items-center justify-center"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Service</label>
            <select value={form.serviceId} onChange={(e) => setForm((prev) => ({ ...prev, serviceId: e.target.value }))}
              className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" required>
              {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Start</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>End</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Reason</label>
            <input value={form.reason} onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="Maintenance, private event, guide limit..." className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Capacity Override</label>
            <input type="number" min="0" value={form.capacityOverride} onChange={(e) => setForm((prev) => ({ ...prev, capacityOverride: e.target.value }))}
              placeholder="Leave empty to block fully" className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" />
          </div>
          {error && <p className="text-xs" style={{ color: 'var(--accent-rose)' }}>{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl btn-ghost text-sm font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-medium">
              {saving ? 'Saving...' : 'Save Block'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function AvailabilityPage() {
  const { services, availability, availabilityBlocks, deleteAvailabilityBlock } = useStore();
  const [showBlockModal, setShowBlockModal] = useState(false);

  const dates = useMemo(() => [...new Set(availability.map((cell) => cell.date))].slice(0, 14), [availability]);
  const cellsByService = useMemo(() => {
    return services.map((service) => ({
      service,
      cells: dates.map((date) => availability.find((cell) => cell.serviceId === service.id && cell.date === date)),
    }));
  }, [availability, dates, services]);

  const totalCapacity = availability.reduce((sum, cell) => sum + cell.capacity, 0);
  const totalBooked = availability.reduce((sum, cell) => sum + cell.booked, 0);
  const blockedCount = availability.filter((cell) => cell.blocked).length;
  const utilization = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="p-6 space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Active Services', value: services.filter((service) => service.active).length, color: 'var(--accent-blue)' },
          { label: 'Booked Units', value: totalBooked, color: 'var(--accent-emerald)' },
          { label: 'Utilization', value: `${utilization}%`, color: 'var(--accent-amber)' },
          { label: 'Blocked Cells', value: blockedCount, color: 'var(--accent-rose)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-semibold">14-Day Capacity Calendar</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Each cell shows available capacity over total capacity.</p>
        </div>
        <button onClick={() => setShowBlockModal(true)} className="btn-primary flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium">
          <Plus size={15} /> Add Block
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="sticky left-0 z-10 text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}>
                  Service
                </th>
                {dates.map((date) => (
                  <th key={date} className="text-center px-3 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                    {formatDateShort(date)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {cellsByService.map(({ service, cells }) => (
                <tr key={service.id}>
                  <td className="sticky left-0 z-10 px-4 py-3" style={{ background: 'var(--bg-card)' }}>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: service.color }} />
                      <div>
                        <p className="text-sm font-semibold">{service.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{service.capacity} base capacity</p>
                      </div>
                    </div>
                  </td>
                  {cells.map((cell, index) => {
                    const healthy = cell && cell.available > 0 && !cell.blocked;
                    return (
                      <td key={`${service.id}-${dates[index]}`} className="px-2 py-3 text-center">
                        <div className="mx-auto h-11 min-w-16 rounded-xl flex flex-col items-center justify-center border"
                          style={{
                            background: cell?.blocked ? 'rgba(244,63,94,0.10)' : healthy ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                            borderColor: cell?.blocked ? 'rgba(244,63,94,0.20)' : healthy ? 'rgba(16,185,129,0.18)' : 'rgba(245,158,11,0.18)',
                            color: cell?.blocked ? 'var(--accent-rose)' : healthy ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                          }}>
                          {cell?.blocked ? <Lock size={13} /> : <span className="text-sm font-bold">{cell?.available ?? 0}/{cell?.capacity ?? 0}</span>}
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{cell?.booked ?? 0} booked</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {availability.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <CalendarDays size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Availability will appear after the backend sync completes.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-semibold">Capacity Blocks</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Maintenance windows, private events, and guide limits.</p>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {availabilityBlocks.map((block) => {
              const service = services.find((item) => item.id === block.serviceId);
              return (
                <div key={block.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.10)', color: 'var(--accent-rose)' }}>
                    <Lock size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{service?.name ?? 'Service'}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatDateShort(block.startDate)} - {formatDateShort(block.endDate)} - {block.reason}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                    {typeof block.capacityOverride === 'number' ? `${block.capacityOverride} cap` : 'blocked'}
                  </span>
                  <button onClick={() => void deleteAvailabilityBlock(block.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-all"
                    style={{ color: 'var(--text-muted)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
            {availabilityBlocks.length === 0 && (
              <div className="px-5 py-10 text-center" style={{ color: 'var(--text-muted)' }}>
                <CheckCircle2 size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No active capacity blocks.</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold">Public Booking Link</h3>
          <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>Share this link on Facebook, WhatsApp, Instagram, or your website.</p>
          <div className="input-dark rounded-xl px-4 py-3 text-sm font-mono break-all">
            /book/himalaya-haven
          </div>
          <a href="/book/himalaya-haven" target="_blank" className="inline-flex mt-4 btn-primary px-4 py-2.5 rounded-xl text-sm font-medium">
            Open Booking Page
          </a>
        </div>
      </div>

      <AnimatePresence>
        {showBlockModal && <CapacityBlockModal onClose={() => setShowBlockModal(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
