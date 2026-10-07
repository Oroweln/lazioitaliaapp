import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';
import { C, Font } from '@/constants/theme';

// Rendered from the website's brand files (lazio `static/brand/`): the metal mark (teal box, white map
// of Lazio, red L — also the app icon) with the white metal lettering, as in the website's header and
// footer (`wordmark="metal"`); the red lettering is for light backgrounds.
const MARK = require('@/assets/images/brand/mark-metal.png');
const WORD_METAL = require('@/assets/images/brand/wordmark-metal.png');
const WORD_RED = require('@/assets/images/brand/wordmark.png');
// The metal lettering is a little wider for its height (16.8:1 against 14.9:1).
const WORD_ASPECT = { metal: 1276 / 76, red: 1442 / 97 };

type Props = {
  tagline?: boolean;
  /// `ink` = on a teal surface (white metal lettering), `light` = on travertine (red lettering).
  tone?: 'ink' | 'light';
  /// Box height; the lettering scales with it.
  size?: number;
  layout?: 'stacked' | 'inline';
};

export function BrandLockup({ tagline = true, tone = 'light', size = 64, layout = 'stacked' }: Props) {
  const onInk = tone === 'ink';
  const aspect = onInk ? WORD_ASPECT.metal : WORD_ASPECT.red;
  // Same letter height for both finishes (website: 4.98x / 4.33x the box inline).
  const wordWidth = (layout === 'inline' ? size * 4.33 : size * 3.6) * (aspect / WORD_ASPECT.red);

  const mark = (
    <Image
      source={MARK}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessibilityIgnoresInvertColors
    />
  );
  const word = (
    <Image
      source={onInk ? WORD_METAL : WORD_RED}
      style={{ width: wordWidth, height: wordWidth / aspect }}
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
  tagline: { fontFamily: Font.semibold, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' },
  center: { textAlign: 'center' },
});
