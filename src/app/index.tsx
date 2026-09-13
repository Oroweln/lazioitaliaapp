import { Redirect } from 'expo-router';

import { useAuth } from '@/context/auth-context';

export default function Index() {
  const { status } = useAuth();
  if (status === 'approved') return <Redirect href="/discover" />;
  if (status === 'pending') return <Redirect href="/pending" />;
  if (status === 'totp') return <Redirect href="/totp" />;
  return <Redirect href="/login" />;
}
