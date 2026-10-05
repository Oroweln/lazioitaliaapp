import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

import { C } from '@/constants/theme';

type ScreenProps = {
  children: ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
};

export function Screen({ children, edges = ['top'], style }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      {/* The status bar sits on deep teal, like the website's navbar; content below is travertine. */}
      {edges.includes('top') && <View style={[styles.statusBar, { height: insets.top }]} />}
      <SafeAreaView edges={edges} style={[styles.content, style]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  statusBar: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: C.nav },
  content: { flex: 1 },
});
