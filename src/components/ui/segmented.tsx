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
            <Text style={[styles.text, { color: active ? C.onAccent : C.textDim }]}>{o.label}</Text>
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
      <Text style={[styles.chipText, { color: active ? C.onAccent : C.textDim }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    padding: 3,
  },
  item: { flex: 1, paddingVertical: 8, borderRadius: Radius.sm, alignItems: 'center' },
  active: { backgroundColor: C.accent },
  text: { fontSize: 13, fontWeight: '600' },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.pill, borderWidth: 1 },
  chipIdle: { borderColor: C.border, backgroundColor: C.surface },
  chipActive: { borderColor: C.accent, backgroundColor: C.accent },
  chipText: { fontSize: 12, fontWeight: '600' },
});
