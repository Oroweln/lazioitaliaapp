import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { Discover } from '@/api/endpoints';
import type { Business } from '@/api/types';
import { BusinessCard } from '@/components/business-card';
import { ScreenHeader } from '@/components/ui/header';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Chip } from '@/components/ui/segmented';
import { EmptyState, ErrorState, AppRefreshControl, Loading } from '@/components/ui/states';
import { Brand } from '@/constants/brand';
import { INDUSTRIES } from '@/constants/industries';
import { C, MaxContentWidth, Radius, Scheme } from '@/constants/theme';
import { useMe } from '@/context/auth-context';

const PAGE = 20;

export default function DiscoverScreen() {
  const me = useMe();
  const myBusinessId = me.business?.id;

  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState<string | null>(null);
  const [items, setItems] = useState<Business[]>([]);
  const [resultKey, setResultKey] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const offset = useRef(0);
  const hasMore = useRef(true);
  const requestId = useRef(0);
  const busyMore = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const fetchPage = useCallback(
    (from: number) =>
      Discover.list({ search: search || undefined, industry: industry ?? undefined, limit: PAGE, offset: from }),
    [search, industry],
  );

  const applyPage = useCallback(
    (id: number, from: number, page: Business[]) => {
      if (id !== requestId.current) return;
      offset.current = from + page.length;
      hasMore.current = page.length === PAGE;
      const visible = page.filter((b) => b.id !== myBusinessId);
      setItems((prev) => (from > 0 ? [...prev, ...visible] : visible));
      setError(null);
      setResultKey(`${search}|${industry}`);
    },
    [myBusinessId, search, industry],
  );

  const applyError = useCallback(
    (id: number, e: unknown) => {
      if (id !== requestId.current) return;
      setError(errorMessage(e));
      setResultKey(`${search}|${industry}`);
    },
    [search, industry],
  );

  useEffect(() => {
    const id = ++requestId.current;
    fetchPage(0).then(
      (page) => applyPage(id, 0, page),
      (e) => applyError(id, e),
    );
  }, [fetchPage, applyPage, applyError]);

  const refresh = async () => {
    const id = ++requestId.current;
    setRefreshing(true);
    try {
      applyPage(id, 0, await fetchPage(0));
    } catch (e) {
      applyError(id, e);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore.current || busyMore.current || items.length === 0) return;
    busyMore.current = true;
    setLoadingMore(true);
    const id = requestId.current;
    const from = offset.current;
    try {
      applyPage(id, from, await fetchPage(from));
    } catch {
      // scrolling again retries
    } finally {
      busyMore.current = false;
      setLoadingMore(false);
    }
  };

  const loading = resultKey !== `${search}|${industry}`;

  const filters = (
    <View style={styles.filters}>
      <View style={styles.search}>
        <Icon name="search" size={20} color={C.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search companies, services, cities"
          placeholderTextColor={C.textHint}
          cursorColor={C.accent}
          selectionColor={C.accentDim}
          keyboardAppearance={Scheme}
          returnKeyType="search"
          style={styles.searchInput}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="All" active={industry === null} onPress={() => setIndustry(null)} />
        {INDUSTRIES.map((i) => (
          <Chip key={i} label={i} active={industry === i} onPress={() => setIndustry(industry === i ? null : i)} />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Screen>
      <ScreenHeader eyebrow={`${Brand.name} Network`} title="Discover" />
      {filters}
      {loading ? (
        <Loading />
      ) : error && items.length === 0 ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(b) => String(b.id)}
          renderItem={({ item }) => (
            <BusinessCard
              business={item}
              onPress={() => router.push({ pathname: '/business/[id]', params: { id: item.id, name: item.name } })}
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={refresh} />}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={C.accent} style={{ margin: 16 }} /> : null}
          ListEmptyComponent={
            <EmptyState
              icon="travel_explore"
              title="No companies found"
              message={
                search || industry
                  ? 'Try a different search or industry.'
                  : 'New members appear here once they are approved.'
              }
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { gap: 12, paddingBottom: 12 },
  search: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.inputFill,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 15, paddingVertical: 0 },
  chips: { paddingHorizontal: 20, gap: 8 },
  list: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 32,
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});
