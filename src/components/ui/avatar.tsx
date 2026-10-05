import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { mediaUrl } from '@/api/config';
import { C } from '@/constants/theme';

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
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          contentFit="cover"
          transition={150}
          onError={() => setFailed(true)}
          accessibilityLabel={`${name} logo`}
        />
      ) : (
        <Text style={[styles.text, { fontSize: size * 0.34 }]}>{initials(name)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: { color: C.textDim, fontWeight: '600' },
});
