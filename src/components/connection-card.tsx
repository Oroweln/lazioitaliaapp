import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Primary, Spacing } from '@/constants/theme';
import { avatarColor } from '@/utils/colors';
import { useTheme } from '@/hooks/use-theme';
import type { Connection } from '@/data/mock';

interface Props {
  connection: Connection;
  onPress: () => void;
  onMessage?: () => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_admin: { label: 'Pending Review', color: '#F59E0B' },
  pending_business: { label: 'Pending', color: '#3B82F6' },
  approved: { label: 'Connected', color: '#10B981' },
  rejected: { label: 'Declined', color: '#EF4444' },
};

export function ConnectionCard({ connection, onPress, onMessage }: Props) {
  const theme = useTheme();
  const bg = avatarColor(connection.business.name);
  const status = STATUS_LABELS[connection.status] ?? { label: connection.status, color: '#6B7280' };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.backgroundElement }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.avatar, { backgroundColor: bg }]}>
        <Text style={styles.avatarText}>{connection.business.name.charAt(0)}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {connection.business.name}
          </Text>
          <View style={[styles.badge, { backgroundColor: status.color + '20' }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <Text style={[styles.direction, { color: theme.textSecondary }]}>
          {connection.direction === 'sent' ? '↑ Sent' : '↓ Received'}
        </Text>
        {connection.message ? (
          <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={1}>
            "{connection.message}"
          </Text>
        ) : null}
        {onMessage && (
          <TouchableOpacity
            style={[styles.messageBtn, { borderColor: Primary }]}
            onPress={onMessage}
          >
            <Text style={[styles.messageBtnText, { color: Primary }]}>Message</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: Spacing.four,
    marginHorizontal: Spacing.three, marginBottom: Spacing.two,
    borderRadius: 14,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.three,
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  info: { flex: 1 },
  topRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 4,
  },
  name: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: Spacing.two },
  badge: { paddingHorizontal: Spacing.two, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  direction: { fontSize: 12, marginBottom: 4 },
  message: { fontSize: 13, fontStyle: 'italic', marginBottom: Spacing.two },
  messageBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three, paddingVertical: Spacing.one + 2,
    borderRadius: 8, borderWidth: 1,
  },
  messageBtnText: { fontSize: 13, fontWeight: '600' },
});
