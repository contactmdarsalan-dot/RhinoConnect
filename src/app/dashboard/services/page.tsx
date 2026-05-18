'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Film,
  Image as ImageIcon,
  Package,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn, formatCurrency } from '@/lib/utils';
import type { BusinessType, ServiceMedia, ServiceMediaType, ServiceOffering } from '@/lib/types';

type GalleryDraft = Omit<ServiceMedia, 'id'> & { id?: string };
type ServiceForm = Pick<
  ServiceOffering,
  'name' | 'type' | 'description' | 'capacity' | 'durationDays' | 'basePrice' | 'depositPercent' | 'active' | 'color'
> & {
  gallery: GalleryDraft[];
};

const serviceTypes: BusinessType[] = ['hotel', 'homestay', 'trekking', 'travel', 'cafe', 'wellness', 'event'];

const colorOptions = ['#0f766e', '#2563eb', '#16a34a', '#f59e0b', '#a855f7', '#e11d48', '#4f46e5'];

function emptyDraft(): ServiceForm {
  return {
    name: '',
    type: 'hotel',
    description: '',
    capacity: 1,
    durationDays: 1,
    basePrice: 0,
    depositPercent: 30,
    active: true,
    color: '#0f766e',
    gallery: [],
  };
}

function toDraft(service: ServiceOffering): ServiceForm {
  return {
    name: service.name,
    type: service.type,
    description: service.description,
    capacity: service.capacity,
    durationDays: service.durationDays,
    basePrice: service.basePrice,
    depositPercent: service.depositPercent,
    active: service.active,
    color: service.color,
    gallery: service.gallery.map((media) => ({ ...media })),
  };
}

function mediaCounts(service: ServiceOffering) {
  return service.gallery.reduce(
    (total, media) => {
      total[media.type] += 1;
      return total;
    },
    { image: 0, video: 0 }
  );
}

function mediaPreview(media?: ServiceMedia | GalleryDraft) {
  if (!media) return '';
  return media.type === 'image' ? media.url : media.thumbnailUrl || '';
}

