import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';

import { ApiError, errorMessage } from '@/api/client';
import { Chat } from '@/api/endpoints';

export function useOpenChat() {
  const [openingFor, setOpeningFor] = useState<number | null>(null);
  // Guards a fast double tap, which would otherwise push the same chat twice.
  const busy = useRef(false);

  const openChat = async (otherUserId: number, title: string) => {
    if (busy.current) return;
    busy.current = true;
    setOpeningFor(otherUserId);
    try {
      const { conversation_id } = await Chat.open(otherUserId);
      router.push({ pathname: '/chat/[id]', params: { id: conversation_id, name: title } });
    } catch (e) {
      const msg =
        e instanceof ApiError && e.status === 403
          ? 'You can only message companies you are connected with.'
          : errorMessage(e);
      Alert.alert('Unable to open chat', msg);
    } finally {
      busy.current = false;
      setOpeningFor(null);
    }
  };

  return { openChat, openingFor };
}
