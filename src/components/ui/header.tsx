import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { metal, MetalEdge } from '@/components/ui/metal';
import { C, Font, Type } from '@/constants/theme';

type Props = {
  title: string;
  eyebrow?: string;
  back?: boolean;
  right?: ReactNode;
  compact?: boolean;
};

// Deep-teal bars like the website's navbar and heroes, finished with the brushed-steel edge.
export function ScreenHeader({ title, eyebrow, back, right, compact }: Props) {
  if (back || compact) {
    return (
      <View>
        <View style={styles.bar}>
          {back ? (
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [styles.backBtn, pressed && styles.backPressed]}>
              <Icon name="arrow_back" size={22} color={C.onInk} />
            </Pressable>
          ) : (
            <View style={styles.backBtn} />
          )}
          <Text style={styles.barTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.right}>{right}</View>
        </View>
        <MetalEdge height={3} />
      </View>
    );
  }
  return (
    <View>
      <View style={[styles.large, metal('hero')]}>
        <View style={{ flex: 1, gap: 6 }}>
          {eyebrow && (
            <View style={styles.kicker}>
              <View style={styles.dot} />
              <Text style={styles.eyebrow}>{eyebrow}</Text>
            </View>
          )}
          <Text style={styles.display} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {right}
      </View>
      <MetalEdge />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: C.nav,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.lineOnInk,
  },
  backPressed: { backgroundColor: C.lineOnInk },
  barTitle: { flex: 1, textAlign: 'center', fontFamily: Font.serif, fontSize: 19, color: C.onInk, marginHorizontal: 10 },
  right: { minWidth: 40, alignItems: 'flex-end' },
  large: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    gap: 12,
  },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // The website's red "on air" dot.
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.accent, boxShadow: '0px 0px 0px 3px rgba(213,34,4,0.3)' },
  eyebrow: { ...Type.eyebrow, color: C.onInkMuted },
  display: { ...Type.display, color: C.onInk },
});
