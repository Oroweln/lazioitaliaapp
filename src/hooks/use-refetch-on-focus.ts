import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

// Skips the first focus, since screens already load on mount.
export function useRefetchOnFocus(refetch: () => void) {
  const first = useRef(true);
  const ref = useRef(refetch);
  useEffect(() => {
    ref.current = refetch;
  });
  useFocusEffect(
    useCallback(() => {
      if (first.current) {
        first.current = false;
        return;
      }
      ref.current();
    }, []),
  );
}
