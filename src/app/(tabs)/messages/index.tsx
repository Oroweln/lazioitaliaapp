import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { Primary, Spacing } from '@/constants/theme';
import { mockConversations } from '@/data/mock';
import { avatarColor } from '@/utils/colors';

export default function MessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
        <Text style={[styles.title, { color: theme.text }]}>Messages</Text>
      </View>

      <FlatList
        data={mockConversations}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const bg = avatarColor(item.businessName);
          return (
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: theme.backgroundElement }]}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/messages/[id]',
                  params: { id: item.id, name: item.businessName },
                })
              }
              activeOpacity={0.75}
            >
              <View style={[styles.avatar, { backgroundColor: bg }]}>
                <Text style={styles.avatarText}>{item.businessName.charAt(0)}</Text>
              </View>
              <View style={styles.info}>
                <View style={styles.topRow}>
                  <Text style={[styles.name, { color: theme.text }]}>{item.businessName}</Text>
                  <Text style={[styles.time, { color: theme.textSecondary }]}>
                    {item.lastMessageAt}
                  </Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text
                    style={[styles.preview, { color: theme.textSecondary }]}
                    numberOfLines={1}
                  >
                    {item.lastMessage}
                  </Text>
                  {item.unread > 0 && (
                    <View style={[styles.badge, { backgroundColor: Primary }]}>
                      <Text style={styles.badgeText}>{item.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No messages yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Connect with companies to start chatting
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
  list: { paddingBottom: Spacing.six },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.four, paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 50, height: 50, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.three,
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  info: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  name: { fontSize: 15, fontWeight: '600' },
  time: { fontSize: 12 },
  bottomRow: { flexDirection: 'row', alignItems: 'center' },
  preview: { fontSize: 14, flex: 1 },
  badge: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginLeft: Spacing.two,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: Spacing.six },
  emptyIcon: { fontSize: 40, marginBottom: Spacing.three },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: Spacing.one },
  emptySubtitle: { fontSize: 14 },
});
