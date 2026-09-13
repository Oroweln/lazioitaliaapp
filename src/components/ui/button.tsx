import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { C, Gradients, Radius, Type } from '@/constants/theme';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export function GoldButton({ title, onPress, loading, disabled, icon, style, compact }: ButtonProps) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={({ pressed }) => [
        styles.goldFrame,
        compact && styles.compact,
        { opacity: inactive ? 0.55 : pressed ? 0.85 : 1 },
        style,
      ]}>
      <LinearGradient
        colors={Gradients.cta.colors}
        locations={Gradients.cta.locations}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.goldFill, compact && styles.compactFill]}>
        <View style={styles.goldHighlight} pointerEvents="none" />
        {loading ? (
          <ActivityIndicator color={C.onGold} />
        ) : (
          <View style={styles.row}>
            {icon && <Icon name={icon} size={18} color={C.onGold} />}
            <Text style={[Type.button, { color: C.onGold }]}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export function OutlineButton({
  title,
  onPress,
  loading,
  disabled,
  icon,
  style,
  compact,
  tone = 'gold',
}: ButtonProps & { tone?: 'gold' | 'danger' }) {
  const color = tone === 'danger' ? C.danger : C.accentLight;
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={({ pressed }) => [
        styles.outline,
        compact && styles.compactFill,
        {
          borderColor: tone === 'danger' ? 'rgba(224,82,82,0.55)' : C.accent,
          backgroundColor: pressed ? (tone === 'danger' ? 'rgba(224,82,82,0.12)' : C.accentDim) : 'transparent',
          opacity: inactive ? 0.5 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <View style={styles.row}>
          {icon && <Icon name={icon} size={18} color={color} />}
          <Text style={[Type.button, { color }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function TextButton({ title, onPress, style, disabled }: ButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={8} style={style} accessibilityRole="button">
      {({ pressed }) => (
        <Text style={[styles.textButton, { color: pressed ? C.accentLight : C.textDim }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  goldFrame: {
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: C.ctaFrame,
    overflow: 'hidden',
    shadowColor: C.accent,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 6,
  },
  goldFill: {
    minHeight: 50,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  compact: { elevation: 2 },
  compactFill: { minHeight: 38, paddingHorizontal: 18 },
  outline: {
    minHeight: 50,
    paddingHorizontal: 24,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  textButton: { fontSize: 14, fontWeight: '300', textAlign: 'center' },
});
