import { useMemo, useState } from 'react';
import {
  FlatList, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { Primary, Spacing } from '@/constants/theme';
import { mockBusinesses } from '@/data/mock';
import { BusinessCard } from '@/components/business-card';

const FILTERS = [
  'All', 'IT', 'Manufacturing', 'Logistics', 'Marketing',
  'Finance', 'Legal', 'Agriculture', 'Design', 'Healthcare', 'Tourism',
];

export default function DiscoverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const businesses = useMemo(() => {
    return mockBusinesses.filter((b) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        b.name.toLowerCase().includes(q) ||
        b.industry.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q);
      const matchFilter = activeFilter === 'All' || b.industry === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [search, activeFilter]);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
        <Text style={[styles.title, { color: theme.text }]}>Discover</Text>
        <Text style={[styles.count, { color: theme.textSecondary }]}>
          {businesses.length} companies
        </Text>
      </View>

      <View style={[styles.searchWrap, { borderColor: Primary }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search companies, industries, locations..."
          placeholderTextColor={theme.textSecondary}
          returnKeyType="search"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.chip,
              { borderColor: Primary },
              activeFilter === f && { backgroundColor: Primary },
            ]}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.75}
          >
            <Text style={[
              styles.chipText,
              { color: activeFilter === f ? '#fff' : theme.textSecondary },
            ]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={businesses}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <BusinessCard
            business={item}
            onPress={() => router.push({ pathname: '/(tabs)/discover/[id]', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No companies found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.four, paddingBottom: Spacing.two,
    flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two,
  },
  title: { fontSize: 28, fontWeight: '700' },
  count: { fontSize: 13 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.three, marginBottom: Spacing.two,
    borderRadius: 12, paddingHorizontal: Spacing.three, borderWidth: 1,
  },
  searchIcon: { fontSize: 15, marginRight: Spacing.two },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15 },
  filtersScroll: { flexGrow: 0, flexShrink: 0 },
  filtersRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three, paddingVertical: Spacing.two,
    borderRadius: 999, borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  list: { paddingBottom: Spacing.six },
  empty: { alignItems: 'center', paddingTop: Spacing.six },
  emptyIcon: { fontSize: 40, marginBottom: Spacing.three },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: Spacing.one },
  emptySubtitle: { fontSize: 14 },
});
