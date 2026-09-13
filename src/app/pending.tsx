import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { BrandLockup } from '@/components/brand';
import { FormScroll } from '@/components/form-scroll';
import { GoldButton, OutlineButton, TextButton } from '@/components/ui/button';
import { Divider, GlassCard } from '@/components/ui/card';
import { GoldText } from '@/components/ui/gold-text';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ErrorBanner } from '@/components/ui/states';
import { C, Type } from '@/constants/theme';
import { useAuth, useMe } from '@/context/auth-context';

export default function PendingScreen() {
  const { refreshMe, logout } = useAuth();
  const me = useMe();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canEditCompany = me.business_role === 'owner' || me.business_role === 'admin';

  const check = async () => {
    setChecking(true);
    setError(null);
    setMessage(null);
    try {
      const next = await refreshMe();
      if (next?.status === 'pending') setMessage('Still under review. We will let you in as soon as you are approved.');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setChecking(false);
    }
  };

  const confirmLogout = () =>
    Alert.alert('Sign out', 'Do you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void logout() },
    ]);

  return (
    <Screen edges={['top', 'bottom']}>
      <FormScroll contentStyle={styles.content}>
        <BrandLockup tagline={false} />
        <GlassCard style={styles.card}>
          <View style={styles.ring}>
            <Icon name="hourglass_top" size={30} />
          </View>
          <View style={{ gap: 8, alignItems: 'center' }}>
            <GoldText style={Type.eyebrow}>Membership under review</GoldText>
            <Text style={[Type.title, { textAlign: 'center' }]}>Awaiting approval</Text>
            <Text style={[Type.bodyDim, { textAlign: 'center' }]}>
              Thank you{me.profile.name ? `, ${me.profile.name}` : ''}. Our team reviews every company before it joins
              the Zoe Milano network.
            </Text>
          </View>
          {me.business && (
            <>
              <Divider />
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Company</Text>
                <Text style={styles.rowValue}>{me.business.name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Account</Text>
                <Text style={styles.rowValue}>{me.email}</Text>
              </View>
            </>
          )}
          {message && <Text style={styles.message}>{message}</Text>}
          <ErrorBanner message={error} />
          <GoldButton title="Check status" onPress={check} loading={checking} icon="refresh" />
          {canEditCompany && (
            <OutlineButton
              title="Complete company profile"
              icon="edit"
              onPress={() => router.push('/account/edit-business')}
            />
          )}
        </GlassCard>
        <View style={styles.links}>
          <TextButton title="Account & security" onPress={() => router.push('/account/security')} />
          <TextButton title="Sign out" onPress={confirmLogout} />
        </View>
      </FormScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: 24 },
  card: { gap: 18, padding: 24, alignItems: 'stretch' },
  ring: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: C.borderGold,
    backgroundColor: C.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  rowLabel: { ...Type.label, color: C.textMuted },
  rowValue: { color: C.text, fontSize: 14, flexShrink: 1, textAlign: 'right' },
  message: { color: C.accentLight, fontSize: 13, textAlign: 'center' },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 28 },
});
