'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, Phone, Globe, MapPin, Save, Bell, Shield, CreditCard, Check } from 'lucide-react';
import { currentUser } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';

const tabs = [
  { id: 'business', label: 'Business Profile', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
];

function BusinessTab() {
  const { business, updateBusiness, saving, error } = useStore();
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const form = {
    businessName: draft.businessName ?? business?.name ?? currentUser.businessName,
    email: draft.email ?? business?.email ?? currentUser.email,
    phone: draft.phone ?? business?.phone ?? '+977 9801234567',
    website: draft.website ?? business?.website ?? 'www.himalayahaven.com',
    address: draft.address ?? business?.address ?? 'Thamel, Kathmandu, Nepal',
    description:
      draft.description ??
      business?.description ??
      'A premium lodge nestled in the heart of Kathmandu offering world-class hospitality and guided trekking experiences.',
  };
  const set = (k: string, v: string) => setDraft((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    await updateBusiness({
      name: form.businessName,
      email: form.email,
      phone: form.phone,
      website: form.website,
      address: form.address,
      description: form.description,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { k: 'businessName', label: 'Business Name', icon: Building2, type: 'text' },
          { k: 'email', label: 'Contact Email', icon: Mail, type: 'email' },
          { k: 'phone', label: 'Phone Number', icon: Phone, type: 'text' },
          { k: 'website', label: 'Website', icon: Globe, type: 'text' },
        ].map(({ k, label, icon: Icon, type }) => (
          <div key={k}>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
            <div className="relative">
              <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type={type} value={form[k as keyof typeof form]} onChange={e => set(k, e.target.value)}
                className="input-dark w-full pl-9 pr-4 py-2.5 rounded-lg text-sm" />
            </div>
          </div>
        ))}
      </div>
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Address</label>
        <div className="relative">
          <MapPin size={14} className="absolute left-3 top-3" style={{ color: 'var(--text-muted)' }} />
          <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
            className="input-dark w-full pl-9 pr-4 py-2.5 rounded-lg text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Business Description</label>
        <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
          className="input-dark w-full px-3 py-2.5 rounded-lg text-sm resize-none" />
      </div>
      {error && <p className="text-xs" style={{ color: 'var(--accent-rose)' }}>{error}</p>}
      <button onClick={() => void handleSave()} disabled={saving}
        className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all', saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/20' : 'btn-primary')}>
        {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}</>}
      </button>
    </div>
  );
}

