import { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import { ApiError, errorMessage } from '@/api/client';
import { Account } from '@/api/endpoints';
import type { TotpInit } from '@/api/types';
import { FormScroll } from '@/components/form-scroll';
import { PrimaryButton, SecondaryButton, TextButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScreenHeader } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ErrorBanner, ErrorState, Loading } from '@/components/ui/states';
import { Tag } from '@/components/ui/tag';
import { Brand } from '@/constants/brand';
import { C, Radius, Type } from '@/constants/theme';
import { useAuth, useMe } from '@/context/auth-context';
import { useAsync } from '@/hooks/use-async';

export default function SecurityScreen() {
  const status = useAsync(() => Account.totpStatus());

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Security" back />
      {status.loading ? (
        <Loading />
      ) : status.error || !status.data ? (
        <ErrorState message={status.error ?? 'Unavailable'} onRetry={status.retry} />
      ) : (
        <FormScroll>
          <TwoFactorCard enabled={status.data.totp_enabled} onChanged={status.silentReload} />
          <DeleteAccountCard />
        </FormScroll>
      )}
    </Screen>
  );
}

function TwoFactorCard({ enabled, onChanged }: { enabled: boolean; onChanged: () => void }) {
  const [setup, setSetup] = useState<TotpInit | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [disabling, setDisabling] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const start = () => run(async () => setSetup(await Account.totpInit()));

  const confirm = () =>
    run(async () => {
      if (!/^\d{6}$/.test(code)) throw new ApiError(400, 'Enter the 6-digit code from your authenticator app.');
      await Account.totpConfirm(code);
      setSetup(null);
      setCode('');
      onChanged();
    });

  const disable = () =>
    run(async () => {
      try {
        await Account.totpDisable(password);
      } catch (e) {
        if (e instanceof ApiError && e.status === 400) throw new ApiError(400, 'Incorrect password.');
        throw e;
      }
      setPassword('');
      setDisabling(false);
      onChanged();
    });

  return (
    <Card style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={Type.eyebrow}>Two-factor authentication</Text>
        <Tag label={enabled ? 'On' : 'Off'} tone={enabled ? 'success' : 'muted'} />
      </View>
      <Text style={Type.bodyDim}>
        Protect your account with a one-time code from an authenticator app (Google Authenticator, 1Password, Authy).
      </Text>

      {!enabled && !setup && <PrimaryButton title="Enable two-factor" icon="shield" onPress={start} loading={busy} />}

      {!enabled && setup && (
        <>
          <Text style={Type.label}>1 · Add to your authenticator</Text>
          <SecondaryButton
            title="Open authenticator app"
            compact
            onPress={() =>
              Linking.openURL(setup.otpauth_url).catch(() =>
                Alert.alert('No authenticator found', 'Enter the setup key below manually.'),
              )
            }
          />
          <View style={styles.secretBox}>
            <Text style={[Type.small, { textAlign: 'center' }]}>Setup key</Text>
            <Text selectable style={styles.secret}>
              {setup.secret.replace(/(.{4})/g, '$1 ').trim()}
            </Text>
          </View>
          <Text style={Type.label}>2 · Enter the 6-digit code</Text>
          <Input
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            style={styles.code}
          />
          <ErrorBanner message={error} />
          <PrimaryButton title="Confirm & enable" onPress={confirm} loading={busy} />
          <TextButton title="Cancel" onPress={() => setSetup(null)} />
        </>
      )}

      {enabled && !disabling && (
        <SecondaryButton title="Disable two-factor" tone="danger" onPress={() => setDisabling(true)} />
      )}

      {enabled && disabling && (
        <>
          <Input
            label="Confirm with your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
          <ErrorBanner message={error} />
          <SecondaryButton title="Disable two-factor" tone="danger" onPress={disable} loading={busy} disabled={!password} />
          <TextButton title="Cancel" onPress={() => setDisabling(false)} />
        </>
      )}

      {!setup && !disabling && <ErrorBanner message={error} />}
    </Card>
  );
}

function DeleteAccountCard() {
  const { deleteAccount } = useAuth();
  const me = useMe();
  const [busy, setBusy] = useState(false);

  const confirm = () =>
    Alert.alert(
      'Delete account',
      'Your account, messages and sessions will be permanently deleted. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Are you absolutely sure?', `Delete ${me.email} permanently?`, [
              { text: 'Keep account', style: 'cancel' },
              {
                text: 'Delete forever',
                style: 'destructive',
                onPress: async () => {
                  setBusy(true);
                  try {
                    await deleteAccount();
                  } catch (e) {
                    setBusy(false);
                    Alert.alert('Unable to delete account', errorMessage(e));
                  }
                },
              },
            ]),
        },
      ],
    );

  return (
    <Card style={[styles.card, { borderColor: C.danger }]}>
      <Text style={[Type.eyebrow, { color: C.danger }]}>Danger zone</Text>
      <Text style={Type.bodyDim}>Permanently delete your {Brand.name} account.</Text>
      {me.business_role === 'owner' && (
        <Text style={Type.small}>
          You own {me.business?.name}. Ownership passes to another member of your team; if you are the only
          member, the company is removed from the network.
        </Text>
      )}
      <SecondaryButton title="Delete account" tone="danger" icon="delete" onPress={confirm} loading={busy} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  secretBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: C.border,
    borderRadius: Radius.md,
    padding: 14,
    gap: 6,
    backgroundColor: C.inputFill,
  },
  secret: { color: C.accent, fontSize: 16, fontFamily: 'monospace', textAlign: 'center', letterSpacing: 1 },
  code: { fontSize: 22, letterSpacing: 8, textAlign: 'center' },
});
