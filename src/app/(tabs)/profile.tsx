import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Company } from '@/api/endpoints';
import { ListRow } from '@/components/list-row';
import { VerifyEmailBanner } from '@/components/verify-email-banner';
import { Avatar } from '@/components/ui/avatar';
import { OutlineButton } from '@/components/ui/button';
import { Divider, GlassCard } from '@/components/ui/card';
import { GoldText } from '@/components/ui/gold-text';
import { ScreenHeader } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { ErrorBanner, GoldRefreshControl } from '@/components/ui/states';
import { Tag } from '@/components/ui/tag';
import { C, MaxContentWidth, Type } from '@/constants/theme';
import { useAuth, useMe } from '@/context/auth-context';
import { useAsync } from '@/hooks/use-async';
import { useRefetchOnFocus } from '@/hooks/use-refetch-on-focus';
import { displayWebsite, SIZE_LABELS } from '@/utils/format';
import { isWebUrl, openWebsite } from '@/utils/links';

const ROLE_LABEL = { owner: 'Owner', admin: 'Admin', member: 'Member' } as const;

export default function ProfileScreen() {
  const { logout, refreshMe } = useAuth();
  const me = useMe();
  const business = me.business;
  const canManage = me.business_role === 'owner' || me.business_role === 'admin';

  const team = useAsync(() => Company.get());
  const refreshAll = async () => {
    await Promise.all([refreshMe().catch(() => undefined), team.silentReload()]);
  };
  useRefetchOnFocus(() => void refreshAll());

  const confirmLogout = () =>
    Alert.alert('Sign out', 'Do you want to sign out of Zoe Milano?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => void logout(),
      },
    ]);

  return (
    <Screen>
      <ScreenHeader eyebrow="Your account" title="Profile" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<GoldRefreshControl refreshing={team.refreshing} onRefresh={team.reload} />}>
        <VerifyEmailBanner />

        <GlassCard style={styles.hero}>
          <Avatar name={business?.name ?? me.profile.name ?? me.email} size={84} logoUrl={business?.logo_url} />
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Text style={[Type.title, { textAlign: 'center' }]}>{business?.name ?? 'No company'}</Text>
            {isWebUrl(business?.website) ? (
              <Pressable
                onPress={() => openWebsite(business?.website)}
                hitSlop={8}
                accessibilityRole="link"
                accessibilityLabel={`Open website ${displayWebsite(business?.website)}`}>
                <Text style={styles.website}>{displayWebsite(business?.website)} ↗</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.tags}>
            {business?.industry && <Tag label={business.industry} />}
            {me.business_role && <Tag label={ROLE_LABEL[me.business_role]} tone="muted" />}
          </View>
          <Divider />
          <View style={{ alignItems: 'center', gap: 2 }}>
            <Text style={styles.person}>{me.profile.name ?? 'Add your name'}</Text>
            <Text style={styles.email}>{me.email}</Text>
          </View>
        </GlassCard>

        {business && (
          <GlassCard style={styles.section}>
            <GoldText style={Type.eyebrow}>Company</GoldText>
            {business.description ? (
              <Text style={styles.body}>{business.description}</Text>
            ) : (
              <Text style={styles.muted}>No description yet.</Text>
            )}
            {business.looking_for ? (
              <View style={{ gap: 4 }}>
                <Text style={[Type.label, { color: C.textMuted }]}>Looking for</Text>
                <Text style={styles.body}>{business.looking_for}</Text>
              </View>
            ) : null}
            <Detail label="Location" value={business.location} />
            <Detail label="Company size" value={business.size ? SIZE_LABELS[business.size] : null} />
            {canManage && (
              <OutlineButton title="Edit company" icon="edit" compact onPress={() => router.push('/account/edit-business')} />
            )}
          </GlassCard>
        )}

        {!team.data && team.error && (
          <GlassCard style={styles.section}>
            <GoldText style={Type.eyebrow}>Team</GoldText>
            <ErrorBanner message={team.error} />
            <OutlineButton title="Try again" icon="refresh" compact onPress={team.retry} />
          </GlassCard>
        )}

        {team.data && (
          <GlassCard style={styles.section}>
            <GoldText style={Type.eyebrow}>Team · {team.data.members.length}</GoldText>
            {team.data.members.map((m) => (
              <View key={m.user_id} style={styles.member}>
                <Avatar name={m.name ?? m.email} size={36} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName} numberOfLines={1}>
                    {m.name ?? m.email}
                    {m.user_id === me.user_id ? '  (you)' : ''}
                  </Text>
                  <Text style={styles.email} numberOfLines={1}>
                    {m.email}
                  </Text>
                </View>
                <Tag label={ROLE_LABEL[m.role]} tone={m.role === 'member' ? 'muted' : 'gold'} />
              </View>
            ))}
            {canManage && (
              <OutlineButton title="Invite colleagues" icon="person_add" compact onPress={() => router.push('/account/invites')} />
            )}
          </GlassCard>
        )}

        <GlassCard style={styles.section}>
          <GoldText style={Type.eyebrow}>Settings</GoldText>
          <ListRow icon="person" title="Your name" subtitle="How colleagues see you in chat" onPress={() => router.push('/account/edit-profile')} />
          <ListRow
            icon="shield"
            title="Security"
            subtitle="Two-factor authentication, delete account"
            onPress={() => router.push('/account/security')}
          />
          <ListRow icon="logout" title="Sign out" onPress={confirmLogout} tone="danger" />
        </GlassCard>
      </ScrollView>
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <View style={styles.detail}>
      <Text style={[Type.label, { color: C.textMuted }]}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 4, gap: 16, paddingBottom: 40, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  hero: { alignItems: 'center', gap: 14, padding: 24 },
  website: { color: C.accentLight, fontSize: 14 },
  tags: { flexDirection: 'row', gap: 8 },
  person: { fontSize: 16, color: C.text },
  email: { fontSize: 12, color: C.textMuted },
  section: { gap: 14 },
  body: { color: C.textDim, fontSize: 14, lineHeight: 22, fontWeight: '300' },
  muted: { color: C.textMuted, fontSize: 14 },
  detail: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  detailValue: { color: C.text, fontSize: 14, flexShrink: 1, textAlign: 'right' },
  member: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberName: { fontSize: 14, color: C.text },
});
