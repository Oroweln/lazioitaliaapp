import { useCallback, useEffect, useRef, useState } from 'react';

import { errorMessage } from '@/api/client';

// refresh: pull-to-refresh spinner. silent: background update, errors ignored.
// retry: error screen "Try again" — back to the loading state.
type Mode = 'refresh' | 'silent' | 'retry';

// Minimal fetch-state hook; `key` changes trigger a fresh load.
export function useAsync<T>(fn: () => Promise<T>, key: unknown = null) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });

  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const requestId = useRef(0);

  const run = useCallback(async (mode: Mode) => {
    const id = ++requestId.current;
    if (mode === 'refresh') setRefreshing(true);
    if (mode === 'retry') {
      setError(null);
      setLoading(true);
    }
    try {
      const result = await fnRef.current();
      if (id !== requestId.current) return;
      setData(result);
      setError(null);
    } catch (e) {
      if (id !== requestId.current) return;
      if (mode !== 'silent') setError(errorMessage(e));
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const id = ++requestId.current;
    fnRef.current().then(
      (result) => {
        if (id !== requestId.current) return;
        setData(result);
        setError(null);
        setLoading(false);
      },
      (e) => {
        if (id !== requestId.current) return;
        setError(errorMessage(e));
        setLoading(false);
      },
    );
  }, [key]);

  return {
    data,
    setData,
    error,
    loading,
    refreshing,
    reload: useCallback(() => run('refresh'), [run]),
    silentReload: useCallback(() => run('silent'), [run]),
    retry: useCallback(() => run('retry'), [run]),
  };
}
