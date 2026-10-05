import { useState, type Ref } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { C, Radius, Scheme, Type } from '@/constants/theme';

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
  ref?: Ref<TextInput>;
};

export function Input({ label, error, style, multiline, onFocus, onBlur, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      {label && <Text style={Type.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={C.textHint}
        selectionColor={C.accentDim}
        cursorColor={C.accent}
        keyboardAppearance={Scheme}
        multiline={multiline}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          multiline && styles.multiline,
          { borderColor: error ? C.danger : focused ? C.accent : C.border },
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
    backgroundColor: C.inputFill,
  },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  error: { fontSize: 12, color: C.danger },
});
