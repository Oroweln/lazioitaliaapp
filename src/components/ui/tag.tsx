import { StyleSheet, Text, View } from 'react-native';

import { C, Font, Radius } from '@/constants/theme';

export type TagTone = 'accent' | 'success' | 'danger' | 'warning' | 'muted';

const TONES: Record<TagTone, string> = {
  accent: C.text,
  success: C.success,
  danger: C.danger,
  warning: C.warning,
  muted: C.textMuted,
};

export function Tag({ label, tone = 'accent' }: { label: string; tone?: TagTone }) {
  const color = TONES[tone];
  return (
    <View style={[styles.tag, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: tone === 'accent' ? C.accent : color }]} />
      <Text style={[styles.text, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Uppercase pill with a colored dot, like the website's chips and badges.
  tag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(246,241,232,0.7)',
    maxWidth: '100%',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontFamily: Font.bold, fontSize: 10, letterSpacing: 0.9, textTransform: 'uppercase', flexShrink: 1 },
});
