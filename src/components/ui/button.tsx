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
import { C, Radius, Type } from '@/constants/theme';

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
        compact && styles.compact,
        { backgroundColor: C.accent, opacity: inactive ? 0.5 : pressed ? 0.8 : 1 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={C.onAccent} />
      ) : (
        <View style={styles.row}>
          {icon && <Icon name={icon} size={18} color={C.onAccent} />}
          <Text style={[Type.button, { color: C.onAccent }]}>{title}</Text>
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
  const color = tone === 'danger' ? C.danger : C.accent;
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
          backgroundColor: pressed ? (tone === 'danger' ? C.dangerDim : C.accentDim) : 'transparent',
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
      {({ pressed }) => <Text style={[styles.textButton, { color: pressed ? C.text : C.textDim }]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: { borderWidth: 1 },
  compact: { minHeight: 38, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  textButton: { fontSize: 14, textAlign: 'center' },
});
