import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError, errorMessage } from '@/api/client';
import { Chat } from '@/api/endpoints';
import type { Message } from '@/api/types';
import { ScreenHeader } from '@/components/ui/header';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { EmptyState, ErrorState, Loading } from '@/components/ui/states';
import { C, Gradients, Radius } from '@/constants/theme';
import { useMe } from '@/context/auth-context';
import { useRealtime } from '@/context/realtime-context';
import { clockTime } from '@/utils/format';

const PAGE = 50;
const SYNC_DEBOUNCE_MS = 600;
const MAX_SYNC_RETRIES = 4;
// How far back a resync pages to reconnect with what's on screen before giving up and
// replacing the list.
const MAX_CATCHUP_PAGES = 5;

function mergeMessages(current: Message[], incoming: Message[]) {
  const byId = new Map(current.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => a.id - b.id);
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ChatScreen() {
  const params = useLocalSearchParams<{ id: string; name?: string }>();
  const conversationId = Number(params.id);
  const me = useMe();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState(params.name ?? '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const messagesRef = useRef<Message[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  // Bumped whenever the list is replaced wholesale, so an in-flight "load older" from the
  // previous list can't splice its page onto the new one and leave a gap.
  const listGeneration = useRef(0);
  const loadingOlderRef = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncing = useRef(false);
  const syncAgain = useRef(false);
  const lastMarkedRead = useRef(0);
  const unmounted = useRef(false);

  useEffect(() => {
    unmounted.current = false;
    return () => {
      unmounted.current = true;
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, []);

  const loadInitial = useCallback(
    () =>
      Chat.messages(conversationId, { limit: PAGE }).then(
        (page) => {
          setMessages((cur) => mergeMessages(cur, page));
          setHasOlder(page.length === PAGE);
          setError(null);
          setLoading(false);
        },
        (e) => {
          setError(errorMessage(e));
          setLoading(false);
        },
      ),
    [conversationId],
  );

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (params.name) return;
    Chat.conversations({ limit: 100 })
      .then((list) => {
        const found = list.find((c) => c.id === conversationId);
        if (found?.other_name) setTitle(found.other_name);
      })
      .catch(() => undefined);
  }, [params.name, conversationId]);

  const last = messages[messages.length - 1];
  useEffect(() => {
    if (!last || last.id <= lastMarkedRead.current) return;
    const id = last.id;
    const t = setTimeout(() => {
      Chat.markRead(conversationId, id).then(
        () => {
          lastMarkedRead.current = Math.max(lastMarkedRead.current, id);
        },
        () => undefined,
      );
    }, 500);
    return () => clearTimeout(t);
  }, [last, conversationId]);

  // Fetches the newest page and pages backwards until it meets the newest message already on
  // screen, so a burst larger than one page merges without a gap and without moving the
  // user's scroll position. Only a very long absence falls back to replacing the list.
  const fetchSinceKnown = useCallback(
    async (newestKnown: number) => {
      let collected = await Chat.messages(conversationId, { limit: PAGE });
      let lastPageSize = collected.length;
      const disconnected = () =>
        newestKnown > 0 && lastPageSize === PAGE && collected.length > 0 && collected[0].id > newestKnown;
      for (let pages = 1; disconnected() && pages < MAX_CATCHUP_PAGES; pages++) {
        const older = await Chat.messages(conversationId, { before: collected[0].id, limit: PAGE });
        collected = [...older, ...collected];
        lastPageSize = older.length;
      }
      return { collected, gap: disconnected() };
    },
    [conversationId],
  );

  const sync = useCallback(async () => {
    if (syncing.current) {
      syncAgain.current = true;
      return;
    }
    syncing.current = true;
    try {
      do {
        syncAgain.current = false;
        for (let attempt = 0; ; attempt++) {
          try {
            const current = messagesRef.current;
            const { collected, gap } = await fetchSinceKnown(current[current.length - 1]?.id ?? 0);
            if (unmounted.current) return;
            if (gap) {
              listGeneration.current++;
              messagesRef.current = collected;
              setMessages(collected);
              setHasOlder(true);
            } else {
              setMessages((cur) => mergeMessages(cur, collected));
            }
            setError(null);
            break;
          } catch (e) {
            if (unmounted.current || attempt >= MAX_SYNC_RETRIES) break;
            await sleep(e instanceof ApiError && e.retryAfter ? e.retryAfter * 1000 : 2000 * 2 ** attempt);
          }
        }
      } while (syncAgain.current && !unmounted.current);
    } finally {
      syncing.current = false;
    }
  }, [fetchSinceKnown]);

  // Pushes carry no payload; coalesce bursts into one fetch.
  useRealtime((event) => {
    const relevant =
      event.type === 'resync' || (event.type === 'new_message' && event.conversation_id === conversationId);
    if (!relevant || syncTimer.current) return;
    syncTimer.current = setTimeout(() => {
      syncTimer.current = null;
      void sync();
    }, SYNC_DEBOUNCE_MS);
  });

  const loadOlder = async () => {
    const current = messagesRef.current;
    if (!hasOlder || loadingOlderRef.current || current.length === 0) return;
    loadingOlderRef.current = true;
    setLoadingOlder(true);
    const generation = listGeneration.current;
    try {
      const page = await Chat.messages(conversationId, { before: current[0].id, limit: PAGE });
      if (generation !== listGeneration.current) return;
      setMessages((cur) => mergeMessages(cur, page));
      setHasOlder(page.length === PAGE);
    } catch {
      // scrolling up again retries
    } finally {
      loadingOlderRef.current = false;
      setLoadingOlder(false);
    }
  };

  const send = useCallback(
    async (content: string) => {
      try {
        const sent = await Chat.send(conversationId, content);
        setMessages((cur) => mergeMessages(cur, [sent]));
        return true;
      } catch (e) {
        Alert.alert('Message not sent', errorMessage(e));
        return false;
      }
    },
    [conversationId],
  );

  const reversed = useMemo(() => [...messages].reverse(), [messages]);

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const older = reversed[index + 1];
      const showDay =
        !older || new Date(older.created_at).toDateString() !== new Date(item.created_at).toDateString();
      return <MessageRow message={item} mine={item.sender_id === me.user_id} showDay={showDay} />;
    },
    [reversed, me.user_id],
  );

  return (
    // Only the top inset is applied here; the composer pads for the bottom inset itself, and the
    // negative offset lets the keyboard cover that padding instead of leaving a gap above it.
    <Screen edges={['top']}>
      <ScreenHeader title={title || 'Conversation'} back />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={-insets.bottom}>
        {loading && messages.length === 0 ? (
          <Loading />
        ) : error && messages.length === 0 ? (
          <ErrorState
            message={error}
            onRetry={() => {
              setLoading(true);
              void loadInitial();
            }}
          />
        ) : (
          <FlatList
            data={reversed}
            inverted
            keyExtractor={(m) => String(m.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            onEndReached={loadOlder}
            onEndReachedThreshold={0.3}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={loadingOlder ? <ActivityIndicator color={C.accentLight} style={{ margin: 12 }} /> : null}
            ListEmptyComponent={
              <View style={{ transform: [{ scaleY: -1 }] }}>
                <EmptyState icon="chat" title="Start the conversation" message="Send the first message below." />
              </View>
            }
          />
        )}
        <Composer onSend={send} bottomInset={insets.bottom} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const MessageRow = memo(function MessageRow({
  message,
  mine,
  showDay,
}: {
  message: Message;
  mine: boolean;
  showDay: boolean;
}) {
  return (
    <View>
      {showDay && (
        <View style={styles.dayWrap}>
          <Text style={styles.day}>{dayLabel(message.created_at)}</Text>
        </View>
      )}
      <View style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowTheirs]}>
        {mine ? (
          <LinearGradient
            colors={Gradients.cta.colors}
            locations={Gradients.cta.locations}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1.4 }}
            style={[styles.bubble, styles.bubbleMine]}>
            <Text style={[styles.text, { color: C.onGold }]}>{message.content}</Text>
            <Text style={[styles.time, { color: 'rgba(26,19,0,0.6)' }]}>{clockTime(message.created_at)}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.bubbleTheirs]}>
            <Text style={styles.text}>{message.content}</Text>
            <Text style={styles.time}>{clockTime(message.created_at)}</Text>
          </View>
        )}
      </View>
    </View>
  );
});

