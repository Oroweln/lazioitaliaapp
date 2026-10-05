import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { metal } from '@/components/ui/metal';
import { C, Font, Radius } from '@/constants/theme';

type Props = {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress: () => void;
  tone?: 'default' | 'danger';
};

export function ListRow({ icon, title, subtitle, onPress, tone = 'default' }: Props) {
  const color = tone === 'danger' ? C.onAccent : C.nav;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      android_ripple={{ color: 'rgba(3,95,105,0.08)' }}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: 'rgba(3,95,105,0.06)' }]}>
      {/* Steel disc with a dark-teal icon; metal red for destructive rows. */}
      <View style={[styles.iconWrap, metal(tone === 'danger' ? 'red' : 'steel')]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.title, tone === 'danger' && { color: C.danger }]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Icon name="chevron_right" size={20} color={C.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 4, borderRadius: Radius.md },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: Font.semibold, fontSize: 15, color: C.text },
  subtitle: { fontFamily: Font.regular, fontSize: 12, color: C.textMuted },
});
