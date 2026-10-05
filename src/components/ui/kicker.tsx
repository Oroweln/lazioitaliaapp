import { StyleSheet, Text, View } from 'react-native';

import { C, Font, Type } from '@/constants/theme';

/// The website's numbered kicker: "01" in a teal circle + an uppercase red label.
export function Kicker({ n, label, tone = 'light' }: { n: number; label: string; tone?: 'light' | 'ink' }) {
  const onInk = tone === 'ink';
  return (
    <View style={styles.row}>
      <View style={[styles.circle, onInk && styles.circleInk]}>
        <Text style={[styles.num, onInk && styles.numInk]}>{String(n).padStart(2, '0')}</Text>
      </View>
      <Text style={[styles.label, onInk && styles.labelInk]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  circle: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  circleInk: { backgroundColor: C.ivory },
  num: { fontFamily: Font.bold, fontSize: 11, color: C.ivory, letterSpacing: 0.3 },
  numInk: { color: C.ink },
  label: { ...Type.eyebrow, flexShrink: 1 },
  labelInk: { color: C.coral },
});