// Owns the draft so typing re-renders only the input, not the message list.
function Composer({ onSend, bottomInset }: { onSend: (content: string) => Promise<boolean>; bottomInset: number }) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const inFlight = useRef(false);

  const submit = async () => {
    const content = draft.trim();
    if (!content || inFlight.current) return;
    inFlight.current = true;
    // Clear immediately so anything typed while the request is in flight is kept.
    setDraft('');
    setSending(true);
    const ok = await onSend(content);
    if (!ok) setDraft((cur) => (cur ? `${content}\n${cur}` : content));
    inFlight.current = false;
    setSending(false);
  };

  const canSend = draft.trim().length > 0 && !sending;

  return (
    <View style={[styles.composer, { paddingBottom: 10 + bottomInset }]}>
      <TextInput
        value={draft}
        onChangeText={(t) => setDraft(t.slice(0, 4000))}
        placeholder="Write a message…"
        placeholderTextColor={C.textHint}
        cursorColor={C.accentLight}
        selectionColor={C.accentDim}
        keyboardAppearance="dark"
        multiline
        accessibilityLabel="Message"
        style={styles.input}
      />
      <Pressable
        onPress={submit}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Send message"
        accessibilityState={{ disabled: !canSend, busy: sending }}
        style={({ pressed }) => [styles.sendWrap, { opacity: !draft.trim() ? 0.45 : pressed ? 0.8 : 1 }]}>
        <LinearGradient
          colors={Gradients.cta.colors}
          locations={Gradients.cta.locations}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.send}>
          {sending ? <ActivityIndicator color={C.onGold} /> : <Icon name="send" size={20} color={C.onGold} />}
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 14, paddingVertical: 12, flexGrow: 1 },
  dayWrap: { alignItems: 'center', marginVertical: 12 },
  day: {
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: C.textMuted,
    borderWidth: 1,
    borderColor: C.divider,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  bubbleRow: { marginVertical: 3, flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', paddingHorizontal: 14, paddingTop: 9, paddingBottom: 6, borderRadius: 20, gap: 2 },
  bubbleMine: { borderBottomRightRadius: 6 },
  bubbleTheirs: {
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: 'rgba(216,178,113,0.25)',
    borderBottomLeftRadius: 6,
  },
  text: { fontSize: 15, lineHeight: 21, color: C.text },
  time: { fontSize: 10, color: C.textMuted, alignSelf: 'flex-end' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.divider,
    backgroundColor: 'rgba(13,13,26,0.94)',
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 130,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: C.borderGold,
    backgroundColor: C.inputFill,
    color: C.text,
    fontSize: 15,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
  },
  sendWrap: { borderRadius: 23, overflow: 'hidden', borderWidth: 2, borderColor: C.ctaFrame },
  send: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
});
