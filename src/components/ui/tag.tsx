import { StyleSheet, Text, View } from 'react-native';

import { C, Radius } from '@/constants/theme';

export type TagTone = 'gold' | 'success' | 'danger' | 'warning' | 'muted';

const TONES: Record<TagTone, { bg: string; fg: string; border: string }> = {
  gold: { bg: C.accentDim, fg: C.accentLight, border: 'rgba(194,142,26,0.35)' },
  success: { bg: 'rgba(82,168,82,0.18)', fg: '#7fcb7f', border: 'rgba(82,168,82,0.4)' },
  danger: { bg: 'rgba(224,82,82,0.18)', fg: '#f08a8a', border: 'rgba(224,82,82,0.4)' },
  warning: { bg: 'rgba(212,160,23,0.18)', fg: '#e8c25a', border: 'rgba(212,160,23,0.4)' },
  muted: { bg: 'rgba(136,136,170,0.14)', fg: C.textMuted, border: 'rgba(136,136,170,0.3)' },
};

export function Tag({ label, tone = 'gold' }: { label: string; tone?: TagTone }) {
  const t = TONES[tone];
  return (
    <View style={[styles.tag, { backgroundColor: t.bg, borderColor: t.border }]}>
      <Text style={[styles.text, { color: t.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  text: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' },
});