function NotificationsTab() {
  const { business, updateBusiness } = useStore();
  const [localSettings, setLocalSettings] = useState({
    newBooking: true, paymentReceived: true, bookingCancelled: true,
    weeklyReport: true, monthlyReport: true, lowOccupancy: false,
    smsEnabled: false,
  });
  const settings = {
    ...localSettings,
    whatsappEnabled: business?.automation.whatsappEnabled ?? false,
    emailEnabled: business?.automation.emailEnabled ?? true,
  };

  const toggle = (k: string) => {
    if (k === 'emailEnabled' || k === 'whatsappEnabled') {
      void updateBusiness({
        automation: {
          emailEnabled: k === 'emailEnabled' ? !settings.emailEnabled : settings.emailEnabled,
          whatsappEnabled: k === 'whatsappEnabled' ? !settings.whatsappEnabled : settings.whatsappEnabled,
          remindersEnabled: business?.automation.remindersEnabled ?? true,
        },
      });
      return;
    }

    setLocalSettings((prev) => ({ ...prev, [k]: !prev[k as keyof typeof prev] }));
  };

  const groups = [
    { label: 'Booking Alerts', items: [
      { k: 'newBooking', label: 'New Booking Received' },
      { k: 'bookingCancelled', label: 'Booking Cancelled' },
    ]},
    { label: 'Payment Alerts', items: [
      { k: 'paymentReceived', label: 'Payment Received' },
    ]},
    { label: 'Reports', items: [
      { k: 'weeklyReport', label: 'Weekly Summary Report' },
      { k: 'monthlyReport', label: 'Monthly Revenue Report' },
      { k: 'lowOccupancy', label: 'Low Occupancy Alerts' },
    ]},
    { label: 'Channels', items: [
      { k: 'emailEnabled', label: 'Email Notifications' },
      { k: 'whatsappEnabled', label: 'WhatsApp Notifications' },
      { k: 'smsEnabled', label: 'SMS Notifications' },
    ]},
  ];

  return (
    <div className="space-y-6">
      {groups.map(({ label, items }) => (
        <div key={label}>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>{label}</h4>
          <div className="space-y-2">
            {items.map(({ k, label: itemLabel }) => (
              <div key={k} className="flex items-center justify-between p-3 rounded-xl glass glass-hover cursor-pointer"
                onClick={() => toggle(k)}>
                <span className="text-sm font-medium">{itemLabel}</span>
                <div className={cn('w-10 h-5 rounded-full transition-all relative', settings[k as keyof typeof settings] ? 'bg-blue-500' : 'bg-white/10')}>
                  <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all', settings[k as keyof typeof settings] ? 'left-5' : 'left-0.5')} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-5">
      {/* Current Plan */}
      <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(59,130,246,0.15) 100%)', border: '1px solid rgba(99,102,241,0.3)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--accent-indigo)' }}>Current Plan</p>
            <h3 className="text-2xl font-bold gradient-text">Pro Plan</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Rs. 2,999 / month · Billed monthly</p>
          </div>
          <span className="badge text-xs" style={{ color: 'var(--accent-emerald)', background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)' }}>Active</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {['Unlimited bookings', 'Advanced analytics', 'Multi-user access', 'Custom branding', 'WhatsApp automation', 'Priority support'].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm">
              <Check size={13} style={{ color: 'var(--accent-emerald)' }} />{f}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Payment History</h4>
        <div className="glass rounded-xl overflow-hidden">
          {[
            { date: 'May 1, 2026', amount: 'Rs. 2,999', status: 'Paid' },
            { date: 'Apr 1, 2026', amount: 'Rs. 2,999', status: 'Paid' },
            { date: 'Mar 1, 2026', amount: 'Rs. 2,999', status: 'Paid' },
          ].map(({ date, amount, status }, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 table-row-hover" style={{ borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <span className="text-sm">{date}</span>
              <span className="text-sm font-semibold">{amount}</span>
              <span className="badge text-xs" style={{ color: 'var(--accent-emerald)', background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)' }}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-4">
      {[
        { label: 'Current Password', ph: '••••••••' },
        { label: 'New Password', ph: '••••••••' },
        { label: 'Confirm New Password', ph: '••••••••' },
      ].map(({ label, ph }) => (
        <div key={label}>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
          <input type="password" placeholder={ph} className="input-dark w-full px-3 py-2.5 rounded-lg text-sm" />
        </div>
      ))}
      <button className="btn-primary px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 mt-2">
        <Shield size={14} /> Update Password
      </button>
      <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Two-Factor Authentication</h4>
        <div className="flex items-center justify-between p-4 glass rounded-xl">
          <div>
            <p className="text-sm font-medium">Authenticator App</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Use an app like Google Authenticator</p>
          </div>
          <button className="btn-ghost px-4 py-2 rounded-lg text-xs font-medium">Enable</button>
        </div>
      </div>
    </div>
  );
}

const tabContent: Record<string, React.ReactNode> = {
  business: <BusinessTab />,
  notifications: <NotificationsTab />,
  billing: <BillingTab />,
  security: <SecurityTab />,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business');

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="p-6">
      <div className="max-w-3xl">
        {/* Tab nav */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium transition-all-smooth', activeTab === id ? 'text-white' : 'hover:text-white')}
              style={activeTab === id ? { background: 'var(--gradient-1)', color: 'white' } : { color: 'var(--text-muted)' }}>
              <Icon size={13} /><span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="glass rounded-2xl p-6">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {tabContent[activeTab]}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
