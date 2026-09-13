import { Stack } from 'expo-router';

import { C } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';

export default function AuthLayout() {
  const { status } = useAuth();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg }, animation: 'fade' }}>
      <Stack.Protected guard={status === 'signedOut'}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
      </Stack.Protected>
      <Stack.Protected guard={status === 'totp'}>
        <Stack.Screen name="totp" />
      </Stack.Protected>
    </Stack>
  );
}
