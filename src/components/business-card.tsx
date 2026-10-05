import { StyleSheet, Text, View } from 'react-native';

import type { Business } from '@/api/types';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Tag } from '@/components/ui/tag';
import { C } from '@/constants/theme';
import { SIZE_LABELS } from '@/utils/format';

export function BusinessCard({ business, onPress }: { business: Business; onPress: () => void }) {
  const meta = [business.location, business.size ? SIZE_LABELS[business.size] : null].filter(Boolean).join(' · ');
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.top}>
        <Avatar name={business.name} size={50} logoUrl={business.logo_url} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {business.name}
          </Text>
          {meta ? (
            <Text style={styles.meta} numberOfLines={1}>
              {meta}
            </Text>
          ) : null}
        </View>
        <Icon name="chevron_right" size={22} color={C.textMuted} />
      </View>
      {business.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {business.description}
        </Text>
      ) : null}
      {business.industry ? <Tag label={business.industry} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, padding: 16 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 16, fontWeight: '600', color: C.text },
  meta: { fontSize: 12, color: C.textMuted },
  description: { fontSize: 13, lineHeight: 19, color: C.textDim },
});
