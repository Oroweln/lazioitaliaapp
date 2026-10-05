import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';
import { C, Font } from '@/constants/theme';

// Rendered from the website's brand masters (lazio `static/brand/`): the box mark with the map
// of Lazio cut out, and the LAZIOITALIA.APP lettering (red for light backgrounds, ivory for teal).
const MARK = require('@/assets/images/brand/mark.png');
const WORD_RED = require('@/assets/images/brand/wordmark.png');
const WORD_LIGHT = require('@/assets/images/brand/wordmark-light.png');
const WORD_ASPECT = 1442 / 97;

type Props = {
  tagline?: boolean;
  /// `ink` = on a teal surface (ivory lettering), `light` = on travertine (red lettering).
  tone?: 'ink' | 'light';
  /// Box height; the lettering scales with it.
  size?: number;
  layout?: 'stacked' | 'inline';
};

export function BrandLockup({ tagline = true, tone = 'light', size = 64, layout = 'stacked' }: Props) {
  const onInk = tone === 'ink';
  const wordWidth = layout === 'inline' ? size * 4.33 : size * 3.6;

  const mark = (
    // The mark's map is a cut-out: give it a teal backing so the map reads on any surface.
    <View style={[styles.markBox, { width: size, height: size, borderRadius: size * 0.21 }]}>
      <Image source={MARK} style={{ width: size, height: size }} contentFit="contain" accessibilityIgnoresInvertColors />
    </View>
  );
  const word = (
    <Image
      source={onInk ? WORD_LIGHT : WORD_RED}
      style={{ width: wordWidth, height: wordWidth / WORD_ASPECT }}
      contentFit="contain"
      accessibilityLabel={Brand.name}
    />
  );
  const line = tagline ? (
    <Text style={[styles.tagline, { color: onInk ? C.onInkMuted : C.textMuted }, layout === 'stacked' && styles.center]}>
      {layout === 'inline' ? Brand.descriptor : Brand.tagline}
    </Text>
  ) : null;

  if (layout === 'inline') {
    return (
      <View style={styles.inline}>
        {mark}
        <View style={{ gap: size * 0.14, flexShrink: 1 }}>
          {word}
          {line}
        </View>
      </View>
    );
  }
  return (
    <View style={styles.stacked}>
      {mark}
      {word}
      {line}
    </View>
  );
}

const styles = StyleSheet.create({
  stacked: { alignItems: 'center', gap: 14, paddingVertical: 8 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  markBox: { backgroundColor: C.ink, overflow: 'hidden' },
  tagline: { fontFamily: Font.semibold, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' },
  center: { textAlign: 'center' },
});
