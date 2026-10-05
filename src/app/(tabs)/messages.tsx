import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { Chat } from '@/api/endpoints';
import type { ConversationSummary } from '@/api/types';
import { Avatar } from '@/components/ui/avatar';
import { Divider } from '@/components/ui/card';
import { ScreenHeader } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { SecondaryButton } from '@/components/ui/button';
import { EmptyState, ErrorState, AppRefreshControl, Loading } from '@/components/ui/states';
import { C, Font, Metal, MaxContentWidth } from '@/constants/theme';
import { useRealtime } from '@/context/realtime-context';
import { relativeTime } from '@/utils/format';

const PAGE = 50;
// Coalesces bursts of pushes into one refetch.
const REFETCH_DEBOUNCE_MS = 1000;
// Each later page re-requests this many rows from the end of the previous one: a conversation
// jumping to the top shifts every offset by one, which would otherwise skip a row.
const PAGE_OVERLAP = 5;

function newestFirst(a: ConversationSummary, b: ConversationSummary) {
  const at = a.last_message_at ? Date.parse(a.last_message_at) : -Infinity;
  const bt = b.last_message_at ? Date.parse(b.last_message_at) : -Infinity;
  return bt - at || b.id - a.id;
}

// Fresh rows win. Rows only in `current` survive if they sort after everything `fresh` covers
// (i.e. they came from a later page); inside that range, a missing row was removed server-side.
function mergeConversations(current: ConversationSummary[], fresh: ConversationSummary[], freshIsFirstPage: boolean) {
  const freshIds = new Set(fresh.map((c) => c.id));
  const sortedFresh = [...fresh].sort(newestFirst);
  const oldestFresh = sortedFresh[sortedFresh.length - 1];
  const kept = current.filter((c) => {
    if (freshIds.has(c.id)) return false;
    if (!freshIsFirstPage) return true;
    if (!oldestFresh || fresh.length < PAGE) return false;
    return newestFirst(c, oldestFresh) > 0;
  });
  return [...sortedFresh, ...kept].sort(newestFirst);
}

