import { StyleSheet, Text, View } from 'react-native';

import { Primary, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  content: string;
  time: string;
  isMine: boolean;
}

export function MessageBubble({ content, time, isMine }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
      <View style={[
        styles.bubble,
        isMine
          ? { backgroundColor: Primary }
          : { backgroundColor: theme.backgroundElement },
      ]}>
        <Text style={[styles.content, { color: isMine ? '#fff' : theme.text }]}>
          {content}
        </Text>
        <Text style={[styles.time, {
          color: isMine ? 'rgba(255,255,255,0.65)' : theme.textSecondary,
        }]}>
          {time}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: Spacing.three, marginBottom: Spacing.two, flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '78%', paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two, borderRadius: 16,
  },
  content: { fontSize: 15, lineHeight: 22, marginBottom: 4 },
  time: { fontSize: 11, alignSelf: 'flex-end' },
});
