import type { ReactNode } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View, type RefreshControlProps } from 'react-native';

import { SecondaryButton } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { C, Radius, Type } from '@/constants/theme';

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={C.accent} size="large" />
    </View>
  );
}

type EmptyProps = { icon?: IconName; title: string; message?: string; action?: ReactNode };

export function EmptyState({ icon = 'hourglass_empty', title, message, action }: EmptyProps) {
  return (
    <View style={styles.empty}>
      <View style={styles.iconRing}>
        <Icon name={icon} size={28} />
      </View>
      <Text style={[Type.heading, { textAlign: 'center' }]}>{title}</Text>
      {message && <Text style={[Type.bodyDim, { textAlign: 'center' }]}>{message}</Text>}
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
      tintColor={C.accent}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32, paddingVertical: 48 },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: C.danger,
    backgroundColor: C.dangerDim,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bannerText: { flex: 1, color: C.danger, fontSize: 13, lineHeight: 18 },
});
