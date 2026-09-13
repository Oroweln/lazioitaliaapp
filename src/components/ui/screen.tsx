import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { C, Gradients } from '@/constants/theme';

export function Backdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={Gradients.skybox.colors}
        locations={Gradients.skybox.locations}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        dither
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={Gradients.scrim.colors}
        locations={Gradients.scrim.locations}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

type ScreenProps = {
  children: ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
};

export function Screen({ children, edges = ['top'], style }: ScreenProps) {
  return (
    <View style={styles.root}>
      <Backdrop />
      <SafeAreaView edges={edges} style={[styles.content, style]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { flex: 1 },
});
