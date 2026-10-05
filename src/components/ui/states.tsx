import type { ReactNode } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View, type RefreshControlProps } from 'react-native';

import { SecondaryButton } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { metal } from '@/components/ui/metal';
import { C, Font, Radius, Type } from '@/constants/theme';

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={C.text} size="large" />
    </View>
  );
}

type EmptyProps = { icon?: IconName; title: string; message?: string; action?: ReactNode; tone?: 'light' | 'ink' };

export function EmptyState({ icon = 'hourglass_empty', title, message, action, tone = 'light' }: EmptyProps) {
  const onInk = tone === 'ink';
  return (
    <View style={styles.empty}>
      {/* Steel disc with a dark-teal line icon, as on the website's cards. */}
      <View style={[styles.iconRing, metal('steel')]}>
        <Icon name={icon} size={30} color={C.nav} />
      </View>
      <Text style={[Type.heading, { textAlign: 'center' }, onInk && { color: C.onInk }]}>{title}</Text>
      {message && (
        <Text style={[Type.bodyDim, { textAlign: 'center' }, onInk && { color: C.onInkMuted }]}>{message}</Text>
      )}
      {action}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon="error"
      title="Something went wrong"
      message={message}
      action={onRetry && <SecondaryButton title="Try again" onPress={onRetry} compact icon="refresh" />}
    />
  );
}

export function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.banner}>
      <Icon name="error" size={18} color={C.danger} />
      <Text style={styles.bannerText}>{message}</Text>
    </View>
  );
}

export function AppRefreshControl(props: RefreshControlProps) {
  return (
    <RefreshControl
      colors={[C.accent]}
      progressBackgroundColor={C.surface}
      tintColor={C.text}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32, paddingVertical: 48 },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(243,238,230,0.6)',
    boxShadow: '0px 10px 24px -14px rgba(3,95,105,0.8)',
  },
  // Light panel with a red left rule (the website's notice style).
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(184,29,3,0.25)',
    borderLeftWidth: 4,
    borderLeftColor: C.danger,
    backgroundColor: C.dangerDim,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bannerText: { flex: 1, color: C.danger, fontFamily: Font.medium, fontSize: 13, lineHeight: 18 },
});
