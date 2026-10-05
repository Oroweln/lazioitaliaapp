import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ApiError, errorMessage } from '@/api/client';
import { AuthHero } from '@/components/auth-hero';
import { FormScroll } from '@/components/form-scroll';
import { PrimaryButton, TextButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ErrorBanner } from '@/components/ui/states';
import { C, Font, Type } from '@/constants/theme';
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
        <AuthHero eyebrow="Member access" title="Welcome back to" accent="Lazio." />
        <View style={styles.body}>
          <Card style={styles.card} edge>
            <View style={{ gap: 6 }}>
              <Text style={Type.eyebrow}>Log in</Text>
              <Text style={Type.title}>Sign in to your account</Text>
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
            <PrimaryButton title="Sign in" onPress={submit} loading={busy} />
            <TextButton title="Forgot your password?" onPress={() => router.push('/forgot-password')} />
          </Card>
          <View style={styles.footer}>
            <Text style={styles.footerText}>New to the network?</Text>
            <TextButton title="Request membership →" onPress={() => router.push('/register')} />
          </View>
        </View>
      </FormScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 0, gap: 0 },
  body: { paddingHorizontal: 20, paddingTop: 22, gap: 24 },
  card: { gap: 18, padding: 22, paddingTop: 26 },
  footer: { alignItems: 'center', gap: 6 },
  footerText: { color: C.textMuted, fontFamily: Font.regular, fontSize: 13 },
});
