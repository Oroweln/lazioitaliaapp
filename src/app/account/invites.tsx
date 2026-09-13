import { useState } from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { Company } from '@/api/endpoints';
import type { CreatedInvite } from '@/api/types';
import { FormScroll } from '@/components/form-scroll';
import { GoldButton, OutlineButton } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/card';
import { GoldText } from '@/components/ui/gold-text';
import { ScreenHeader } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { ErrorBanner, ErrorState, Loading } from '@/components/ui/states';
import { Tag } from '@/components/ui/tag';
import { C, Radius, Type } from '@/constants/theme';
import { useMe } from '@/context/auth-context';
import { useAsync } from '@/hooks/use-async';

type InviteRole = 'member' | 'admin';

function expiresIn(iso: string) {
  const hours = Math.round((new Date(iso).getTime() - Date.now()) / 3600000);
  if (hours <= 0) return 'Expired';
  return hours < 24 ? `Expires in ${hours}h` : `Expires in ${Math.round(hours / 24)}d`;
}

export default function InvitesScreen() {
  const me = useMe();
  const { data, error, loading, retry, silentReload } = useAsync(() => Company.invites());
  const [role, setRole] = useState<InviteRole>('member');
  const [created, setCreated] = useState<CreatedInvite | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const create = async () => {
    setBusy(true);
    setActionError(null);
    try {
      setCreated(await Company.createInvite(role));
      void silentReload();
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const share = (invite: CreatedInvite) =>
    Share.share({
      message:
        `You're invited to join ${me.business?.name ?? 'our company'} on Zoe Milano.\n\n` +
        `Install the app, choose "Request membership" → "Invite code", and enter:\n\n${invite.token}\n\n` +
        `This code is valid for 72 hours and can be used once.`,
    });

  const revoke = (id: number) =>
    Alert.alert('Revoke invite', 'This code will stop working immediately.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Revoke',
        style: 'destructive',
        onPress: async () => {
          try {
            await Company.revokeInvite(id);
            if (created?.id === id) setCreated(null);
            void silentReload();
          } catch (e) {
            Alert.alert('Unable to revoke', errorMessage(e));
          }
        },
      },
    ]);

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Invite colleagues" back />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <FormScroll>
          <GlassCard style={styles.card}>
            <GoldText style={Type.eyebrow}>New invite</GoldText>
            <Text style={Type.bodyDim}>
              Colleagues who register with an invite code join {me.business?.name ?? 'your company'} directly.
            </Text>
            <Segmented<InviteRole>
              value={role}
              onChange={setRole}
              options={[
                { value: 'member', label: 'Member' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
            <ErrorBanner message={actionError} />
            <GoldButton title="Create invite code" icon="person_add" onPress={create} loading={busy} />
          </GlassCard>

          {created && (
            <GlassCard style={styles.card}>
              <GoldText style={Type.eyebrow}>Share this code now</GoldText>
              <Text style={Type.small}>For security it is shown only once.</Text>
              <View style={styles.tokenBox}>
                <Text selectable style={styles.token}>
                  {created.token}
                </Text>
              </View>
              <GoldButton title="Share invite" icon="share" onPress={() => share(created)} />
            </GlassCard>
          )}

          <GlassCard style={styles.card}>
            <GoldText style={Type.eyebrow}>Active invites</GoldText>
            {(data ?? []).length === 0 ? (
              <Text style={Type.bodyDim}>No active invites.</Text>
            ) : (
              data!.map((inv) => (
                <View key={inv.id} style={styles.invite}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Tag label={inv.role} tone={inv.role === 'admin' ? 'gold' : 'muted'} />
                    <Text style={Type.small}>{expiresIn(inv.expires_at)}</Text>
                  </View>
                  <OutlineButton title="Revoke" tone="danger" compact onPress={() => revoke(inv.id)} />
                </View>
              ))
            )}
          </GlassCard>
        </FormScroll>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14 },
  tokenBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(216,178,113,0.55)',
    borderRadius: Radius.md,
    padding: 16,
    backgroundColor: C.inputFill,
  },
  token: { color: C.accentLight, fontSize: 15, fontFamily: 'monospace', textAlign: 'center' },
  invite: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
