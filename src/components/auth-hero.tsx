import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { BrandLockup } from '@/components/brand';
import { metal, MetalEdge } from '@/components/ui/metal';
import { C, Font, Type } from '@/constants/theme';

const HERO = require('@/assets/images/hero-cities.jpg');

type Props = {
  eyebrow: string;
  title: string;
  /// Last words of the headline, set in steel like the website's accented "Lazio".
  accent?: string;
  lede?: string;
};

// The website's home hero, condensed for a phone: the cities footage still (teal-graded),
// a deep-teal legibility shade, the logo, a red-dot kicker and a Tinos headline.
export function AuthHero({ eyebrow, title, accent, lede }: Props) {
  return (
    <View>
      <View style={styles.hero}>
        <Image source={HERO} style={StyleSheet.absoluteFill} contentFit="cover" accessible={false} />
        <View style={[StyleSheet.absoluteFill, metal('photoShade')]} />
        <BrandLockup layout="inline" tone="ink" size={44} tagline={false} />
        <View style={styles.copy}>
          <View style={styles.kicker}>
            <View style={styles.dot} />
            <Text style={styles.eyebrow}>{eyebrow}</Text>
          </View>
          <Text style={styles.title}>
            {title}
            {accent ? <Text style={styles.accent}> {accent}</Text> : null}
          </Text>
          {lede ? <Text style={styles.lede}>{lede}</Text> : null}
        </View>
        <Text style={styles.note}>AI-generated image</Text>
      </View>
      <MetalEdge />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 300,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 26,
    justifyContent: 'space-between',
    gap: 28,
    backgroundColor: C.ink,
    overflow: 'hidden',
  },
  copy: { gap: 10, maxWidth: 520 },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.accent, boxShadow: '0px 0px 0px 3px rgba(213,34,4,0.35)' },
  eyebrow: { ...Type.eyebrow, color: C.onInkMuted },
  title: { fontFamily: Font.serif, fontSize: 38, lineHeight: 40, letterSpacing: -0.2, color: C.onInk },
  accent: { color: '#a3c8d3' },
  lede: { fontFamily: Font.regular, fontSize: 15, lineHeight: 22, color: C.onInkMuted },
  note: {
    position: 'absolute',
    right: 12,
    bottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(1,62,69,0.55)',
    fontFamily: Font.bold,
    fontSize: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: C.onInkMuted,
  },
});
