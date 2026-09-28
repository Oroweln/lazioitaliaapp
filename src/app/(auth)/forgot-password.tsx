import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { Auth } from '@/api/endpoints';
import { BrandLockup } from '@/components/brand';
import { FormScroll } from '@/components/form-scroll';
import { GoldButton, TextButton } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/card';
import { GoldText } from '@/components/ui/gold-text';
import { ScreenHeader } from '@/components/ui/header';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ErrorBanner } from '@/components/ui/states';
import { C, Type } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const submit = async () => {
    if (inFlight.current) return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      await Auth.forgotPassword(email.trim());
      setSent(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Reset password" back />
      <FormScroll contentStyle={styles.content}>
        <BrandLockup tagline={false} />
        {sent ? (
          // Deliberately the same message whether or not the address has an account.
          <GlassCard style={styles.card}>
            <View style={styles.iconRing}>
              <Icon name="mail" size={26} />
            </View>
            <GoldText style={Type.eyebrow}>Check your inbox</GoldText>
            <Text style={[Type.bodyDim, { textAlign: 'center' }]}>
              If {email.trim()} has an account, we&apos;ve sent a link to choose a new password. It is valid for one
              hour.
            </Text>
            <GoldButton title="Back to sign in" onPress={() => router.back()} />
          </GlassCard>
        ) : (
          <GlassCard style={styles.card}>
            <View style={{ gap: 6 }}>
              <GoldText style={Type.eyebrow}>Forgot your password</GoldText>
              <Text style={Type.title}>Reset it by email</Text>
              <Text style={Type.bodyDim}>
                Enter the address you signed up with and we&apos;ll send you a link to set a new password.
              </Text>
            </View>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@company.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              onSubmitEditing={submit}
              returnKeyType="send"
              autoFocus
            />
            <ErrorBanner message={error} />
            <GoldButton title="Send reset link" onPress={submit} loading={busy} icon="lock_reset" />
            <TextButton title="← Back to sign in" onPress={() => router.back()} />
          </GlassCard>
        )}
      </FormScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: 28 },
  card: { gap: 18, padding: 24, alignItems: 'stretch' },
  iconRing: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: C.borderGold,
    backgroundColor: C.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
