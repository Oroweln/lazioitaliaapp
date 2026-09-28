import { Alert, Linking } from 'react-native';

// Websites are written by other companies. Anything but a plain web link (intent:, sms:,
// another app's deep link) must never be handed to the OS.
//
// Older rows were saved without a scheme ("company.com"), so those are treated as https
// rather than shown as dead text — only values naming another scheme are rejected.
export function toWebUrl(url: string | null | undefined): string | null {
  const raw = url?.trim();
  if (!raw || /\s/.test(raw)) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return null; // some other scheme — never open it
  if (!/^[^/]+\.[a-z]{2,}/i.test(raw)) return null; // not a domain
  return `https://${raw}`;
}

export function isWebUrl(url: string | null | undefined): boolean {
  return toWebUrl(url) !== null;
}

export function openWebsite(url: string | null | undefined) {
  const target = toWebUrl(url);
  if (!target) return;
  Linking.openURL(target).catch(() => Alert.alert('Unable to open link', target));
}
