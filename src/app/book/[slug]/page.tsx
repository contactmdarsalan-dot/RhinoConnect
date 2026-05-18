'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  Film,
  Image as ImageIcon,
  Mail,
  MapPin,
  Maximize2,
  Phone,
  PlayCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import type { Booking, BusinessProfile, ServiceMedia, ServiceOffering } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';

type PublicBusinessPayload = {
  business: Pick<
    BusinessProfile,
    'slug' | 'name' | 'type' | 'phone' | 'website' | 'address' | 'description' | 'currency' | 'branding'
  >;
  services: ServiceOffering[];
};

type ApiEnvelope<T> = { data: T } | { error: { message: string } };

const bookingHeroImage =
  'https://images.unsplash.com/photo-1768738436372-8480c22b133e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3ODIzNDN8MHwxfHNlYXJjaHwxfHxOZXBhbCUyMGxvZGdlJTIwbW91bnRhaW4lMjBob3NwaXRhbGl0eSUyMHRyYXZlbCUyMGJvb2tpbmd8ZW58MHx8fHwxNzY2MDYwNzAyfDA&ixlib=rb-4.1.0&q=85';

const fallbackServices = ['hotel', 'homestay', 'event'];

async function apiFetch<T>(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || 'error' in payload) {
    throw new Error('error' in payload ? payload.error.message : 'Request failed');
  }
  return payload.data;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateValue: string, days: number) {
  const date = dateValue ? new Date(dateValue) : new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function MediaFrame({
  media,
  compact = false,
  contain = false,
}: {
  media: ServiceMedia;
  compact?: boolean;
  contain?: boolean;
}) {
  const frameClass = contain ? 'h-full min-h-[58svh]' : compact ? 'aspect-[16/10]' : media.type === 'image' ? 'aspect-[4/3]' : 'aspect-video';

  if (media.type === 'image') {
    return (
      <div
        role="img"
        aria-label={media.title}
        className={cn(frameClass, 'bg-[var(--surface-muted)]')}
        style={{
          backgroundImage: `url(${media.url})`,
          backgroundSize: contain ? 'contain' : 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
    );
  }

  if (isDirectVideo(media.url)) {
    return (
      <video
        src={media.url}
        controls
        preload="metadata"
        className={cn(frameClass, 'h-full w-full bg-[var(--surface-muted)]', contain ? 'object-contain' : 'object-cover')}
      />
    );
  }

  return (
    <iframe
      src={media.url}
      title={media.title}
      loading="lazy"
      className={cn(frameClass, 'h-full w-full bg-[var(--surface-muted)]')}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}

function FullMediaPreview({
  media,
  gallery,
  serviceName,
  onClose,
  onSelect,
}: {
  media: ServiceMedia;
  gallery: ServiceMedia[];
  serviceName: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const currentIndex = Math.max(0, gallery.findIndex((item) => item.id === media.id));
  const canMove = gallery.length > 1;
  const move = (direction: -1 | 1) => {
    if (!canMove) return;
    const nextIndex = (currentIndex + direction + gallery.length) % gallery.length;
    onSelect(gallery[nextIndex].id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-[oklch(12%_0.03_224/.92)] p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${media.title}`}
    >
      <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-[oklch(94%_0.02_230/.2)] bg-[oklch(18%_0.03_224)] shadow-[0_32px_100px_oklch(5%_0.02_224/.5)]">
        <div className="flex items-center justify-between gap-3 border-b border-[oklch(94%_0.02_230/.14)] px-4 py-3 text-[var(--text-on-image)] sm:px-5">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{media.title}</p>
            <p className="mt-0.5 truncate text-xs text-[oklch(88%_0.012_224/.76)]">
              {serviceName} - {currentIndex + 1} of {gallery.length}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[oklch(94%_0.02_230/.18)] bg-[oklch(96%_0.01_82/.08)] text-[var(--text-on-image)] transition hover:bg-[oklch(96%_0.01_82/.16)]"
            aria-label="Close preview"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 bg-[oklch(10%_0.024_224)]">
          <MediaFrame media={media} contain />
          {canMove && (
            <>
              <button
                type="button"
                onClick={() => move(-1)}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[oklch(94%_0.02_230/.18)] bg-[oklch(12%_0.03_224/.62)] text-[var(--text-on-image)] backdrop-blur transition hover:bg-[oklch(20%_0.03_224/.78)]"
                aria-label="Previous media"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[oklch(94%_0.02_230/.18)] bg-[oklch(12%_0.03_224/.62)] text-[var(--text-on-image)] backdrop-blur transition hover:bg-[oklch(20%_0.03_224/.78)]"
                aria-label="Next media"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        <div className="grid gap-4 border-t border-[oklch(94%_0.02_230/.14)] px-4 py-4 text-[var(--text-on-image)] sm:grid-cols-[1fr_auto] sm:px-5">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[oklch(88%_0.09_184)]">
              {media.type === 'image' ? <ImageIcon size={14} /> : <Film size={14} />}
              {media.type}
            </p>
            {media.description && <p className="mt-2 max-w-3xl text-sm leading-6 text-[oklch(92%_0.012_224/.8)]">{media.description}</p>}
          </div>
          {canMove && (
            <div className="flex gap-2 overflow-x-auto sm:max-w-sm">
              {gallery.map((item) => {
                const preview = item.type === 'image' ? item.url : item.thumbnailUrl;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      'relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border bg-[oklch(25%_0.03_224)]',
                      item.id === media.id ? 'border-[oklch(74%_0.1_184)]' : 'border-[oklch(94%_0.02_230/.16)]'
                    )}
                    aria-label={`Preview ${item.title}`}
                  >
                    {preview && (
                      <span
                        className="absolute inset-0"
                        style={{ backgroundImage: `url(${preview})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      />
                    )}
                    {item.type === 'video' && (
                      <span className="absolute inset-0 flex items-center justify-center bg-[oklch(10%_0.02_224/.32)] text-white">
                        <PlayCircle size={18} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function PublicBookingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [payload, setPayload] = useState<PublicBusinessPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');
  const [formMediaId, setFormMediaId] = useState('');
  const [previewMediaId, setPreviewMediaId] = useState('');
  const [form, setForm] = useState({
    serviceId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    country: '',
    checkIn: '',
    checkOut: '',
    guests: '1',
    notes: '',
  });

  useEffect(() => {
    async function load() {
      try {
        const nextPayload = await apiFetch<PublicBusinessPayload>(`/api/public/business/${slug}`);
        setPayload(nextPayload);
        setForm((prev) => ({ ...prev, serviceId: nextPayload.services[0]?.id ?? '' }));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load booking page');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [slug]);

  useEffect(() => {
    if (!previewMediaId) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewMediaId('');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewMediaId]);

  const selectedService = useMemo(
    () => payload?.services.find((service) => service.id === form.serviceId),
    [form.serviceId, payload?.services]
  );

  const tripNights = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return 1;
    const start = new Date(form.checkIn);
    const end = new Date(form.checkOut);
    if (end <= start) return 1;
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  }, [form.checkIn, form.checkOut]);

  const estimatedAmount = useMemo(() => {
    if (!selectedService) return 0;
    const guests = Math.max(1, Number(form.guests) || 1);
    const duration = fallbackServices.includes(selectedService.type) ? tripNights : 1;
    return selectedService.basePrice * guests * duration;
  }, [form.guests, selectedService, tripNights]);

  const depositAmount = selectedService ? Math.round((estimatedAmount * selectedService.depositPercent) / 100) : 0;
  const serviceGallery = selectedService?.gallery ?? [];
  const selectedFormMedia = serviceGallery.find((media) => media.id === formMediaId) ?? serviceGallery[0];
  const previewMedia = serviceGallery.find((media) => media.id === previewMediaId);
  const visibleGallery =
    mediaFilter === 'all' ? serviceGallery : serviceGallery.filter((media) => media.type === mediaFilter);
  const galleryCounts = serviceGallery.reduce(
    (total, media) => {
      total[media.type] += 1;
      return total;
    },
    { image: 0, video: 0 }
  );

  const setField = (key: keyof typeof form, value: string) => {
    if (key === 'serviceId') {
      setMediaFilter('all');
      setFormMediaId('');
      setPreviewMediaId('');
    }
    setForm((prev) => {
      if (key === 'checkIn') {
        const nextCheckOut = !prev.checkOut || new Date(prev.checkOut) <= new Date(value) ? addDays(value, 1) : prev.checkOut;
        return { ...prev, checkIn: value, checkOut: nextCheckOut };
      }
      return { ...prev, [key]: value };
    });
  };

  const openPreview = (mediaId: string) => {
    setPreviewMediaId(mediaId);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setSubmitting(true);
    setError('');
    try {
      const result = await apiFetch<{ booking: Booking }>('/api/public/bookings', {
        method: 'POST',
        body: JSON.stringify({
          businessSlug: slug,
          ...form,
          service: selectedService.name,
          serviceType: selectedService.type,
          amount: estimatedAmount,
          paymentMethod: 'Pending',
        }),
      });
      setConfirmedBooking(result.booking);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not submit booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-page)]">
        <div className="space-y-3">
          <div className="shimmer h-12 w-64 rounded-xl" />
          <div className="shimmer h-4 w-44 rounded-full" />
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-page)] p-6">
        <div className="max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-6 text-center shadow-[var(--shadow-soft)]">
          <p className="font-semibold">Booking page unavailable</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  if (confirmedBooking) {
    return (
      <main className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)]">
        <section className="mx-auto flex min-h-screen max-w-3xl items-center px-5 py-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-8 text-center shadow-[var(--shadow-soft)]"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--success-bg)] text-[var(--success-text)]">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Request received</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">Your booking request is with {payload.business.name}.</h1>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-[var(--text-secondary)]">
              Your reference is {confirmedBooking.bookingRef}. The team will confirm availability, deposit details, and any special requirements soon.
            </p>
            <div className="mt-8 grid gap-3 rounded-2xl bg-[var(--surface-muted)] p-4 text-left sm:grid-cols-3">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Service</p>
                <p className="mt-1 text-sm font-semibold">{confirmedBooking.service}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Dates</p>
                <p className="mt-1 text-sm font-semibold">{confirmedBooking.checkIn} to {confirmedBooking.checkOut}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Estimated total</p>
                <p className="mt-1 text-sm font-semibold">{formatCurrency(confirmedBooking.amount)}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setConfirmedBooking(null);
                setError('');
              }}
              className="btn-primary mt-8 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
            >
              Make another request <ArrowRight size={16} />
            </button>
          </motion.div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[color-mix(in_oklch,var(--surface-page)_90%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <div>
            <p className="text-sm font-semibold">{payload.business.name}</p>
            <p className="hidden text-xs text-[var(--text-muted)] sm:block">{payload.business.address}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={`tel:${payload.business.phone}`} className="hidden rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-muted)] sm:inline-flex">
              Call
            </a>
            <a href="#booking-form" className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[var(--accent-contrast)] transition hover:bg-[var(--accent-strong)]">
              Request booking
            </a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={bookingHeroImage}
            alt="A Himalayan lodge in a mountain valley"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(20%_0.035_230/.88)_0%,oklch(20%_0.035_230/.68)_46%,oklch(20%_0.035_230/.18)_100%)]" />
        </div>
        <div className="relative mx-auto grid min-h-[56svh] max-w-7xl items-end gap-8 px-5 py-14 lg:grid-cols-[1fr_390px] lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl pb-4 text-[var(--text-on-image)]"
          >
            <p className="mb-4 inline-flex rounded-full border border-[oklch(94%_0.02_230/.28)] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[oklch(88%_0.1_160)]">
              Book direct
            </p>
            <h1 className="text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-7xl">
              Stay, trek, or retreat with {payload.business.name}.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[oklch(94%_0.01_230/.84)]">
              {payload.business.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm text-[oklch(94%_0.01_230/.82)]">
              <span className="inline-flex items-center gap-2"><MapPin size={16} />{payload.business.address}</span>
              <span className="inline-flex items-center gap-2"><Phone size={16} />{payload.business.phone}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="hidden rounded-2xl border border-[oklch(94%_0.02_230/.24)] bg-[oklch(98%_0.006_82/.94)] p-5 shadow-[0_24px_70px_oklch(12%_0.03_224/.28)] backdrop-blur lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--success-bg)] text-[var(--success-text)]">
                <ShieldCheck size={21} />
              </div>
              <div>
                <p className="font-semibold">Secure booking request</p>
                <p className="text-xs text-[var(--text-muted)]">No payment charged at submission</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { label: 'Services', value: payload.services.length },
                { label: 'Response', value: '24h' },
                { label: 'Deposit', value: 'After confirmation' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-[var(--surface-muted)] p-3">
                  <p className="text-sm font-bold">{item.value}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-[var(--border-subtle)] bg-[var(--surface-raised)] px-5 py-5 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
          {[
            { title: 'Choose your service', detail: 'Room, trek, tour, retreat, or package.', icon: Sparkles },
            { title: 'Share travel details', detail: 'Dates, guests, country, and contact info.', icon: Calendar },
            { title: 'Get confirmation', detail: 'The team replies with availability and deposit details.', icon: Clock3 },
          ].map(({ title, detail, icon: Icon }, index) => (
            <div key={title} className="flex items-center gap-4 rounded-xl bg-[var(--surface-muted)] p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-raised)] text-[var(--accent)]">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">{index + 1}. {title}</p>
                <p className="text-xs text-[var(--text-secondary)]">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_430px] lg:px-8 lg:py-14">
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-[var(--accent)]">Available services</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Pick what you want to book.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--text-secondary)]">
              Prices are estimates. Final availability, deposit, and special requests are confirmed by the operator.
            </p>
          </div>

          <div className="grid gap-3">
            {payload.services.map((service) => {
              const selected = form.serviceId === service.id;
              return (
                <button
                  key={service.id}
                  onClick={() => setField('serviceId', service.id)}
                  className="group rounded-2xl border bg-[var(--surface-raised)] p-4 text-left shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] sm:p-5"
                  style={{ borderColor: selected ? 'var(--accent)' : 'var(--border-subtle)' }}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                      <span
                        className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                        style={{ borderColor: selected ? 'var(--accent)' : 'var(--border-strong)' }}
                      >
                        {selected && <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold">{service.name}</h3>
                          {selected && (
                            <span className="rounded-full bg-[var(--info-bg)] px-2.5 py-1 text-xs font-bold text-[var(--info-text)]">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{service.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
                          <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1">Capacity {service.capacity}</span>
                          <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1">Deposit {service.depositPercent}%</span>
                          <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 capitalize">{service.type}</span>
                          {service.gallery.length > 0 && (
                            <span className="rounded-full bg-[var(--info-bg)] px-3 py-1 font-semibold text-[var(--info-text)]">
                              {service.gallery.length} media
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-lg font-bold">{formatCurrency(service.basePrice)}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">base price</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside id="booking-form" className="lg:sticky lg:top-24 lg:h-fit">
          <form onSubmit={submit} className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--accent)]">Booking request</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">Send your trip details</h2>
              </div>
              <div className="rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-right">
                <p className="text-xs text-[var(--text-muted)]">Total</p>
                <p className="text-sm font-bold">{formatCurrency(estimatedAmount)}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[var(--surface-muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Selected service</p>
              <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{selectedService?.name ?? 'Choose a service'}</p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {selectedService ? `${selectedService.capacity} capacity, ${selectedService.depositPercent}% deposit` : 'Select from the services list'}
                  </p>
                  {serviceGallery.length > 0 && (
                    <a href="#service-media" className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
                      <PlayCircle size={13} /> Open full gallery
                    </a>
                  )}
                </div>
                <p className="text-sm font-bold">{selectedService ? formatCurrency(selectedService.basePrice) : '-'}</p>
              </div>
              <select
                value={form.serviceId}
                onChange={(e) => setField('serviceId', e.target.value)}
                className="input-dark mt-4 w-full rounded-xl px-3 py-3 text-sm"
                required
              >
                {payload.services.map((service) => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>

              {selectedFormMedia && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)]">
                  <div className="relative">
                    <MediaFrame media={selectedFormMedia} compact />
                    <button
                      type="button"
                      onClick={() => openPreview(selectedFormMedia.id)}
                      className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-[oklch(96%_0.01_82/.28)] bg-[oklch(12%_0.03_224/.62)] px-3 py-1.5 text-xs font-bold text-white backdrop-blur transition hover:bg-[oklch(12%_0.03_224/.78)]"
                      aria-label={`Open full preview for ${selectedFormMedia.title}`}
                    >
                      <Maximize2 size={13} /> Full preview
                    </button>
                  </div>
                  <div className="p-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--accent)]">
                        {selectedFormMedia.type === 'image' ? <ImageIcon size={16} /> : <Film size={16} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{selectedFormMedia.title}</p>
                        {selectedFormMedia.description && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]">
                            {selectedFormMedia.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {serviceGallery.length > 1 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {serviceGallery.map((media, index) => {
                          const preview = media.type === 'image' ? media.url : media.thumbnailUrl;
                          const selected = selectedFormMedia.id === media.id;
                          return (
                            <button
                              key={media.id}
                              type="button"
                              onClick={() => setFormMediaId(media.id)}
                              className={cn(
                                'relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border bg-[var(--surface-muted)] transition',
                                selected ? 'border-[var(--accent)] ring-2 ring-[oklch(44%_0.11_184/.18)]' : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                              )}
                              aria-label={`Show ${media.title}`}
                            >
                              {preview ? (
                                <span
                                  className="absolute inset-0"
                                  style={{ backgroundImage: `url(${preview})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                />
                              ) : (
                                <span className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)]">
                                  {media.type === 'image' ? <ImageIcon size={16} /> : <Film size={16} />}
                                </span>
                              )}
                              {media.type === 'video' && (
                                <span className="absolute inset-0 flex items-center justify-center bg-[oklch(20%_0.035_230/.26)] text-white">
                                  <PlayCircle size={18} />
                                </span>
                              )}
                              <span className="absolute bottom-1 right-1 rounded-full bg-[oklch(18%_0.025_230/.72)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                {index + 1}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Check-in</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="date"
                    min={today()}
                    value={form.checkIn}
                    onChange={(e) => setField('checkIn', e.target.value)}
                    className="input-dark w-full rounded-xl py-3 pl-10 pr-3 text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Check-out</label>
                <input
                  type="date"
                  min={form.checkIn ? addDays(form.checkIn, 1) : today()}
                  value={form.checkOut}
                  onChange={(e) => setField('checkOut', e.target.value)}
                  className="input-dark w-full rounded-xl px-3 py-3 text-sm"
                  required
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Guests</label>
                <div className="relative">
                  <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="number"
                    min="1"
                    value={form.guests}
                    onChange={(e) => setField('guests', e.target.value)}
                    className="input-dark w-full rounded-xl py-3 pl-10 pr-3 text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Country</label>
                <input
                  value={form.country}
                  onChange={(e) => setField('country', e.target.value)}
                  placeholder="Nepal"
                  className="input-dark w-full rounded-xl px-3 py-3 text-sm"
                  required
                />
              </div>
            </div>

            <div className="mt-5 border-t border-[var(--border-subtle)] pt-5">
              <p className="mb-4 text-sm font-semibold">Contact details</p>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Full name</label>
                  <input
                    value={form.customerName}
                    onChange={(e) => setField('customerName', e.target.value)}
                    placeholder="Your full name"
                    className="input-dark w-full rounded-xl px-3 py-3 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) => setField('customerEmail', e.target.value)}
                      placeholder="you@example.com"
                      className="input-dark w-full rounded-xl py-3 pl-10 pr-3 text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Phone</label>
                  <input
                    value={form.customerPhone}
                    onChange={(e) => setField('customerPhone', e.target.value)}
                    placeholder="+977 9800000000"
                    className="input-dark w-full rounded-xl px-3 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Special requests</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setField('notes', e.target.value)}
                    placeholder="Arrival time, pickup, dietary needs, guide requests..."
                    className="input-dark w-full resize-none rounded-xl px-3 py-3 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">{tripNights} {tripNights === 1 ? 'night' : 'nights'} x {Math.max(1, Number(form.guests) || 1)} guest</span>
                <span className="font-semibold">{formatCurrency(estimatedAmount)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Estimated deposit after confirmation</span>
                <span className="font-semibold">{formatCurrency(depositAmount)}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
                This is a request, not an instant charge. The operator confirms availability before payment.
              </p>
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-[var(--danger-bg)] px-3 py-2 text-sm font-medium text-[var(--danger-text)]">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold">
              {submitting ? 'Sending request...' : <><Send size={16} /> Send booking request</>}
            </button>
          </form>
        </aside>
      </section>

      <section id="service-media" className="border-t border-[var(--border-subtle)] bg-[var(--surface-raised)] px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold text-[var(--accent)]">Explore images and videos</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
                {selectedService ? selectedService.name : 'Select a service to preview'}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Photos and videos change with the service you select, so customers can review the exact room, trek, tour, or retreat before sending a request.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: `All ${serviceGallery.length}` },
                { key: 'image', label: `Images ${galleryCounts.image}` },
                { key: 'video', label: `Videos ${galleryCounts.video}` },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setMediaFilter(item.key as typeof mediaFilter)}
                  className={cn(
                    'rounded-xl border px-4 py-2 text-sm font-bold transition',
                    mediaFilter === item.key
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]'
                      : 'border-[var(--border-subtle)] bg-[var(--surface-page)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {visibleGallery.length > 0 ? (
            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleGallery.map((media) => (
                  <article key={media.id} className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-page)] shadow-[var(--shadow-soft)]">
                    <div className="relative">
                      <MediaFrame media={media} />
                      <button
                        type="button"
                        onClick={() => openPreview(media.id)}
                        className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-[oklch(96%_0.01_82/.28)] bg-[oklch(12%_0.03_224/.62)] px-3 py-1.5 text-xs font-bold text-white backdrop-blur transition hover:bg-[oklch(12%_0.03_224/.78)]"
                        aria-label={`Open full preview for ${media.title}`}
                      >
                        <Maximize2 size={13} /> Full preview
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--accent)]">
                          {media.type === 'image' ? <ImageIcon size={16} /> : <Film size={16} />}
                        </span>
                        <div>
                          <p className="text-sm font-bold">{media.title}</p>
                          <p className="text-xs capitalize text-[var(--text-muted)]">{media.type}</p>
                        </div>
                      </div>
                      {media.description && (
                        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{media.description}</p>
                      )}
                    </div>
                  </article>
                ))}
            </div>
          ) : (
            <div className="mt-7 rounded-3xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-page)] p-10 text-center">
              <ImageIcon size={34} className="mx-auto text-[var(--text-muted)]" />
              <p className="mt-4 font-semibold">No media added for this service yet</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Add images or videos from the dashboard Services page to improve customer confidence.</p>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {previewMedia && selectedService && (
          <FullMediaPreview
            media={previewMedia}
            gallery={serviceGallery}
            serviceName={selectedService.name}
            onClose={() => setPreviewMediaId('')}
            onSelect={setPreviewMediaId}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
