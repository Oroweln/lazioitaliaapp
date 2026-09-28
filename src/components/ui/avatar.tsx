import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { mediaUrl } from '@/api/config';
import { C, Gradients } from '@/constants/theme';

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type Props = {
  name: string;
  size?: number;
  /// Company logo path from the API (`/api/v2/media/...`); initials are the fallback.
  logoUrl?: string | null;
};

export function Avatar({ name, size = 48, logoUrl }: Props) {
  const [failed, setFailed] = useState(false);
  const uri = failed ? null : mediaUrl(logoUrl);

  return (
    <LinearGradient
      colors={Gradients.gold.colors}
      locations={Gradients.gold.locations}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, padding: 1 }}>
      <View style={[styles.inner, { borderRadius: size / 2 }]}>
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: size - 2, height: size - 2, borderRadius: size / 2 }}
            contentFit="cover"
            transition={150}
            onError={() => setFailed(true)}
            accessibilityLabel={`${name} logo`}
          />
        ) : (
          <Text style={[styles.text, { fontSize: size * 0.34 }]}>{initials(name)}</Text>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  text: { color: C.accentLight, fontWeight: '500', letterSpacing: 1 },
});