function ServiceCard({
  service,
  selected,
  onClick,
}: {
  service: ServiceOffering;
  selected: boolean;
  onClick: () => void;
}) {
  const counts = mediaCounts(service);
  const preview = mediaPreview(service.gallery[0]);

  return (
    <button
      onClick={onClick}
      className={cn(
        'group grid w-full gap-4 rounded-2xl border bg-[var(--surface-raised)] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)]',
        selected && 'border-[var(--accent)]'
      )}
      style={{ borderColor: selected ? 'var(--accent)' : 'var(--border-subtle)' }}
    >
      <div className="flex items-start gap-4">
        <div
          className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-muted)]"
          style={preview ? { backgroundImage: `url(${preview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          {!preview && (
            <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
              <Package size={24} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: service.color }} />
            <h3 className="truncate text-sm font-bold">{service.name}</h3>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[11px] font-bold',
                service.active
                  ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                  : 'bg-[var(--danger-bg)] text-[var(--danger-text)]'
              )}
            >
              {service.active ? 'Active' : 'Hidden'}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">{service.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
            <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 capitalize">{service.type}</span>
            <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1">{service.capacity} capacity</span>
            <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1">{service.durationDays} day</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold">{formatCurrency(service.basePrice)}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{service.depositPercent}% deposit</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-muted)]">
        <span className="inline-flex items-center gap-1.5"><ImageIcon size={13} />{counts.image} images</span>
        <span className="inline-flex items-center gap-1.5"><Film size={13} />{counts.video} videos</span>
        <span className="inline-flex items-center gap-1.5 text-[var(--accent)]"><Pencil size={13} />Edit</span>
      </div>
    </button>
  );
}

export default function ServicesPage() {
  const { services, addService, updateService, deleteService, saving, error } = useStore();
  const [selectedId, setSelectedId] = useState<string>('new');
  const [draft, setDraft] = useState<ServiceForm>(emptyDraft);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'hidden'>('all');
  const [savedLabel, setSavedLabel] = useState('');

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedId),
    [selectedId, services]
  );
  const isCreating = selectedId === 'new';

  const filtered = services.filter((service) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      service.name.toLowerCase().includes(term) ||
      service.description.toLowerCase().includes(term) ||
      service.type.toLowerCase().includes(term);
    const matchesStatus =
      status === 'all' || (status === 'active' && service.active) || (status === 'hidden' && !service.active);
    return matchesSearch && matchesStatus;
  });

  const totals = useMemo(() => {
    const activeServices = services.filter((service) => service.active);
    const mediaTotal = services.reduce((sum, service) => sum + service.gallery.length, 0);
    const totalCapacity = activeServices.reduce((sum, service) => sum + service.capacity, 0);
    const averagePrice =
      activeServices.length > 0
        ? Math.round(activeServices.reduce((sum, service) => sum + service.basePrice, 0) / activeServices.length)
        : 0;
    return { active: activeServices.length, mediaTotal, totalCapacity, averagePrice };
  }, [services]);

  const setField = <K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSavedLabel('');
  };

  const setMedia = <K extends keyof GalleryDraft>(index: number, key: K, value: GalleryDraft[K]) => {
    setDraft((prev) => ({
      ...prev,
      gallery: prev.gallery.map((media, mediaIndex) => (mediaIndex === index ? { ...media, [key]: value } : media)),
    }));
    setSavedLabel('');
  };

  const addMedia = (type: ServiceMediaType) => {
    setDraft((prev) => ({
      ...prev,
      gallery: [
        ...prev.gallery,
        {
          type,
          title: type === 'image' ? 'New customer image' : 'New customer video',
          url: '',
          description: '',
          thumbnailUrl: '',
        },
      ],
    }));
    setSavedLabel('');
  };

  const removeMedia = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, mediaIndex) => mediaIndex !== index),
    }));
    setSavedLabel('');
  };

  const startNewService = () => {
    setSelectedId('new');
    setDraft(emptyDraft());
    setSavedLabel('');
  };

  const selectService = (service: ServiceOffering) => {
    setSelectedId(service.id);
    setDraft(toDraft(service));
    setSavedLabel('');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      ...draft,
      capacity: Number(draft.capacity),
      durationDays: Number(draft.durationDays),
      basePrice: Number(draft.basePrice),
      depositPercent: Number(draft.depositPercent),
      gallery: draft.gallery.filter((media) => media.title.trim() && media.url.trim()),
    };

    if (isCreating) {
      const service = await addService(payload);
      setSelectedId(service.id);
      setSavedLabel('Service created');
      return;
    }

    if (selectedService) {
      await updateService(selectedService.id, payload);
      setSavedLabel('Service updated');
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    const ok = window.confirm(
      `Delete ${selectedService.name}? Services with existing bookings are hidden instead of removed.`
    );
    if (!ok) return;
    await deleteService(selectedService.id);
    startNewService();
    setSavedLabel('Service removed or hidden');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Active services', value: totals.active },
          { label: 'Total capacity', value: totals.totalCapacity },
          { label: 'Average price', value: formatCurrency(totals.averagePrice) },
          { label: 'Gallery media', value: totals.mediaTotal },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4">
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <section className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search service, type, or description..."
                className="input-dark w-full rounded-xl py-3 pl-10 pr-3 text-sm"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as typeof status)}
              className="input-dark rounded-xl px-3 py-3 text-sm"
            >
              <option value="all">All services</option>
              <option value="active">Active only</option>
              <option value="hidden">Hidden only</option>
            </select>
            <button
              onClick={startNewService}
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold"
            >
              <Plus size={16} /> New Service
            </button>
          </div>

          <div className="grid gap-3">
            {filtered.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                selected={service.id === selectedId}
                onClick={() => selectService(service)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-12 text-center">
              <Package size={34} className="mx-auto text-[var(--text-muted)]" />
              <p className="mt-4 font-semibold">No services match this view</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Create a new offer or clear the current filters.</p>
            </div>
          )}
        </section>

        <aside className="xl:sticky xl:top-6 xl:h-fit">
          <form onSubmit={submit} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--accent)]">{isCreating ? 'Create service' : 'Edit service'}</p>
                <h2 className="mt-1 text-xl font-bold">{isCreating ? 'New bookable offer' : selectedService?.name}</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">This is what customers see on the booking page.</p>
              </div>
              {!isCreating && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn-ghost flex h-10 w-10 items-center justify-center rounded-xl text-[var(--danger-text)]"
                  title="Delete service"
                >
                  <Trash2 size={17} />
                </button>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Service name</label>
                <input
                  value={draft.name}
                  onChange={(event) => setField('name', event.target.value)}
                  placeholder="Everest Base Camp Trek"
                  className="input-dark w-full rounded-xl px-3 py-3 text-sm"
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Category</label>
                  <select
                    value={draft.type}
                    onChange={(event) => setField('type', event.target.value as BusinessType)}
                    className="input-dark w-full rounded-xl px-3 py-3 text-sm capitalize"
                  >
                    {serviceTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Base price</label>
                  <input
                    type="number"
                    min="0"
                    value={draft.basePrice}
                    onChange={(event) => setField('basePrice', Number(event.target.value))}
                    className="input-dark w-full rounded-xl px-3 py-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Description</label>
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(event) => setField('description', event.target.value)}
                  placeholder="What is included, who it is for, and why customers should choose it."
                  className="input-dark w-full resize-none rounded-xl px-3 py-3 text-sm"
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={draft.capacity}
                    onChange={(event) => setField('capacity', Number(event.target.value))}
                    className="input-dark w-full rounded-xl px-3 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Days</label>
                  <input
                    type="number"
                    min="1"
                    value={draft.durationDays}
                    onChange={(event) => setField('durationDays', Number(event.target.value))}
                    className="input-dark w-full rounded-xl px-3 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Deposit %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={draft.depositPercent}
                    onChange={(event) => setField('depositPercent', Number(event.target.value))}
                    className="input-dark w-full rounded-xl px-3 py-3 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--surface-muted)] p-3">
                <div>
                  <p className="text-sm font-semibold">Customer visibility</p>
                  <p className="text-xs text-[var(--text-muted)]">Hidden services stay in admin but disappear from public booking.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setField('active', !draft.active)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-bold transition',
                    draft.active
                      ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                      : 'bg-[var(--danger-bg)] text-[var(--danger-text)]'
                  )}
                >
                  {draft.active ? 'Active' : 'Hidden'}
                </button>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">Catalog color</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setField('color', color)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border transition hover:scale-105"
                      style={{ background: color, borderColor: draft.color === color ? 'var(--text-primary)' : 'transparent' }}
                      title={color}
                    >
                      {draft.color === color && <CheckCircle2 size={16} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--border-subtle)] pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Image and video gallery</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Add public media URLs customers can explore before booking.</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => addMedia('image')} className="btn-ghost inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold">
                    <ImageIcon size={14} /> Image
                  </button>
                  <button type="button" onClick={() => addMedia('video')} className="btn-ghost inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold">
                    <Film size={14} /> Video
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {draft.gallery.map((media, index) => {
                  const preview = mediaPreview(media);
                  return (
                    <div key={`${media.id ?? 'new'}-${index}`} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)] p-3">
                      <div className="flex gap-3">
                        <div
                          className="h-16 w-20 shrink-0 rounded-lg bg-[var(--surface-muted)]"
                          style={preview ? { backgroundImage: `url(${preview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                        >
                          {!preview && (
                            <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
                              {media.type === 'image' ? <ImageIcon size={18} /> : <Film size={18} />}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="grid gap-2 sm:grid-cols-[120px_1fr]">
                            <select
                              value={media.type}
                              onChange={(event) => setMedia(index, 'type', event.target.value as ServiceMediaType)}
                              className="input-dark rounded-lg px-2 py-2 text-xs"
                            >
                              <option value="image">Image</option>
                              <option value="video">Video</option>
                            </select>
                            <input
                              value={media.title}
                              onChange={(event) => setMedia(index, 'title', event.target.value)}
                              placeholder="Media title"
                              className="input-dark rounded-lg px-2 py-2 text-xs"
                            />
                          </div>
                          <input
                            value={media.url}
                            onChange={(event) => setMedia(index, 'url', event.target.value)}
                            placeholder={media.type === 'image' ? 'https://...image.jpg' : 'https://www.youtube.com/embed/...'}
                            className="input-dark w-full rounded-lg px-2 py-2 text-xs"
                          />
                          {media.type === 'video' && (
                            <input
                              value={media.thumbnailUrl ?? ''}
                              onChange={(event) => setMedia(index, 'thumbnailUrl', event.target.value)}
                              placeholder="Optional video thumbnail URL"
                              className="input-dark w-full rounded-lg px-2 py-2 text-xs"
                            />
                          )}
                          <textarea
                            rows={2}
                            value={media.description ?? ''}
                            onChange={(event) => setMedia(index, 'description', event.target.value)}
                            placeholder="Short customer-facing caption"
                            className="input-dark w-full resize-none rounded-lg px-2 py-2 text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="btn-ghost flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--danger-text)]"
                          title="Remove media"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {draft.gallery.length === 0 && (
                <div className="mt-4 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-page)] p-5 text-center">
                  <ImageIcon size={24} className="mx-auto text-[var(--text-muted)]" />
                  <p className="mt-2 text-sm font-semibold">No gallery media yet</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Add photos or videos to help customers decide faster.</p>
                </div>
              )}
            </div>

            {error && <p className="mt-4 rounded-xl bg-[var(--danger-bg)] px-3 py-2 text-sm font-medium text-[var(--danger-text)]">{error}</p>}
            {savedLabel && <p className="mt-4 rounded-xl bg-[var(--success-bg)] px-3 py-2 text-sm font-medium text-[var(--success-text)]">{savedLabel}</p>}

            <button type="submit" disabled={saving} className="btn-primary mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold">
              <Save size={16} /> {saving ? 'Saving...' : isCreating ? 'Create service' : 'Save changes'}
            </button>
          </form>
        </aside>
      </div>
    </motion.div>
  );
}
