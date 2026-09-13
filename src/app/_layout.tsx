import { MaterialSymbols_300Light } from '@expo-google-fonts/material-symbols/300Light';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GoldButton } from '@/components/ui/button';
import { Backdrop } from '@/components/ui/screen';
import { ICON_FONT, markIconFontUnavailable } from '@/components/ui/icon';
import { EmptyState } from '@/components/ui/states';
import { C } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { RealtimeProvider } from '@/context/realtime-context';

void SplashScreen.preventAutoHideAsync();

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: C.accentLight,
    background: C.bg,
    card: C.bg,
    text: C.text,
    border: C.divider,
    notification: C.accent,
  },
};

function RootNavigator() {
  const { status, bootError, retryBoot } = useAuth();
  // Icons render from this font; holding the splash until it's ready avoids blank icons.
  const [fontsLoaded, fontError] = useFonts({ [ICON_FONT]: MaterialSymbols_300Light });
  const fontsReady = fontsLoaded || !!fontError;
  if (fontError) markIconFontUnavailable();

  useEffect(() => {
    if (fontsReady && (status !== 'loading' || bootError)) void SplashScreen.hideAsync();
  }, [fontsReady, status, bootError]);

  if (!fontsReady) return <View style={styles.boot} />;

  if (bootError) {
    return (
      <View style={styles.boot}>
        <Backdrop />
        <Image source={require('@/assets/images/zoe-mark.png')} style={styles.mark} />
        <EmptyState
          icon="cloud_off"
          title="Can't reach Zoe Milano"
          message={bootError}
          action={<GoldButton title="Retry" onPress={retryBoot} icon="refresh" />}
        />
      </View>
    );
  }

  // Only visible after "Retry" — on first launch the native splash still covers it.
  if (status === 'loading') {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={C.accentLight} size="large" />
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
  boot: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  mark: { width: 72, height: 72, resizeMode: 'contain' },
});
