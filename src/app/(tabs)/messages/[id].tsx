import { useEffect, useRef, useState } from 'react';
import {
  FlatList, KeyboardAvoidingView, Platform, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { Primary, Spacing } from '@/constants/theme';
import { MY_COMPANY_ID, mockMessages, type Message } from '@/data/mock';
import { MessageBubble } from '@/components/message-bubble';

export default function ChatScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const theme = useTheme();
  const conversationId = Number(id);
  const listRef = useRef<FlatList>(null);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>(
    () => mockMessages[conversationId] ?? [],
  );

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [messages.length]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newMsg: Message = {
      id: Date.now(),
      conversationId,
      senderId: MY_COMPANY_ID,
      content: trimmed,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setText('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen options={{ title: name ?? '' }} />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <MessageBubble
            content={item.content}
            time={item.createdAt}
            isMine={item.senderId === MY_COMPANY_ID}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Say hello 👋</Text>
          </View>
        }
      />

      <View style={[styles.inputBar, {
        backgroundColor: theme.background,
        borderTopColor: theme.backgroundElement,
      }]}>
        <TextInput
          style={[styles.input, {
            backgroundColor: theme.backgroundElement,
            color: theme.text,
          }]}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={theme.textSecondary}
          multiline
          returnKeyType="default"
        />
        <TouchableOpacity
          style={[styles.sendBtn, {
            backgroundColor: text.trim() ? Primary : theme.backgroundElement,
          }]}
          onPress={send}
          activeOpacity={0.8}
          disabled={!text.trim()}
        >
          <Text style={[styles.sendIcon, {
            color: text.trim() ? '#fff' : theme.textSecondary,
          }]}>
            ↑
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingTop: Spacing.three, paddingBottom: Spacing.two },
  empty: { alignItems: 'center', paddingTop: Spacing.six },
  emptyText: { fontSize: 15 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: Spacing.three, paddingVertical: Spacing.two,
    paddingBottom: Platform.OS === 'ios' ? Spacing.four : Spacing.two,
    borderTopWidth: 1, gap: Spacing.two,
  },
  input: {
    flex: 1, borderRadius: 20, paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2, fontSize: 15, maxHeight: 120,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  sendIcon: { fontSize: 18, fontWeight: '700' },
});
