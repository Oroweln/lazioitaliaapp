import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { C, Radius } from '@/constants/theme';

type Props = {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress: () => void;
  tone?: 'default' | 'danger';
};

export function ListRow({ icon, title, subtitle, onPress, tone = 'default' }: Props) {
  const color = tone === 'danger' ? C.danger : C.accent;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      android_ripple={{ color: C.accentDim }}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: C.accentDim }]}>
      <View style={[styles.iconWrap, tone === 'danger' && { borderColor: C.danger }]}>
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
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 15, color: C.text },
  subtitle: { fontSize: 12, color: C.textMuted },
});
