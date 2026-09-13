import { Pressable, StyleSheet, Text, View } from 'react-native';

import { C, Radius } from '@/constants/theme';

type Props<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
};

export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.wrap}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.item, active && styles.active]}>
            <Text style={[styles.text, { color: active ? C.onGold : C.textDim }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}>
      <Text style={[styles.chipText, { color: active ? C.onGold : C.textDim }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: C.borderGold,
    backgroundColor: C.glass,
    padding: 4,
  },
  item: { flex: 1, paddingVertical: 9, borderRadius: Radius.pill, alignItems: 'center' },
  active: { backgroundColor: C.accentLight },
  text: { fontSize: 12, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill, borderWidth: 1 },
  chipIdle: { borderColor: 'rgba(194,142,26,0.3)', backgroundColor: C.glass },
  chipActive: { borderColor: C.accentLight, backgroundColor: C.accentLight },
  chipText: { fontSize: 11, fontWeight: '600', letterSpacing: 1.1, textTransform: 'uppercase' },
});
