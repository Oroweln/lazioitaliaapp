import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { mediaUrl } from '@/api/config';
import { metal } from '@/components/ui/metal';
import { C, Font } from '@/constants/theme';

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

  const ring = Math.max(2, Math.round(size / 28));
  const inner = size - ring * 2;

  // A brushed-steel frame around the logo (or a teal disc with ivory initials), like the website.
  return (
    <View style={[styles.frame, metal('steel'), { width: size, height: size, borderRadius: size / 2, padding: ring }]}>
      <View style={[styles.circle, { width: inner, height: inner, borderRadius: inner / 2 }]}>
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: inner, height: inner }}
            contentFit="cover"
            transition={150}
            onError={() => setFailed(true)}
            accessibilityLabel={`${name} logo`}
          />
        ) : (
          <Text style={[styles.text, { fontSize: inner * 0.38 }]}>{initials(name)}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { boxShadow: '0px 6px 14px -8px rgba(3,95,105,0.6)' },
  circle: {
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: { color: C.onInk, fontFamily: Font.serif },
});
