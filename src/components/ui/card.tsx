import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { MetalEdge } from '@/components/ui/metal';
import { C, Radius } from '@/constants/theme';

type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  /// `light` = surface card on travertine; `ink` = the website's deep-teal "ticket" card.
  tone?: 'light' | 'ink';
  /// Brushed-steel line along the top edge (website heroes, tickets, form cards).
  edge?: boolean;
};

export function Card({ children, onPress, style, radius = Radius.lg, tone = 'light', edge }: CardProps) {
  const base = [styles.card, tone === 'ink' && styles.ink, { borderRadius: radius }];
  const top = edge ? <MetalEdge style={styles.edge} /> : null;
  if (!onPress) {
    return (
      <View style={[base, style]}>
        {top}
        {children}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      android_ripple={{ color: tone === 'ink' ? C.lineOnInk : 'rgba(3,95,105,0.08)' }}
      style={({ pressed }) => [base, pressed && (tone === 'ink' ? styles.inkPressed : styles.pressed), style]}>
      {top}
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
    padding: 18,
    overflow: 'hidden',
    boxShadow: '0px 14px 30px -22px rgba(3,95,105,0.45)',
  },
  ink: { backgroundColor: C.ink2, borderColor: C.lineOnInk, boxShadow: '0px 24px 50px -28px rgba(0,0,0,0.6)' },
  pressed: { backgroundColor: C.surfacePressed },
  inkPressed: { backgroundColor: C.ink },
  // Absolutely placed so it doesn't take part in the card's own gap/padding layout.
  edge: { position: 'absolute', top: 0, left: 0, right: 0 },
  divider: { height: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: C.border },
});
