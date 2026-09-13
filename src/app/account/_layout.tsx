import { Stack } from 'expo-router';

import { C } from '@/constants/theme';

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg }, animation: 'slide_from_right' }}
    />
  );
}
