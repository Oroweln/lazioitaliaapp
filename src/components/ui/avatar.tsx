import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { C, Gradients } from '@/constants/theme';

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, size = 48 }: { name: string; size?: number }) {
  return (
    <LinearGradient
      colors={Gradients.gold.colors}
      locations={Gradients.gold.locations}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, padding: 1 }}>
      <View style={[styles.inner, { borderRadius: size / 2 }]}>
        <Text style={[styles.text, { fontSize: size * 0.34 }]}>{initials(name)}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  text: { color: C.accentLight, fontWeight: '500', letterSpacing: 1 },
});
