import { StyleSheet, Text, View } from 'react-native';

import type { Business } from '@/api/types';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Tag } from '@/components/ui/tag';
import { C, Font } from '@/constants/theme';
import { SIZE_LABELS } from '@/utils/format';

// The website's directory company card: logo in a steel frame, name in Tinos, "Town · size",
// industry pill and a teal arrow circle.
export function BusinessCard({ business, onPress }: { business: Business; onPress: () => void }) {
  const meta = [business.location, business.size ? SIZE_LABELS[business.size] : null].filter(Boolean).join(' · ');
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.top}>
        <Avatar name={business.name} size={54} logoUrl={business.logo_url} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {business.name}
          </Text>
          {meta ? (
            <View style={styles.metaRow}>
              <Icon name="location_on" size={14} color={C.accentText} />
              <Text style={styles.meta} numberOfLines={1}>
                {meta}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      {business.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {business.description}
        </Text>
      ) : null}
      <View style={styles.footer}>
        <View style={{ flex: 1 }}>{business.industry ? <Tag label={business.industry} /> : null}</View>
        <View style={styles.arrow}>
          <Icon name="chevron_right" size={20} color={C.onInk} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, padding: 18 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  info: { flex: 1, gap: 4 },
  name: { fontFamily: Font.serif, fontSize: 20, lineHeight: 23, color: C.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { flexShrink: 1, fontFamily: Font.semibold, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: C.textMuted },
  description: { fontFamily: Font.regular, fontSize: 14, lineHeight: 20, color: C.textDim },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  arrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
