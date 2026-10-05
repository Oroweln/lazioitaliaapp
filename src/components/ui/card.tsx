import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { C, Radius } from '@/constants/theme';

type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  radius?: number;
};

export function Card({ children, onPress, style, radius = Radius.lg }: CardProps) {
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
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    overflow: 'hidden',
  },
  pressed: { backgroundColor: C.surfacePressed },
  divider: { height: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: C.divider },
});
