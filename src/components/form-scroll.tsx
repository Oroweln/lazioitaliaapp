import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { MaxContentWidth } from '@/constants/theme';

export function FormScroll({
  children,
  contentStyle,
}: {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    // Android runs edge-to-edge, so the window is not resized for the keyboard; pad instead.
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, contentStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    gap: 20,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});
