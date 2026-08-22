import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { Primary, Spacing } from '@/constants/theme';
import { mockConnections } from '@/data/mock';
import { ConnectionCard } from '@/components/connection-card';

export default function ConnectionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [tab, setTab] = useState<'pending' | 'connected'>('pending');

  const pending = mockConnections.filter(
    (c) => c.status === 'pending_admin' || c.status === 'pending_business',
  );
  const connected = mockConnections.filter((c) => c.status === 'approved');
  const items = tab === 'pending' ? pending : connected;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
        <Text style={[styles.title, { color: theme.text }]}>Connections</Text>
      </View>

      <View style={[styles.tabs, { backgroundColor: theme.backgroundElement }]}>
        {(['pending', 'connected'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabItem, tab === t && { backgroundColor: Primary }]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, { color: tab === t ? '#fff' : theme.textSecondary }]}>
              {t === 'pending'
                ? `Pending${pending.length > 0 ? ` (${pending.length})` : ''}`
                : `Connected${connected.length > 0 ? ` (${connected.length})` : ''}`
              }
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ConnectionCard
            connection={item}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/connections/[id]',
                params: { id: item.business.id },
              })
            }
            onMessage={item.status === 'approved'
              ? () => router.push({
                  pathname: '/(tabs)/messages/[id]',
                  params: { id: item.conversationId ?? item.id, name: item.business.name },
                })
              : undefined
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>{tab === 'pending' ? '📬' : '🤝'}</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {tab === 'pending' ? 'No pending requests' : 'No connections yet'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {tab === 'pending'
                ? 'Incoming connection requests will appear here'
                : 'Start connecting with companies on the Discover tab'
              }
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.two },
  title: { fontSize: 28, fontWeight: '700' },
  tabs: {
    flexDirection: 'row', marginHorizontal: Spacing.three, marginBottom: Spacing.two,
    borderRadius: 12, padding: Spacing.one,
  },
  tabItem: { flex: 1, paddingVertical: Spacing.two, borderRadius: 10, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '600' },
  list: { paddingBottom: Spacing.six },
  empty: {
    alignItems: 'center', paddingTop: Spacing.six, paddingHorizontal: Spacing.five,
  },
  emptyIcon: { fontSize: 40, marginBottom: Spacing.three },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: Spacing.one, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
