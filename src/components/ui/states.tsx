import type { ReactNode } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View, type RefreshControlProps } from 'react-native';

import { OutlineButton } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { C, Type } from '@/constants/theme';

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={C.accentLight} size="large" />
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
      <Text style={[Type.heading, { textAlign: 'center', fontWeight: '300' }]}>{title}</Text>
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
      action={onRetry && <OutlineButton title="Try again" onPress={onRetry} compact icon="refresh" />}
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

export function GoldRefreshControl(props: RefreshControlProps) {
  return (
    <RefreshControl
      colors={[C.accentLight]}
      progressBackgroundColor={C.surface}
      tintColor={C.accentLight}
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
    borderColor: C.borderGold,
    backgroundColor: C.glass,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(224,82,82,0.4)',
    backgroundColor: 'rgba(224,82,82,0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bannerText: { flex: 1, color: '#f2a5a5', fontSize: 13, lineHeight: 18 },
});
