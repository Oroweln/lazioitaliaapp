import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { errorMessage } from '@/api/client';
import { Account } from '@/api/endpoints';
import { FormScroll } from '@/components/form-scroll';
import { GoldButton } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/card';
import { ScreenHeader } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ErrorBanner } from '@/components/ui/states';
import { Type } from '@/constants/theme';
import { useAuth, useMe } from '@/context/auth-context';

export default function EditProfileScreen() {
  const me = useMe();
  const { refreshMe } = useAuth();
  const [name, setName] = useState(me.profile.name ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await Account.updateName(name.trim() || null);
      await refreshMe();
      router.back();
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Your name" back />
      <FormScroll>
        <GlassCard style={{ gap: 16 }}>
          <Text style={Type.bodyDim}>Your name is shown to people you chat with, alongside your company.</Text>
          <Input label="Full name" value={name} onChangeText={setName} placeholder="Name Surname" autoComplete="name" />
          <ErrorBanner message={error} />
          <GoldButton title="Save" onPress={save} loading={busy} />
        </GlassCard>
      </FormScroll>
    </Screen>
  );
}
