import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { Primary, Spacing } from '@/constants/theme';
import { myBusiness } from '@/data/mock';
import { INDUSTRY_COLORS } from '@/utils/colors';

const INFO_LINKS = [
  'About',
  'Contact',
  'Privacy Policy',
  'Terms of Use',
  'Legal Information',
  'Delete Account',
];

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { logout } = useAuth();
  const industryColor = INDUSTRY_COLORS[myBusiness.industry] ?? '#6B7280';

  const handleLogout = () =>
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { paddingTop: insets.top + Spacing.four }]}>
        <View style={[styles.logoWrap, { borderColor: Primary }]}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>
        <Text style={[styles.name, { color: theme.text }]}>{myBusiness.name}</Text>
        {myBusiness.website && (
          <Text style={[styles.website, { color: Primary }]}>{myBusiness.website}</Text>
        )}
        <View style={[styles.badge, { backgroundColor: industryColor + '20' }]}>
          <Text style={[styles.badgeText, { color: industryColor }]}>{myBusiness.industry}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.backgroundElement }]} />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ABOUT</Text>
        <Text style={[styles.sectionBody, { color: theme.text }]}>{myBusiness.description}</Text>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.backgroundElement }]} />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>DETAILS</Text>
        {[
          { label: 'Industry', value: myBusiness.industry },
          { label: 'Location', value: myBusiness.location },
          ...(myBusiness.website ? [{ label: 'Website', value: myBusiness.website }] : []),
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

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: Primary }]}
          onPress={() => Alert.alert('Edit Profile', 'Profile editing coming soon.')}
          activeOpacity={0.85}
        >
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: theme.backgroundSelected }]}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={[styles.logoutBtnText, { color: '#EF4444' }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.backgroundElement }]} />

      <View style={styles.infoSection}>
        {INFO_LINKS.map((label) => (
          <TouchableOpacity
            key={label}
            style={[styles.infoRow, { borderBottomColor: theme.backgroundElement }]}
            onPress={() => Alert.alert(label, 'This page is coming soon.')}
            activeOpacity={0.7}
          >
            <Text style={[styles.infoLabel, { color: theme.text }]}>{label}</Text>
            <Text style={[styles.infoChevron, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.versionText, { color: theme.textSecondary }]}>
        {myBusiness.name} · v1.0.0{/* TODO: update version */}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { alignItems: 'center', paddingBottom: Spacing.four, paddingHorizontal: Spacing.four },
  logoWrap: {
    width: 80, height: 80, borderRadius: 20, borderWidth: 2,
    marginBottom: Spacing.three, overflow: 'hidden',
  },
  logoImage: { width: '100%', height: '100%' },
  name: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  website: { fontSize: 14, marginBottom: Spacing.two },
  badge: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, borderRadius: 999 },
  badgeText: { fontSize: 13, fontWeight: '700' },
  divider: { height: 1 },
  section: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: Spacing.three },
  sectionBody: { fontSize: 15, lineHeight: 24 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing.two + 2, borderBottomWidth: 1,
  },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: '500' },
  actions: { padding: Spacing.four, gap: Spacing.two },
  editBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  editBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  logoutBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1 },
  logoutBtnText: { fontSize: 16, fontWeight: '600' },
  infoSection: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.three, borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 15 },
  infoChevron: { fontSize: 22, lineHeight: 24 },
  versionText: { fontSize: 12, textAlign: 'center', marginTop: Spacing.four },
});
