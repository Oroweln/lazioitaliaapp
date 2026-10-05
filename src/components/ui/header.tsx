import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { C, Type } from '@/constants/theme';

type Props = {
  title: string;
  eyebrow?: string;
  back?: boolean;
  right?: ReactNode;
  compact?: boolean;
};

export function ScreenHeader({ title, eyebrow, back, right, compact }: Props) {
  if (back || compact) {
    return (
      <View style={styles.bar}>
        {back ? (
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backBtn}>
            <Icon name="arrow_back" size={22} />
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
        <Text style={styles.barTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.right}>{right}</View>
      </View>
    );
  }
  return (
    <View style={styles.large}>
      <View style={{ flex: 1, gap: 4 }}>
        {eyebrow && <Text style={Type.eyebrow}>{eyebrow}</Text>}
        <Text style={Type.display} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.divider,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: C.text, marginHorizontal: 8 },
  right: { minWidth: 40, alignItems: 'flex-end' },
  large: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 12,
  },
});
