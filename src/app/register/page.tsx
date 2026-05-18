'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, CheckCircle2, Mail, Mountain, UserRound } from 'lucide-react';

const businessTypes = ['Hotel', 'Homestay', 'Trekking company', 'Travel agency', 'Wellness center', 'Event space'];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    businessName: '',
    businessType: businessTypes[0],
    plan: 'pro',
  });

  const set = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)]">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)]">
            <Mountain size={18} />
          </span>
          <span className="text-sm font-semibold">RhinoPeak Connect</span>
        </Link>
        <Link href="/login" className="text-sm font-semibold text-[var(--accent)]">Log in</Link>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:py-20">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Start free</p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-[-0.04em]">
            Set up your booking workspace.
          </h1>
          <p className="mt-5 max-w-xl leading-7 text-[var(--text-secondary)]">
            Create the business profile first, then add services, share your booking page, and track every customer from the dashboard.
          </p>
          <div className="mt-9 space-y-4">
            {['Public booking page created for your business', 'CRM and payment tracker ready from day one', 'Upgrade path for WhatsApp, email, and team access'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 size={18} className="text-[var(--success-text)]" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          onSubmit={submit}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-6 shadow-[var(--shadow-soft)]"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Your name</label>
              <div className="relative">
                <UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input value={form.name} onChange={(e) => set('name', e.target.value)} className="input-dark w-full rounded-xl py-3 pl-10 pr-4 text-sm" required />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Work email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="input-dark w-full rounded-xl py-3 pl-10 pr-4 text-sm" required />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Business name</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input value={form.businessName} onChange={(e) => set('businessName', e.target.value)} className="input-dark w-full rounded-xl py-3 pl-10 pr-4 text-sm" required />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Business type</label>
              <select value={form.businessType} onChange={(e) => set('businessType', e.target.value)} className="input-dark w-full rounded-xl px-3 py-3 text-sm">
                {businessTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Plan</label>
              <select value={form.plan} onChange={(e) => set('plan', e.target.value)} className="input-dark w-full rounded-xl px-3 py-3 text-sm">
                <option value="pro">Pro trial</option>
                <option value="free">Free</option>
              </select>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-[var(--surface-muted)] p-4">
            <p className="text-sm font-semibold">Recommended setup</p>
            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
              Start with the Pro trial if you want unlimited demo bookings, custom branding, analytics, and automation queue access.
            </p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold">
            {loading ? 'Creating workspace...' : <>Create workspace <ArrowRight size={16} /></>}
          </button>

          <p className="mt-5 text-center text-xs leading-5 text-[var(--text-muted)]">
            By creating a workspace you agree to use RhinoPeak Connect for legitimate business bookings and customer operations.
          </p>
        </motion.form>
      </section>
    </main>
  );
}
