import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { Primary, Spacing } from '@/constants/theme';
import { mockBusinesses, SIZE_LABELS } from '@/data/mock';
import { avatarColor, INDUSTRY_COLORS } from '@/utils/colors';

export default function ConnectionBusinessProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const business = mockBusinesses.find((b) => b.id === Number(id));

  if (!business) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary, padding: Spacing.four }}>
          Company not found.
        </Text>
      </View>
    );
  }

  const bg = avatarColor(business.name);
  const industryColor = INDUSTRY_COLORS[business.industry] ?? '#6B7280';

  const handleConnect = () =>
    Alert.alert(
      'Request Sent',
      `Your connection request has been sent to ${business.name}.`,
      [{ text: 'OK' }],
    );

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: business.name }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: bg + '15' }]}>
          <View style={[styles.avatar, { backgroundColor: bg }]}>
            <Text style={styles.avatarText}>{business.name.charAt(0)}</Text>
          </View>
          <Text style={[styles.name, { color: theme.text }]}>{business.name}</Text>
          {business.website && (
            <Text style={[styles.website, { color: Primary }]}>{business.website}</Text>
          )}
          <View style={styles.tags}>
            <View style={[styles.tag, { backgroundColor: industryColor + '20' }]}>
              <Text style={[styles.tagText, { color: industryColor }]}>{business.industry}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: theme.backgroundElement }]}>
              <Text style={[styles.tagText, { color: theme.textSecondary }]}>
                📍 {business.location}
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: theme.backgroundElement }]}>
              <Text style={[styles.tagText, { color: theme.textSecondary }]}>
                🏢 {SIZE_LABELS[business.size]}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ABOUT</Text>
          <Text style={[styles.body, { color: theme.text }]}>{business.description}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.backgroundElement }]} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>LOOKING FOR</Text>
          <Text style={[styles.body, { color: theme.text }]}>{business.lookingFor}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.backgroundElement }]} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>DETAILS</Text>
          {[
            { label: 'Industry', value: business.industry },
            { label: 'Location', value: business.location },
            { label: 'Company Size', value: SIZE_LABELS[business.size] },
            ...(business.website ? [{ label: 'Website', value: business.website }] : []),
          ].map((row) => (
            <View
              key={row.label}
              style={[styles.detailRow, { borderBottomColor: theme.backgroundElement }]}
            >
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{row.label}</Text>
              <Text style={[styles.detailValue, {
                color: row.label === 'Website' ? Primary : theme.text,
              }]}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, {
        backgroundColor: theme.background,
        borderTopColor: theme.backgroundElement,
        paddingBottom: insets.bottom + Spacing.three,
      }]}>
        <TouchableOpacity
          style={[styles.connectBtn, { backgroundColor: Primary }]}
          onPress={handleConnect}
          activeOpacity={0.85}
        >
          <Text style={styles.connectBtnText}>
            Connect with {business.name.split(' ')[0]}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    alignItems: 'center', paddingVertical: Spacing.six, paddingHorizontal: Spacing.four,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.three,
  },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '800' },
  name: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  website: { fontSize: 14, marginBottom: Spacing.three },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, justifyContent: 'center' },
  tag: { paddingHorizontal: Spacing.two + 2, paddingVertical: Spacing.one, borderRadius: 999 },
  tagText: { fontSize: 12, fontWeight: '600' },
  section: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: Spacing.three },
  body: { fontSize: 15, lineHeight: 24 },
  divider: { height: 1, marginHorizontal: Spacing.four },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing.two + 2, borderBottomWidth: 1,
  },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: '500' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Spacing.three, borderTopWidth: 1,
  },
  connectBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  connectBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
