import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { ApiError, getAccessToken, refreshSession } from '@/api/client';
import { APP_KEY, WS_URL } from '@/api/config';
import { useAuth } from '@/context/auth-context';

// `resync` fires on every successful (re)connect: pushes sent while no socket was open are
// never replayed, so screens must refetch whatever they show.
export type RealtimeEvent = { type: 'new_message'; conversation_id: number } | { type: 'resync' };
type Listener = (e: RealtimeEvent) => void;

const RealtimeContext = createContext<Set<Listener> | null>(null);
const RealtimeStatusContext = createContext<RealtimeStatus>('connecting');

export type RealtimeStatus = 'connected' | 'connecting';

const MIN_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;
// A socket that never opened means the device has no route to the server (airplane mode, lost
// wifi) — that costs the server nothing to retry, so those attempts get a short ceiling. Without
// it, a minute of airplane mode pushed the delay to the long ceiling and the app sat there doing
// nothing long after the radio came back: AppState never changes, so nothing cancelled the timer.
const MAX_OFFLINE_BACKOFF_MS = 5_000;
// A connection only counts as healthy after staying up this long. The server silently drops
// a user's oldest socket past its per-device cap; without this, a flapping connection would
// reconnect in a tight loop.
const STABLE_AFTER_MS = 30_000;
// Server ignores text frames after auth; this keeps proxies from closing an idle
// socket and surfaces a dead connection on the client side.
const KEEPALIVE_MS = 25_000;

type RNWebSocket = new (
  url: string,
  protocols: string[] | undefined,
  options: { headers: Record<string, string> },
) => WebSocket;

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { status, refreshMe } = useAuth();
  const [listeners] = useState(() => new Set<Listener>());
  const [live, setLive] = useState<RealtimeStatus>('connecting');
  const refreshMeRef = useRef(refreshMe);
  useEffect(() => {
    refreshMeRef.current = refreshMe;
  });

  useEffect(() => {
    if (status !== 'approved') return;

    let socket: WebSocket | null = null;
    let connecting = false;
    let stopped = false;
    let backoff = MIN_BACKOFF_MS;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let stableTimer: ReturnType<typeof setTimeout> | null = null;
    let keepaliveTimer: ReturnType<typeof setInterval> | null = null;

    const emit = (e: RealtimeEvent) => listeners.forEach((l) => l(e));

    const clearConnectionTimers = () => {
      if (stableTimer) clearTimeout(stableTimer);
      if (keepaliveTimer) clearInterval(keepaliveTimer);
      stableTimer = null;
      keepaliveTimer = null;
    };

    const scheduleReconnect = (offline = false) => {
      if (stopped || retryTimer || socket || connecting) return;
      const ceiling = offline ? MAX_OFFLINE_BACKOFF_MS : MAX_BACKOFF_MS;
      const delay = Math.min(backoff, ceiling) + Math.random() * 500;
      backoff = Math.min(backoff * 2, ceiling);
      retryTimer = setTimeout(() => {
        retryTimer = null;
        void connect();
      }, delay);
    };

    const closeSocket = () => {
      setLive('connecting');
      clearConnectionTimers();
      const s = socket;
      socket = null;
      if (s) {
        s.onclose = null;
        s.onmessage = null;
        s.onerror = null;
        s.close();
      }
    };

    const connect = async () => {
      if (stopped || socket || connecting || AppState.currentState !== 'active') return;
      connecting = true;
      let token: string;
      try {
        token = await getAccessToken();
      } catch (e) {
        connecting = false;
        // Couldn't even get a token: on a dead network that's a transport failure, not a rejection.
        const rejected = e instanceof ApiError && (e.status === 401 || e.status === 403);
        if (!rejected) scheduleReconnect(!(e instanceof ApiError));
        return;
      }
      connecting = false;
      if (stopped || socket || AppState.currentState !== 'active') return;

      const ws = new (WebSocket as unknown as RNWebSocket)(WS_URL, undefined, { headers: { 'X-App-Key': APP_KEY } });
      socket = ws;
      let authFailed = false;
      let inactive = false;
      let opened = false;

      ws.onopen = () => {
        opened = true;
        // The transport works, so the next failure starts its backoff from scratch. Staying
        // connected for STABLE_AFTER_MS is a separate signal, handled below.
        backoff = MIN_BACKOFF_MS;
        ws.send(JSON.stringify({ type: 'auth', token }));
      };
      ws.onmessage = (msg) => {
        let data: { type?: string; code?: string; conversation_id?: number };
        try {
          data = JSON.parse(String(msg.data));
        } catch {
          return;
        }
        if (data.type === 'connected') {
          setLive('connected');
          emit({ type: 'resync' });
          stableTimer = setTimeout(() => {
            backoff = MIN_BACKOFF_MS;
          }, STABLE_AFTER_MS);
          keepaliveTimer = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) ws.send('{"type":"ping"}');
          }, KEEPALIVE_MS);
        } else if (data.type === 'new_message' && typeof data.conversation_id === 'number') {
          emit({ type: 'new_message', conversation_id: data.conversation_id });
        } else if (data.type === 'error') {
          if (data.code === 'auth_failed') authFailed = true;
          if (data.code === 'account_inactive') inactive = true;
        }
      };
      ws.onerror = () => undefined;
      ws.onclose = () => {
        // A socket we already replaced or deliberately closed must not trigger a reconnect,
        // or it would evict the live connection on the server.
        if (socket !== ws) return;
        socket = null;
        setLive('connecting');
        clearConnectionTimers();
        if (stopped) return;
        if (inactive) {
          // Normally this moves the app to pending/signed-out and ends this effect. If the
          // account turns out to be fine (e.g. reinstated in the meantime), keep going.
          refreshMeRef.current().then(
            (me) => {
              if (me?.status === 'approved') scheduleReconnect();
            },
            () => scheduleReconnect(),
          );
          return;
        }
        if (authFailed) {
          refreshSession().then(
            () => scheduleReconnect(),
            (e) => {
              if (!(e instanceof ApiError && (e.status === 401 || e.status === 403))) scheduleReconnect();
            },
          );
          return;
        }
        scheduleReconnect(!opened);
      };
    };

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        if (retryTimer) {
          clearTimeout(retryTimer);
          retryTimer = null;
        }
        void connect();
      } else {
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = null;
        closeSocket();
      }
    });

    void connect();

    return () => {
      stopped = true;
      appStateSub.remove();
      if (retryTimer) clearTimeout(retryTimer);
      closeSocket();
    };
  }, [status, listeners]);

  return (
    <RealtimeContext.Provider value={listeners}>
      <RealtimeStatusContext.Provider value={live}>{children}</RealtimeStatusContext.Provider>
    </RealtimeContext.Provider>
  );
}

/// 'connecting' covers both "no socket yet" and "reconnecting after a drop"; screens use it to
/// say so rather than looking merely idle while the radio is off.
export function useRealtimeStatus() {
  return useContext(RealtimeStatusContext);
}

export function useRealtime(handler: Listener) {
  const listeners = useContext(RealtimeContext);
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  useEffect(() => {
    if (!listeners) return;
    const l: Listener = (e) => ref.current(e);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, [listeners]);
}
