import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_800ExtraBold } from '@expo-google-fonts/inter/800ExtraBold';
import { MaterialSymbols_300Light } from '@expo-google-fonts/material-symbols/300Light';
import { Tinos_700Bold } from '@expo-google-fonts/tinos/700Bold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BrandLockup } from '@/components/brand';
import { PrimaryButton } from '@/components/ui/button';
import { ICON_FONT, markIconFontUnavailable } from '@/components/ui/icon';
import { EmptyState } from '@/components/ui/states';
import { Brand } from '@/constants/brand';
import { C, Font, Scheme } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { RealtimeProvider } from '@/context/realtime-context';

void SplashScreen.preventAutoHideAsync();

const baseNavTheme = Scheme === 'dark' ? DarkTheme : DefaultTheme;
const navTheme: Theme = {
  ...baseNavTheme,
  colors: {
    ...baseNavTheme.colors,
    primary: C.accent,
    background: C.bg,
    card: C.bg,
    text: C.text,
    border: C.divider,
    notification: C.danger,
  },
};

function RootNavigator() {
  const { status, bootError, retryBoot } = useAuth();
  // Icons and text render from these fonts; holding the splash until they're ready avoids blank
  // icons and a jump from the system font to Inter/Tinos.
  const [fontsLoaded, fontError] = useFonts({
    [ICON_FONT]: MaterialSymbols_300Light,
    [Font.regular]: Inter_400Regular,
    [Font.medium]: Inter_500Medium,
    [Font.semibold]: Inter_600SemiBold,
    [Font.bold]: Inter_700Bold,
    [Font.extrabold]: Inter_800ExtraBold,
    [Font.serif]: Tinos_700Bold,
  });
  const fontsReady = fontsLoaded || !!fontError;
  if (fontError) markIconFontUnavailable();

  useEffect(() => {
    if (fontsReady && (status !== 'loading' || bootError)) void SplashScreen.hideAsync();
  }, [fontsReady, status, bootError]);

  if (!fontsReady) return <View style={styles.boot} />;

  if (bootError) {
    return (
      <View style={styles.boot}>
        <BrandLockup tagline={false} tone="ink" />
        <EmptyState
          tone="ink"
          icon="cloud_off"
          title={`Can't reach ${Brand.name}`}
          message={bootError}
          action={<PrimaryButton title="Retry" onPress={retryBoot} icon="refresh" />}
        />
      </View>
    );
  }

  // Only visible after "Retry" — on first launch the native splash still covers it.
  if (status === 'loading') {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={C.onInk} size="large" />
      </View>
    );
  }

  const signedIn = status === 'pending' || status === 'approved';

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg }, animation: 'fade_from_bottom' }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={status === 'signedOut' || status === 'totp'}>
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      </Stack.Protected>
      <Stack.Protected guard={status === 'pending'}>
        <Stack.Screen name="pending" options={{ animation: 'fade' }} />
      </Stack.Protected>
      <Stack.Protected guard={status === 'approved'}>
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="business/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="chat/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="account" options={{ animation: 'slide_from_right' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider style={{ backgroundColor: C.bg }}>
      <ThemeProvider value={navTheme}>
        {/* Every screen's top edge is deep teal (header bars, heroes), so status bar icons are light. */}
        <StatusBar style="light" />
        <AuthProvider>
          <RealtimeProvider>
            <RootNavigator />
          </RealtimeProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // Matches the native splash (deep teal with the logo box).
  boot: { flex: 1, backgroundColor: C.nav, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
