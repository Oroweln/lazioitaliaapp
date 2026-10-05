import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { AuthHero } from '@/components/auth-hero';
import { VerifyEmailBanner } from '@/components/verify-email-banner';
import { FormScroll } from '@/components/form-scroll';
import { PrimaryButton, SecondaryButton, TextButton } from '@/components/ui/button';
import { Divider, Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { metal } from '@/components/ui/metal';
import { Screen } from '@/components/ui/screen';
import { ErrorBanner } from '@/components/ui/states';
import { Brand } from '@/constants/brand';
import { C, Font, Type } from '@/constants/theme';
import { useAuth, useMe } from '@/context/auth-context';

export default function PendingScreen() {
  const { refreshMe, logout } = useAuth();
  const me = useMe();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Owners only while pending: an invited admin whose own membership is still under review
  // does not get to reshape the company (the server enforces the same rule).
  const canEditCompany = me.business_role === 'owner';

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
        <AuthHero eyebrow="Membership under review" title="Your place on the map of" accent="Lazio." />
        <View style={styles.body}>
          <VerifyEmailBanner />
          <Card style={styles.card} edge>
            <View style={[styles.ring, metal('steel')]}>
              <Icon name="hourglass_top" size={32} color={C.nav} />
            </View>
            <View style={{ gap: 8, alignItems: 'center' }}>
              <Text style={Type.eyebrow}>Membership under review</Text>
              <Text style={[Type.title, { textAlign: 'center' }]}>Awaiting approval</Text>
              <Text style={[Type.bodyDim, { textAlign: 'center' }]}>
                Thank you{me.profile.name ? `, ${me.profile.name}` : ''}. Our team reviews every company before it joins
                the {Brand.name} network.
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
            <PrimaryButton title="Check status" onPress={check} loading={checking} icon="refresh" />
            {canEditCompany && (
              <SecondaryButton
                title="Complete company profile"
                icon="edit"
                onPress={() => router.push('/account/edit-business')}
              />
            )}
          </Card>
          <View style={styles.links}>
            <TextButton title="Account & security" onPress={() => router.push('/account/security')} />
            <TextButton title="Sign out" onPress={confirmLogout} />
          </View>
        </View>
      </FormScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 0, gap: 0 },
  body: { paddingHorizontal: 20, paddingTop: 22, gap: 20 },
  card: { gap: 18, padding: 24, paddingTop: 28, alignItems: 'stretch' },
  ring: {
    alignSelf: 'center',
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 10px 24px -14px rgba(3,95,105,0.8)',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  rowLabel: { ...Type.label, color: C.textMuted },
  rowValue: { color: C.text, fontFamily: Font.semibold, fontSize: 14, flexShrink: 1, textAlign: 'right' },
  message: { color: C.accentText, fontFamily: Font.medium, fontSize: 13, textAlign: 'center' },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 28 },
});
