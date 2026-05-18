'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Mountain } from 'lucide-react';

const authImage =
  'https://images.unsplash.com/photo-1768738436372-8480c22b133e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3ODIzNDN8MHwxfHNlYXJjaHwxfHxOZXBhbCUyMGxvZGdlJTIwbW91bnRhaW4lMjBob3NwaXRhbGl0eSUyMHRyYXZlbCUyMGJvb2tpbmd8ZW58MHx8fHwxNzY2MDYwNzAyfDA&ixlib=rb-4.1.0&q=85';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('arjun@himalayahaven.com');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    router.push('/dashboard');
  };

  return (
    <main className="grid min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)] lg:grid-cols-[1fr_0.95fr]">
      <section className="relative hidden overflow-hidden lg:block">
        <Image
          src={authImage}
          alt="Mountain lodge used by RhinoPeak Connect customers"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(20%_0.035_230/.28),oklch(20%_0.035_230/.84))]" />
        <div className="absolute bottom-10 left-10 right-10 text-[var(--text-on-image)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[oklch(86%_0.09_160)]">Operator workspace</p>
          <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-tight tracking-[-0.04em]">
            Every booking, guest, and payment in one place.
          </h1>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-md">
          <Link href="/" className="mb-10 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)]">
              <Mountain size={19} />
            </span>
            <span className="text-sm font-semibold">RhinoPeak Connect</span>
          </Link>

          <div>
            <p className="text-sm font-semibold text-[var(--accent)]">Welcome back</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Log in to your workspace</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Use the demo account to review the booking dashboard, CRM, payment tracker, and public booking link.
            </p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark w-full rounded-xl py-3 pl-10 pr-4 text-sm"
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Password</label>
                <button type="button" className="text-sm font-semibold text-[var(--accent)]">Reset password</button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark w-full rounded-xl py-3 pl-10 pr-11 text-sm"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold">
              {loading ? 'Opening workspace...' : <>Log in <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-7 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-secondary)]">
            Demo credentials are pre-filled. In production this flow should connect to tenant-aware authentication before dashboard access.
          </div>

          <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            New to RhinoPeak Connect?{' '}
            <Link href="/register" className="font-semibold text-[var(--accent)]">Create an account</Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
}
