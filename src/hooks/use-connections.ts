import { useCallback, useEffect, useSyncExternalStore } from 'react';

import { errorMessage, session } from '@/api/client';
import { ConnectionsApi } from '@/api/endpoints';
import type { Connections } from '@/api/types';

// Shared across screens (Connections tab, company pages) so each view doesn't refetch
// every request the company has ever sent or received.

const PAGE = 100;
const MAX_PAGES = 20;

type Snapshot = { data: Connections | null; error: string | null; fetchedAt: number; epoch: number };

let snapshot: Snapshot = { data: null, error: null, fetchedAt: 0, epoch: -1 };
let inflight: { promise: Promise<Connections>; startedAt: number } | null = null;
let invalidatedAt = 0;
const subscribers = new Set<() => void>();

const emit = () => subscribers.forEach((s) => s());

async function fetchAll(): Promise<Connections> {
  const sent: Connections['sent'] = [];
  const received: Connections['received'] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await ConnectionsApi.list({ limit: PAGE, offset: page * PAGE });
    sent.push(...res.sent);
    received.push(...res.received);
    if (res.sent.length < PAGE && res.received.length < PAGE) break;
  }
  return { sent, received };
}

function resetIfSessionChanged() {
  const epoch = session.epoch();
  if (snapshot.epoch !== epoch) {
    snapshot = { data: null, error: null, fetchedAt: 0, epoch };
    inflight = null;
  }
}

export function loadConnections(maxAgeMs = 0): Promise<Connections> {
  resetIfSessionChanged();
  const epoch = snapshot.epoch;
  const fresh = snapshot.data && snapshot.fetchedAt > invalidatedAt && Date.now() - snapshot.fetchedAt < maxAgeMs;
  if (fresh) return Promise.resolve(snapshot.data!);
  // Reuse an in-flight fetch only if it started after the last mutation.
  if (inflight && inflight.startedAt >= invalidatedAt) return inflight.promise;

  const startedAt = Date.now();
  const promise = fetchAll().then(
    (data) => {
      if (session.epoch() === epoch && inflight?.promise === promise) {
        snapshot = { data, error: null, fetchedAt: startedAt, epoch };
        emit();
      }
      return data;
    },
    (e) => {
      if (session.epoch() === epoch && inflight?.promise === promise) {
        snapshot = { ...snapshot, error: errorMessage(e) };
        emit();
      }
      throw e;
    },
  );
  promise
    .finally(() => {
      if (inflight?.promise === promise) inflight = null;
    })
    .catch(() => undefined);
  inflight = { promise, startedAt };
  return promise;
}

// Call after sending or answering a request so the next read refetches.
export function invalidateConnections() {
  invalidatedAt = Date.now() + 1;
}

function subscribe(cb: () => void) {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

export function useConnections(maxAgeMs = 30_000) {
  const current = useSyncExternalStore(subscribe, () => snapshot);
  const sameSession = current.epoch === session.epoch();

  useEffect(() => {
    loadConnections(maxAgeMs).catch(() => undefined);
  }, [maxAgeMs]);

  const reload = useCallback(() => loadConnections(0), []);

  return {
    data: sameSession ? current.data : null,
    error: sameSession ? current.error : null,
    reload,
  };
}
