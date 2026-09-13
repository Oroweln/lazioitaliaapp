import { Alert, Linking } from 'react-native';

// Websites are written by other companies. Anything but a plain web link (intent:, sms:,
// another app's deep link) must never be handed to the OS.
export function isWebUrl(url: string | null | undefined): url is string {
  return !!url && /^https?:\/\/[^\s]+$/i.test(url.trim());
}

export function openWebsite(url: string | null | undefined) {
  if (!isWebUrl(url)) return;
  Linking.openURL(url.trim()).catch(() => Alert.alert('Unable to open link', url));
}
