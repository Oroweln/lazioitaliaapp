const baseUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:4000').replace(/\/+$/, '');

export const APP_KEY = process.env.EXPO_PUBLIC_APP_KEY ?? 'zoemilano';
export const API_BASE = `${baseUrl}/api/v2`;
export const WS_URL = `${API_BASE.replace(/^http/, 'ws')}/ws`;

/// Logos come back as server paths (`/api/v2/media/<file>`), not absolute URLs.
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}
