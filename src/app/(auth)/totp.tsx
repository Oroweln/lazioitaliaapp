import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { AuthHero } from '@/components/auth-hero';
import { FormScroll } from '@/components/form-scroll';
import { PrimaryButton, TextButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ErrorBanner } from '@/components/ui/states';
import { Font, Type } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';

export default function TotpScreen() {
  const { verifyTotp, cancelTotp } = useAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The pending token is single-use; a second submit would fail after the first consumed it.
  const inFlight = useRef(false);

  const submit = async () => {
    if (inFlight.current) return;
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      await verifyTotp(code);
    } catch (e) {
      inFlight.current = false;
      setError(errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <FormScroll contentStyle={styles.content}>
        <AuthHero eyebrow="Secure sign-in" title="One more step into" accent="Lazio." />
        <View style={styles.body}>
          <Card style={styles.card} edge>
            <View style={{ gap: 6 }}>
              <Text style={Type.eyebrow}>Two-factor authentication</Text>
              <Text style={Type.title}>Verification code</Text>
              <Text style={Type.bodyDim}>Open your authenticator app and enter the current code.</Text>
            </View>
            <Input
              value={code}
              onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              maxLength={6}
              autoFocus
              style={styles.code}
              onSubmitEditing={submit}
            />
            <ErrorBanner message={error} />
            <PrimaryButton title="Verify" onPress={submit} loading={busy} />
          </Card>
          <TextButton title="← Back to sign in" onPress={cancelTotp} />
        </View>
      </FormScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 0, gap: 0 },
  body: { paddingHorizontal: 20, paddingTop: 22, gap: 24 },
  card: { gap: 18, padding: 22, paddingTop: 26 },
  code: { fontFamily: Font.extrabold, fontSize: 26, letterSpacing: 10, textAlign: 'center' },
});
