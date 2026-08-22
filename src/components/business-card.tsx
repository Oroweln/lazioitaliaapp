import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { avatarColor, INDUSTRY_COLORS } from '@/utils/colors';
import { useTheme } from '@/hooks/use-theme';
import type { Business } from '@/data/mock';

interface Props {
  business: Business;
  onPress: () => void;
}

export function BusinessCard({ business, onPress }: Props) {
  const theme = useTheme();
  const bg = avatarColor(business.name);
  const industryColor = INDUSTRY_COLORS[business.industry] ?? '#6B7280';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.backgroundElement }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.avatar, { backgroundColor: bg }]}>
        <Text style={styles.avatarText}>{business.name.charAt(0)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
          {business.name}
        </Text>
        <View style={styles.tags}>
          <View style={[styles.industryTag, { backgroundColor: industryColor + '20' }]}>
            <Text style={[styles.industryText, { color: industryColor }]}>{business.industry}</Text>
          </View>
          <Text style={[styles.location, { color: theme.textSecondary }]} numberOfLines={1}>
            📍 {business.location}
          </Text>
        </View>
      </View>
      <Text style={[styles.chevron, { color: theme.textSecondary }]}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.four, paddingVertical: Spacing.three,
    marginHorizontal: Spacing.three, marginBottom: Spacing.two,
    borderRadius: 14,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.three,
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  tags: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  industryTag: { paddingHorizontal: Spacing.two, paddingVertical: 2, borderRadius: 6 },
  industryText: { fontSize: 12, fontWeight: '600' },
  location: { fontSize: 12, flex: 1 },
  chevron: { fontSize: 22, lineHeight: 24 },
});
