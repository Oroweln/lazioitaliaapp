import { Image, StyleSheet, Text, View } from 'react-native';

import { C } from '@/constants/theme';

export function BrandLockup({ tagline = true }: { tagline?: boolean }) {
  return (
    <View style={styles.wrap}>
      <Image source={require('@/assets/images/zoe-mark.png')} style={styles.mark} />
      <Image source={require('@/assets/images/zoe-wordmark.png')} style={styles.wordmark} />
      {tagline && <Text style={styles.tagline}>Precision · Elegance · Timelessness</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 14, paddingVertical: 12 },
  mark: { width: 64, height: 63, resizeMode: 'contain' },
  wordmark: { width: 210, height: 210 * (77 / 1000), resizeMode: 'contain' },
  tagline: { fontSize: 10, letterSpacing: 2.4, textTransform: 'uppercase', color: C.textDim, fontWeight: '500' },
});
