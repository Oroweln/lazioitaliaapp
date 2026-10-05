import { Pressable, StyleSheet, Text, View } from 'react-native';

import { metal } from '@/components/ui/metal';
import { C, Font, Radius } from '@/constants/theme';

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
            <Text style={[styles.text, { color: active ? C.onInk : C.textDim }]}>{o.label}</Text>
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
      style={[styles.chip, active ? [styles.chipActive, metal('red')] : styles.chipIdle]}>
      <Text style={[styles.chipText, { color: active ? C.onAccent : C.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Teal track with a teal pill for the active segment (the website's sticky section bar).
  wrap: {
    flexDirection: 'row',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    padding: 4,
  },
  item: { flex: 1, paddingVertical: 9, borderRadius: Radius.pill, alignItems: 'center' },
  active: { backgroundColor: C.ink },
  text: { fontFamily: Font.bold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill, borderWidth: 1 },
  chipIdle: { borderColor: C.border, backgroundColor: C.surface },
  chipActive: { borderColor: C.accent },
  chipText: { fontFamily: Font.bold, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' },
});
