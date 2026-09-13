import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { ApiError, refreshSession, session } from '@/api/client';
import { Account, Auth } from '@/api/endpoints';
import type { Me, RegisterBody } from '@/api/types';

export const REGISTERED_LOGIN_FAILED = 'registered_login_failed';

export type AuthStatus = 'loading' | 'signedOut' | 'totp' | 'pending' | 'approved';

type AuthContextType = {
  status: AuthStatus;
  me: Me | null;
  bootError: string | null;
  retryBoot: () => void;
  login: (email: string, password: string) => Promise<void>;
  verifyTotp: (code: string) => Promise<void>;
  cancelTotp: () => void;
  register: (body: RegisterBody) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<Me | null>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [me, setMe] = useState<Me | null>(null);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);
  const [bootAttempt, setBootAttempt] = useState(0);

  // `me` is deliberately left in place: signed-in screens can still render once while the
  // navigator swaps them out, and `status` alone decides what is reachable.
  const signOutLocally = useCallback(async () => {
    await session.clear();
    setPendingToken(null);
    setStatus('signedOut');
  }, []);

  const applyMe = useCallback(
    async (next: Me) => {
      if (next.status === 'suspended') {
        await signOutLocally();
        throw new ApiError(403, 'This account has been suspended.', 'account_suspended');
      }
      // Keep the previous object when nothing changed, so a routine refresh doesn't
      // re-render every screen that reads the auth context.
      setMe((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
      setStatus(next.status === 'approved' ? 'approved' : 'pending');
      return next;
    },
    [signOutLocally],
  );

  const refreshMe = useCallback(async () => {
    try {
      return await applyMe(await Account.me());
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.code === 'account_suspended')) return null;
      throw e;
    }
  }, [applyMe]);

  useEffect(() => {
    session.setListener({
      onSignedOut: () => void signOutLocally(),
      onNotApproved: () => setStatus((s) => (s === 'approved' ? 'pending' : s)),
    });
    return () => session.setListener(null);
  }, [signOutLocally]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBootError(null);
      try {
        if (!(await session.restore())) {
          if (!cancelled) setStatus('signedOut');
          return;
        }
        await refreshSession();
        const next = await Account.me();
        if (!cancelled) await applyMe(next);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          await signOutLocally();
        } else {
          setBootError(e instanceof ApiError ? e.message : 'Unable to start the app.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bootAttempt, applyMe, signOutLocally]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await Auth.login(email.trim(), password);
      if (res.requires_totp && res.pending_token) {
        setPendingToken(res.pending_token);
        setStatus('totp');
        return;
      }
      await session.store({ access_token: res.access_token!, refresh_token: res.refresh_token! });
      await applyMe(await Account.me());
    },
    [applyMe],
  );

  const verifyTotp = useCallback(
    async (code: string) => {
      if (!pendingToken) throw new ApiError(401, 'Your sign-in expired. Please start again.');
      const tokens = await Auth.verifyTotp(pendingToken, code);
      setPendingToken(null);
      await session.store(tokens);
      await applyMe(await Account.me());
    },
    [pendingToken, applyMe],
  );

  const cancelTotp = useCallback(() => {
    setPendingToken(null);
    setStatus('signedOut');
  }, []);

  const register = useCallback(
    async (body: RegisterBody) => {
      await Auth.register(body);
      try {
        await login(body.email, body.password);
      } catch {
        // The account exists now; retrying registration would only fail as a duplicate.
        throw new ApiError(0, 'Your account was created, but signing in failed. Please sign in.', REGISTERED_LOGIN_FAILED);
      }
    },
    [login],
  );

  // Local sign-out never waits on the network; revoking the token server-side is best-effort.
  const logout = useCallback(async () => {
    const token = session.refreshToken();
    await signOutLocally();
    if (token) void Auth.logout(token).catch(() => undefined);
  }, [signOutLocally]);

  const deleteAccount = useCallback(async () => {
    await Account.delete();
    await signOutLocally();
  }, [signOutLocally]);

  const value = useMemo(
    () => ({
      status,
      me,
      bootError,
      retryBoot: () => setBootAttempt((n) => n + 1),
      login,
      verifyTotp,
      cancelTotp,
      register,
      logout,
      refreshMe,
      deleteAccount,
    }),
    [status, me, bootError, login, verifyTotp, cancelTotp, register, logout, refreshMe, deleteAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function useMe(): Me {
  const { me } = useAuth();
  if (!me) throw new Error('useMe requires a signed-in user');
  return me;
}
