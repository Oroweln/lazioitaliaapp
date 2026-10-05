import { StyleSheet, Text, View } from 'react-native';

import { C, Radius } from '@/constants/theme';

export type TagTone = 'accent' | 'success' | 'danger' | 'warning' | 'muted';

const TONES: Record<TagTone, string> = {
  accent: C.accent,
  success: C.success,
  danger: C.danger,
  warning: C.warning,
  muted: C.textMuted,
};

export function Tag({ label, tone = 'accent' }: { label: string; tone?: TagTone }) {
  const color = TONES[tone];
  return (
    <View style={[styles.tag, { borderColor: color }]}>
      <Text style={[styles.text, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: { fontSize: 11, fontWeight: '600' },
});