export default function MessagesScreen() {
  const [items, setItems] = useState<ConversationSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  // State, not a ref: the "load older" footer is rendered from it.
  const [hasMore, setHasMore] = useState(false);
  // Mirror of `items` so `loadMore` never acts on a list from a stale render.
  const itemsRef = useRef<ConversationSummary[] | null>(null);
  const requestId = useRef(0);
  const focused = useRef(false);
  const focusCount = useRef(0);
  const stale = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refetches the first page and merges it in, so pages already loaded by scrolling stay put;
  // a new message moves its conversation into the first page anyway.
  const fetchFirstPage = useCallback(() => {
    const id = ++requestId.current;
    return Chat.conversations({ limit: PAGE, offset: 0 }).then(
      (page) => {
        if (id !== requestId.current) return;
        // Recomputed on every first-page fetch: this used to run only on the very first one,
        // which could leave paging switched off for the rest of the session.
        setHasMore(page.length === PAGE);
        setItems((cur) => {
          const next = cur ? mergeConversations(cur, page, true) : page;
          itemsRef.current = next;
          return next;
        });
        setError(null);
      },
      (e) => {
        if (id === requestId.current) setError(errorMessage(e));
      },
    );
  }, []);

  useEffect(() => {
    void fetchFirstPage();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [fetchFirstPage]);

  const scheduleRefetch = () => {
    // The tab stays mounted behind other screens; only refetch while it's visible.
    if (!focused.current) {
      stale.current = true;
      return;
    }
    if (timer.current) return;
    timer.current = setTimeout(() => {
      timer.current = null;
      void fetchFirstPage();
    }, REFETCH_DEBOUNCE_MS);
  };

  useRealtime(() => scheduleRefetch());

  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      // The first focus is covered by the mount fetch. Later focuses always refresh,
      // since returning from a chat changes unread counts.
      if (focusCount.current++ > 0 || stale.current) {
        stale.current = false;
        void fetchFirstPage();
      }
      return () => {
        focused.current = false;
      };
    }, [fetchFirstPage]),
  );

  const refresh = async () => {
    setRefreshing(true);
    await fetchFirstPage();
    setRefreshing(false);
  };

  const loadingMoreRef = useRef(false);
  const loadMore = async () => {
    const current = itemsRef.current;
    if (!current || !hasMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const page = await Chat.conversations({
        limit: PAGE,
        offset: Math.max(0, current.length - PAGE_OVERLAP),
      });
      const known = new Set(current.map((c) => c.id));
      const unseen = page.some((c) => !known.has(c.id));
      setHasMore(page.length === PAGE);
      if (!unseen && page.length === PAGE) {
        // A full page of rows we already have means the offset drifted (conversations moved to
        // the top while we were paging); step past the window instead of re-reading it forever.
        const skipped = await Chat.conversations({ limit: PAGE, offset: current.length + PAGE });
        setHasMore(skipped.length === PAGE);
        setItems((cur) => {
          const next = cur ? mergeConversations(cur, skipped, false) : skipped;
          itemsRef.current = next;
          return next;
        });
        return;
      }
      setItems((cur) => {
        const next = cur ? mergeConversations(cur, page, false) : page;
        itemsRef.current = next;
        return next;
      });
    } catch {
      // scrolling again retries
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  const renderItem = ({ item }: { item: ConversationSummary }) => {
    const name = item.other_name ?? 'Member';
    const unread = item.unread_count > 0;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${name}${item.other_business_name ? `, ${item.other_business_name}` : ''}${
          unread ? `, ${item.unread_count} unread` : ''
        }`}
        android_ripple={{ color: 'rgba(3,95,105,0.08)' }}
        style={({ pressed }) => [styles.row, unread && styles.rowUnread, pressed && { backgroundColor: C.surfacePressed }]}
        onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id, name } })}>
        <Avatar name={item.other_business_name ?? name} size={52} logoUrl={item.other_business_logo_url} />
        <View style={styles.body}>
          <View style={styles.topLine}>
            <Text style={[styles.name, unread && styles.nameUnread]} numberOfLines={1}>
              {name}
            </Text>
            <Text style={[styles.time, unread && { color: C.text }]}>{relativeTime(item.last_message_at)}</Text>
          </View>
          {item.other_business_name ? (
            <Text style={styles.company} numberOfLines={1}>
              {item.other_business_name}
            </Text>
          ) : null}
          <View style={styles.topLine}>
            <Text style={[styles.preview, unread && { color: C.text }]} numberOfLines={1}>
              {item.last_message ?? 'No messages yet — say hello'}
            </Text>
            {unread && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unread_count > 99 ? '99+' : item.unread_count}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <Screen>
      <ScreenHeader eyebrow="Conversations" title="Messages" />
      {items === null && !error ? (
        <Loading />
      ) : items === null ? (
        <ErrorState message={error!} onRetry={refresh} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(c) => String(c.id)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <Divider style={{ marginLeft: 88 }} />}
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.6}
          refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={refresh} />}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={C.text} style={{ margin: 16 }} />
            ) : hasMore && items.length > 0 ? (
              // onEndReached can fail to fire on some Android layouts; this keeps paging
              // reachable by tap, and makes "is there more?" visible instead of silent.
              <View style={styles.footer}>
                <SecondaryButton title="Load older conversations" icon="refresh" compact onPress={loadMore} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="forum"
              title="No messages yet"
              message="Connect with companies, then start a conversation from Connections."
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingTop: 6, paddingBottom: 32, flexGrow: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  footer: { padding: 16, alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingVertical: 14 },
  // Unread threads get the website's red left rule on a lighter surface.
  rowUnread: { backgroundColor: C.surface, borderLeftWidth: 3, borderLeftColor: C.accent, paddingLeft: 17 },
  body: { flex: 1, gap: 2 },
  topLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  name: { flex: 1, fontFamily: Font.semibold, fontSize: 16, color: C.text },
  nameUnread: { fontFamily: Font.bold },
  company: { fontFamily: Font.semibold, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: C.textMuted },
  time: { fontFamily: Font.medium, fontSize: 12, color: C.textMuted },
  preview: { flex: 1, fontFamily: Font.regular, fontSize: 14, color: C.textMuted },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: C.accent,
    experimental_backgroundImage: Metal.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: Font.bold, fontSize: 11, color: C.onAccent },
});
