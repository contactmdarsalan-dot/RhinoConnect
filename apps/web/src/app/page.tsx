'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  MessageSquareText,
  Mountain,
  Users,
} from 'lucide-react';

const heroImage =
  'https://images.unsplash.com/photo-1768738436372-8480c22b133e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3ODIzNDN8MHwxfHNlYXJjaHwxfHxOZXBhbCUyMGxvZGdlJTIwbW91bnRhaW4lMjBob3NwaXRhbGl0eSUyMHRyYXZlbCUyMGJvb2tpbmd8ZW58MHx8fHwxNzY2MDYwNzAyfDA&ixlib=rb-4.1.0&q=85';

const workflow = [
  { label: 'Capture bookings', detail: 'A shareable booking page replaces scattered WhatsApp and Facebook requests.', icon: CalendarCheck },
  { label: 'Know every guest', detail: 'Customer history, spend, notes, and repeat visits stay attached to each booking.', icon: Users },
  { label: 'Track money clearly', detail: 'Deposits, pending balances, invoice numbers, and payment methods stay visible.', icon: CreditCard },
  { label: 'Follow up on time', detail: 'Confirmation and reminder queues prepare email and WhatsApp updates.', icon: MessageSquareText },
];

const productStats = [
  { label: 'MVP workflows', value: '6' },
  { label: 'Booking link', value: 'Live' },
  { label: 'Storage', value: 'Persistent' },
];

const pricing = [
  {
    name: 'Free',
    price: 'Rs. 0',
    detail: 'For one small business testing online bookings.',
    features: ['Limited monthly bookings', 'Single staff account', 'RhinoPeak branding', 'Basic dashboard'],
  },
  {
    name: 'Pro',
    price: 'Rs. 2,999',
    detail: 'For operators who manage bookings every day.',
    features: ['Unlimited bookings', 'Custom booking page', 'Payment tracking', 'Automation queue', 'Advanced analytics'],
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)]">
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-[var(--border-subtle)] bg-[color-mix(in_oklch,var(--surface-page)_88%,transparent)] backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="RhinoPeak Connect home">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)]">
              <Mountain size={18} />
            </span>
            <span className="text-sm font-semibold tracking-tight">RhinoPeak Connect</span>
          </Link>
          <div className="hidden items-center gap-7 text-sm font-medium text-[var(--text-secondary)] md:flex">
            <a href="#workflow">Workflow</a>
            <a href="#platform">Platform</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] sm:inline-flex">
              Log in
            </Link>
            <Link href="/register" className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-contrast)] transition hover:bg-[var(--accent-strong)]">
              Start free
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative min-h-[100svh] overflow-hidden pt-16">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="A Himalayan lodge in a mountain valley, suitable for hospitality booking software"
            fill
            priority
            sizes="100vw"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(20%_0.035_230/.92)_0%,oklch(20%_0.035_230/.74)_42%,oklch(20%_0.035_230/.24)_100%)]" />
        </div>
        <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl items-center px-5 py-20 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl text-[var(--text-on-image)]"
          >
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-[oklch(86%_0.09_160)]">
              Booking CRM for Nepal tourism
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-7xl lg:text-8xl">
              Run every guest journey from one booking desk.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[oklch(92%_0.01_230/.82)] sm:text-lg">
              RhinoPeak Connect gives hotels, homestays, trekking companies, and service operators a professional booking link, CRM, payment tracker, and business dashboard.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-warm)] px-5 py-3 text-sm font-bold text-[var(--text-primary)] transition hover:brightness-95">
                Create account <ArrowRight size={16} />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[oklch(94%_0.02_230/.28)] px-5 py-3 text-sm font-bold text-[var(--text-on-image)] transition hover:bg-[oklch(98%_0.01_230/.1)]">
                View live dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="workflow" className="px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Daily workflow</p>
              <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
                Built around the way operators actually work.
              </h2>
              <p className="mt-5 max-w-lg leading-7 text-[var(--text-secondary)]">
                Keep the simple habits that work, then move the important data into a system that can scale with bookings, staff, and repeat customers.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {workflow.map(({ label, detail, icon: Icon }) => (
                <div key={label} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-5">
                  <Icon size={20} className="text-[var(--accent)]" />
                  <h3 className="mt-5 text-base font-semibold">{label}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="border-y border-[var(--border-subtle)] bg-[var(--surface-muted)] px-5 py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
              <div>
                <p className="text-sm font-semibold">Himalaya Haven Lodge</p>
                <p className="text-xs text-[var(--text-muted)]">Today, May 18</p>
              </div>
              <span className="rounded-full bg-[var(--success-bg)] px-3 py-1 text-xs font-semibold text-[var(--success-text)]">Pro plan</span>
            </div>
            <div className="grid gap-px bg-[var(--border-subtle)] sm:grid-cols-3">
              {productStats.map((stat) => (
                <div key={stat.label} className="bg-[var(--surface-raised)] p-5">
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Booking intake</h3>
                <BarChart3 size={18} className="text-[var(--accent)]" />
              </div>
              <div className="mt-5 space-y-3">
                {['Everest Base Camp Trek', 'Family Suite', 'Yoga & Wellness Retreat'].map((item, index) => (
                  <div key={item} className="flex items-center justify-between rounded-lg bg-[var(--surface-muted)] px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{item}</p>
                      <p className="text-xs text-[var(--text-muted)]">{index === 0 ? 'Pending deposit' : 'Confirmed'}</p>
                    </div>
                    <CheckCircle2 size={16} className={index === 0 ? 'text-[var(--warning-text)]' : 'text-[var(--success-text)]'} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Platform thinking</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              From service projects to recurring SaaS revenue.
            </h2>
            <p className="mt-5 leading-7 text-[var(--text-secondary)]">
              The product is designed for subscription growth: businesses share their booking page, use the dashboard daily, and upgrade as automations and staff workflows become essential.
            </p>
            <div className="mt-8 space-y-4">
              {['Vertical SaaS for tourism and hospitality', 'Public booking links that spread naturally', 'Backend ready to move from JSON to PostgreSQL'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 size={17} className="text-[var(--success-text)]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Pricing</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Start small, upgrade when bookings become daily work.</h2>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {pricing.map((plan) => (
              <div key={plan.name} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-6 shadow-[var(--shadow-soft)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{plan.detail}</p>
                  </div>
                  <p className="text-2xl font-semibold">{plan.price}</p>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <CheckCircle2 size={15} className="text-[var(--success-text)]" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-2xl bg-[var(--text-primary)] p-7 text-[var(--surface-page)] sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold">Ready to turn booking chaos into a product?</h2>
              <p className="mt-2 text-sm text-[oklch(92%_0.01_230/.72)]">Create a demo account and open the operator dashboard in under a minute.</p>
            </div>
            <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-warm)] px-5 py-3 text-sm font-bold text-[var(--text-primary)]">
              Start free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
