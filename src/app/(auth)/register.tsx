import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { ApiError, errorMessage } from '@/api/client';
import { FormScroll } from '@/components/form-scroll';
import { OptionPicker } from '@/components/option-picker';
import { GoldButton } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/card';
import { GoldText } from '@/components/ui/gold-text';
import { ScreenHeader } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { ErrorBanner } from '@/components/ui/states';
import { INDUSTRIES } from '@/constants/industries';
import { C, Type } from '@/constants/theme';
import { REGISTERED_LOGIN_FAILED, useAuth } from '@/context/auth-context';

type Mode = 'company' | 'invite';
const INDUSTRY_OPTIONS = INDUSTRIES.map((i) => ({ value: i, label: i }));

export default function RegisterScreen() {
  const { register } = useAuth();
  const [mode, setMode] = useState<Mode>('company');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!fullName.trim()) return 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Enter a valid email address.';
    if (password.length < 12) return 'Password must be at least 12 characters.';
    if (mode === 'company' && !companyName.trim()) return 'Enter your company name.';
    if (mode === 'invite' && !inviteCode.trim()) return 'Enter your invite code.';
    return null;
  };

  const submit = async () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await register({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        ...(mode === 'company'
          ? { name: companyName.trim(), industry: industry ?? undefined, location: location.trim() || undefined }
          : { name: fullName.trim(), invite_token: inviteCode.trim() }),
      });
    } catch (e) {
      if (e instanceof ApiError && e.code === REGISTERED_LOGIN_FAILED) {
        setBusy(false);
        Alert.alert('Account created', e.message, [{ text: 'Sign in', onPress: () => router.back() }]);
        return;
      }
      const msg = errorMessage(e);
      setError(
        msg === 'Registration failed'
          ? mode === 'invite'
            ? 'Registration failed. The invite code may be invalid or expired, or the email is already in use.'
            : 'Registration failed. This email may already be registered.'
          : msg,
      );
      setBusy(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Request membership" back />
      <FormScroll>
        <View style={{ gap: 6 }}>
          <GoldText style={Type.eyebrow}>Join the network</GoldText>
          <Text style={Type.title}>Create your account</Text>
          <Text style={Type.bodyDim}>
            Every member is reviewed by Zoe Milano before gaining access to the network.
          </Text>
        </View>

        <Segmented<Mode>
          value={mode}
          onChange={setMode}
          options={[
            { value: 'company', label: 'New company' },
            { value: 'invite', label: 'Invite code' },
          ]}
        />

        <GlassCard style={styles.card}>
          <GoldText style={Type.eyebrow}>About you</GoldText>
          <Input label="Full name" value={fullName} onChangeText={setFullName} placeholder="Name Surname" autoComplete="name" />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@company.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 12 characters"
            secureTextEntry
            autoComplete="new-password"
          />
        </GlassCard>

        {mode === 'company' ? (
          <GlassCard style={styles.card}>
            <GoldText style={Type.eyebrow}>Your company</GoldText>
            <Input label="Company name" value={companyName} onChangeText={setCompanyName} placeholder="Company S.r.l." />
            <OptionPicker
              label="Industry"
              value={industry}
              options={INDUSTRY_OPTIONS}
              placeholder="Select industry"
              onChange={setIndustry}
            />
            <Input label="Location" value={location} onChangeText={setLocation} placeholder="Milan, Italy" />
          </GlassCard>
        ) : (
          <GlassCard style={styles.card}>
            <GoldText style={Type.eyebrow}>Join your company</GoldText>
            <Text style={styles.hint}>Ask your company owner or admin for an invite code from their Profile.</Text>
            <Input
              label="Invite code"
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="Paste invite code"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </GlassCard>
        )}

        <ErrorBanner message={error} />
        <GoldButton title="Submit request" onPress={submit} loading={busy} />
      </FormScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16, padding: 22 },
  hint: { color: C.textDim, fontSize: 13, lineHeight: 19 },
});
