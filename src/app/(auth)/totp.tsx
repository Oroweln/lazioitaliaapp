import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { BrandLockup } from '@/components/brand';
import { FormScroll } from '@/components/form-scroll';
import { GoldButton, TextButton } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/card';
import { GoldText } from '@/components/ui/gold-text';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ErrorBanner } from '@/components/ui/states';
import { Type } from '@/constants/theme';
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
        <BrandLockup tagline={false} />
        <GlassCard style={styles.card}>
          <View style={{ gap: 6 }}>
            <GoldText style={Type.eyebrow}>Two-factor authentication</GoldText>
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
          <GoldButton title="Verify" onPress={submit} loading={busy} />
        </GlassCard>
        <TextButton title="← Back to sign in" onPress={cancelTotp} />
      </FormScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: 28 },
  card: { gap: 18, padding: 24 },
  code: { fontSize: 26, letterSpacing: 10, textAlign: 'center' },
});
