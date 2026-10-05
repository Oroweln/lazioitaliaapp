import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { C, Radius, Type } from '@/constants/theme';

type Props = {
  label: string;
  value: string | null;
  options: readonly { value: string; label: string }[];
  placeholder?: string;
  onChange: (value: string | null) => void;
  allowClear?: boolean;
};

export function OptionPicker({ label, value, options, placeholder = 'Select', onChange, allowClear }: Props) {
  const [open, setOpen] = useState(false);
  // A value set elsewhere (another client, an older list) still shows instead of the placeholder.
  const allOptions = value && !options.some((o) => o.value === value) ? [{ value, label: value }, ...options] : options;
  const selected = allOptions.find((o) => o.value === value);

  const choose = (v: string | null) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <View style={{ gap: 8 }}>
      <Text style={Type.label}>{label}</Text>
      <Pressable
        style={styles.field}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}>
        <Text style={[styles.value, !selected && { color: C.textHint }]}>{selected?.label ?? placeholder}</Text>
        <Icon name="expand_more" size={20} color={C.textDim} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={[Type.heading, { marginBottom: 8 }]}>{label}</Text>
            <ScrollView style={{ maxHeight: 420 }}>
              {allowClear && (
                <Pressable style={styles.option} onPress={() => choose(null)}>
                  <Text style={[styles.optionText, { color: C.textMuted }]}>None</Text>
                </Pressable>
              )}
              {allOptions.map((o) => {
                const active = o.value === value;
                return (
                  <Pressable
                    key={o.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [styles.option, (pressed || active) && { backgroundColor: C.accentDim }]}
                    onPress={() => choose(o.value)}>
                    <Text style={[styles.optionText, active && styles.optionActive]}>{o.label}</Text>
                    {active && <Icon name="check" size={18} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    backgroundColor: C.inputFill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: { fontSize: 15, color: C.text },
  backdrop: { flex: 1, backgroundColor: C.scrim, justifyContent: 'center', padding: 24 },
  sheet: {
    backgroundColor: C.bg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
  },
  optionText: { fontSize: 15, color: C.text },
  optionActive: { fontWeight: '600' },
});
