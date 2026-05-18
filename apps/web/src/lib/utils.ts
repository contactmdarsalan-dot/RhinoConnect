import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'NPR'): string {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('NPR', 'Rs.');
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getDaysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function generateBookingRef(): string {
  const prefix = 'RPC';
  const num = Math.floor(Math.random() * 90000) + 10000;
  return `${prefix}-${num}`;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    confirmed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
    completed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    unpaid: 'text-red-400 bg-red-400/10 border-red-400/20',
    partial: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    paid: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    refunded: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  };
  return map[status] || 'text-slate-400 bg-slate-400/10 border-slate-400/20';
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
