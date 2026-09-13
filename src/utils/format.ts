import type { BusinessSize } from '@/api/types';

export const SIZE_LABELS: Record<BusinessSize, string> = {
  solo: 'Solo',
  small: '2–50 employees',
  medium: '51–250 employees',
  large: '250+ employees',
};

export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return clockTime(iso);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  if (now.getTime() - date.getTime() < 6 * 86400000) {
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  }
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function clockTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function displayWebsite(url: string | null | undefined) {
  return url ? url.replace(/^https?:\/\//, '').replace(/\/$/, '') : '';
}

export function normalizeWebsite(input: string) {
  const v = input.trim();
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}
