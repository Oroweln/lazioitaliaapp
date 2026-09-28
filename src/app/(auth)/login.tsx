import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ApiError, errorMessage } from '@/api/client';
import { BrandLockup } from '@/components/brand';
import { FormScroll } from '@/components/form-scroll';
import { GoldButton, TextButton } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/card';
import { GoldText } from '@/components/ui/gold-text';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ErrorBanner } from '@/components/ui/states';
import { C, Type } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // State updates too late to stop a second keyboard "go"; a second login would replace the
  // server's pending 2FA token and leave this screen holding a dead one.
  const inFlight = useRef(false);

  const submit = async () => {
    if (inFlight.current) return;
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
    } catch (e) {
      inFlight.current = false;
      if (e instanceof ApiError && e.status === 403) setError('This account has been suspended.');
      else if (e instanceof ApiError && (e.status === 400 || e.status === 422)) setError('Incorrect email or password.');
      else setError(errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <FormScroll contentStyle={styles.content}>
        <BrandLockup />
        <GlassCard style={styles.card}>
          <View style={{ gap: 6 }}>
            <GoldText style={Type.eyebrow}>Member access</GoldText>
            <Text style={Type.title}>Welcome back</Text>
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
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••••"
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            onSubmitEditing={submit}
            returnKeyType="go"
          />
          <ErrorBanner message={error} />
          <GoldButton title="Sign in" onPress={submit} loading={busy} />
          <TextButton title="Forgot your password?" onPress={() => router.push('/forgot-password')} />
        </GlassCard>
        <View style={styles.footer}>
          <Text style={styles.footerText}>New to the network?</Text>
          <TextButton title="Request membership →" onPress={() => router.push('/register')} />
        </View>
      </FormScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: 28 },
  card: { gap: 18, padding: 24 },
  footer: { alignItems: 'center', gap: 6 },
  footerText: { color: C.textMuted, fontSize: 13 },
});
