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
import { metal } from '@/components/ui/metal';
import { C, Font, Radius, Type } from '@/constants/theme';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export function PrimaryButton({ title, onPress, loading, disabled, icon, style, compact }: ButtonProps) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={({ pressed }) => [
        styles.base,
        styles.primary,
        compact && styles.compact,
        metal('red'),
        { opacity: inactive ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={C.onAccent} />
      ) : (
        <View style={styles.row}>
          {icon && <Icon name={icon} size={18} color={C.onAccent} />}
          <Text style={[Type.button, { color: C.onAccent }]} numberOfLines={1}>
            {title}
          </Text>
          {!icon && !compact && <Text style={[Type.button, { color: C.onAccent }]}>→</Text>}
        </View>
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  title,
  onPress,
  loading,
  disabled,
  icon,
  style,
  compact,
  tone = 'default',
}: ButtonProps & { tone?: 'default' | 'danger' }) {
  const color = tone === 'danger' ? C.danger : C.text;
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={({ pressed }) => [
        styles.base,
        styles.outline,
        compact && styles.compact,
        {
          borderColor: color,
          backgroundColor: pressed ? (tone === 'danger' ? C.dangerDim : 'rgba(3,95,105,0.08)') : 'transparent',
          opacity: inactive ? 0.5 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <View style={styles.row}>
          {icon && <Icon name={icon} size={18} color={color} />}
          <Text style={[Type.button, { color }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function TextButton({ title, onPress, style, disabled }: ButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={8} style={style} accessibilityRole="button">
      {({ pressed }) => <Text style={[styles.textButton, { color: pressed ? C.accentText : C.text }]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: 24,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Metal-red pill with the site's inset highlight and red glow.
  primary: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.45)',
    boxShadow: '0px 8px 22px -12px rgba(213,34,4,0.9)',
  },
  outline: { borderWidth: 1 },
  compact: { minHeight: 40, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: '100%' },
  textButton: { fontFamily: Font.semibold, fontSize: 14, textAlign: 'center' },
});
