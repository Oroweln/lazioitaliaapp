import { StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';
import { C, Radius, Type } from '@/constants/theme';

// PLACEHOLDER LOCKUP — swap the box for the derived app's logo (e.g. an <Image> from assets/images).
export function BrandLockup({ tagline = true }: { tagline?: boolean }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.mark}>
        <Text style={styles.markText}>{Brand.name.charAt(0)}</Text>
      </View>
      <Text style={Type.heading}>{Brand.name}</Text>
      {tagline && <Text style={Type.small}>{Brand.tagline}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  mark: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: { fontSize: 28, fontWeight: '600', color: C.textDim },
});
