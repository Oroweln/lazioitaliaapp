import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { Auth } from '@/api/endpoints';
import { SecondaryButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { ErrorBanner } from '@/components/ui/states';
import { C, Type } from '@/constants/theme';
import { useAuth, useMe } from '@/context/auth-context';

/// Shown until the account's email is confirmed. Nothing on the server depends on
/// this, so it never blocks the app — it only nudges.
export function VerifyEmailBanner() {
  const me = useMe();
  const { refreshMe } = useAuth();
  const [busy, setBusy] = useState<'resend' | 'check' | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (me.email_verified) return null;

  const run = async (action: 'resend' | 'check') => {
    if (busy) return;
    setBusy(action);
    setNotice(null);
    setError(null);
    try {
      if (action === 'resend') {
        await Auth.resendVerification(me.email);
        setNotice(`Link sent to ${me.email}. Check your inbox and spam folder.`);
      } else {
        const next = await refreshMe();
        // refreshMe returns the account as the server now sees it; still false means
        // the link hasn't been opened yet.
        if (next && !next.email_verified) setNotice('Not confirmed yet — open the link in the email first.');
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Icon name="mail" size={20} />
        <Text style={Type.heading}>Confirm your email</Text>
      </View>
      <Text style={Type.bodyDim}>
        We sent a confirmation link to {me.email}. Open it to confirm this address is yours.
      </Text>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      <ErrorBanner message={error} />
      <View style={styles.actions}>
        <SecondaryButton
          title="Resend link"
          icon="refresh"
          compact
          style={{ flex: 1 }}
          loading={busy === 'resend'}
          disabled={busy === 'check'}
          onPress={() => run('resend')}
        />
        <SecondaryButton
          title="I've confirmed"
          icon="check"
          compact
          style={{ flex: 1 }}
          loading={busy === 'check'}
          disabled={busy === 'resend'}
          onPress={() => run('check')}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, borderColor: C.warning },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notice: { color: C.text, fontSize: 13, lineHeight: 19 },
  actions: { flexDirection: 'row', gap: 10 },
});
