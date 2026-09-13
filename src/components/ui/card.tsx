import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { C, Gradients, Radius } from '@/constants/theme';

type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  radius?: number;
};

export function GlassCard({ children, onPress, style, radius = Radius.lg }: CardProps) {
  const base = [styles.card, { borderRadius: radius }];
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      android_ripple={{ color: C.accentDim }}
      style={({ pressed }) => [base, pressed && styles.pressed, style]}>
      {children}
    </Pressable>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <LinearGradient
      colors={Gradients.hairline.colors}
      locations={Gradients.hairline.locations}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.divider, style]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.borderGold,
    padding: 18,
    overflow: 'hidden',
  },
  pressed: { backgroundColor: C.surfaceHover, borderColor: 'rgba(216,178,113,0.55)' },
  divider: { height: 1, alignSelf: 'stretch' },
});
