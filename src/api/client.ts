import { FileSystemUploadType, uploadAsync } from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';

import { API_BASE, APP_KEY } from '@/api/config';
import type { TokenPair } from '@/api/types';

const REFRESH_KEY = 'zoe.refresh_token';
const REQUEST_TIMEOUT_MS = 15_000;
// A 429 asking for a short wait is retried once transparently; longer waits surface to the caller.
const MAX_AUTO_RETRY_AFTER_S = 8;

export class ApiError extends Error {
  status: number;
  code?: string;
  fields?: Record<string, string>;
  retryAfter?: number;

  constructor(status: number, message: string, code?: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

type SessionListener = { onSignedOut: () => void; onNotApproved: () => void };

let accessToken: string | null = null;
let refreshToken: string | null = null;
let inflightRefresh: Promise<void> | null = null;
let listener: SessionListener | null = null;
// Bumped on every sign-out. Work started under an older epoch (a refresh or request that
// was in flight when the user signed out) must not store tokens or sign out a newer session.
let epoch = 0;
// Server clock minus device clock, learned from each fresh token's `iat`, so a wrong
// device clock doesn't make every token look expired (or never expired).
let clockSkewMs = 0;

export const session = {
  setListener(l: SessionListener | null) {
    listener = l;
  },
  async restore(): Promise<boolean> {
    refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
    return refreshToken != null;
  },
  async store(tokens: Pick<TokenPair, 'access_token' | 'refresh_token'>) {
    const claims = decodeClaims(tokens.access_token);
    if (claims && typeof claims.iat === 'number') clockSkewMs = claims.iat * 1000 - Date.now();
    accessToken = tokens.access_token;
    refreshToken = tokens.refresh_token;
    await SecureStore.setItemAsync(REFRESH_KEY, tokens.refresh_token);
  },
  async clear() {
    epoch++;
    accessToken = null;
    refreshToken = null;
    inflightRefresh = null;
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
  refreshToken: () => refreshToken,
  epoch: () => epoch,
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
  auth?: boolean;
};

function buildUrl(path: string, query?: RequestOptions['query']) {
  const params = Object.entries(query ?? {})
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return `${API_BASE}${path}${params.length ? `?${params.join('&')}` : ''}`;
}

async function send(path: string, opts: RequestOptions, token: string | null) {
  const headers: Record<string, string> = { 'X-App-Key': APP_KEY, Accept: 'application/json' };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(buildUrl(path, opts.query), {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(0, 'Unable to reach the server. Check your connection.');
  } finally {
    clearTimeout(timer);
  }
}

// Axum extractor rejections and rate-limit responses are plain text, not JSON.
async function toError(res: Response): Promise<ApiError> {
  const text = await res.text().catch(() => '');
  let err: ApiError;
  try {
    const json = JSON.parse(text);
    err = new ApiError(res.status, json.error ?? 'Request failed', json.code, json.fields);
  } catch {
    err =
      res.status === 429
        ? new ApiError(429, 'Too many requests — please wait a moment.')
        : new ApiError(res.status, text || `Request failed (${res.status})`);
  }
  if (res.status === 429) {
    const seconds = Number(res.headers.get('retry-after'));
    err.retryAfter = Number.isFinite(seconds) && seconds > 0 ? seconds : 1;
  }
  return err;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function doRefresh() {
  const token = refreshToken;
  const startedIn = epoch;
  if (!token) throw new ApiError(401, 'Not signed in');
  const res = await send('/auth/refresh', { method: 'POST', body: { refresh_token: token } }, null);
  if (!res.ok) throw await toError(res);
  const tokens = (await res.json()) as TokenPair;
  // Signed out while this was in flight: persisting the new token would resurrect the session.
  if (startedIn !== epoch) throw new ApiError(401, 'Signed out');
  await session.store(tokens);
}

// Single-flight: a rotated refresh token must never be presented twice, or the server
// treats it as a replay and revokes the whole token family.
export function refreshSession(): Promise<void> {
  if (!inflightRefresh) {
    const p = doRefresh().finally(() => {
      if (inflightRefresh === p) inflightRefresh = null;
    });
    inflightRefresh = p;
  }
  return inflightRefresh;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

// JWT payloads are ASCII JSON, so a byte-per-char base64url decode is enough.
function base64UrlDecode(input: string) {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const ch of input) {
    const idx = B64.indexOf(ch);
    if (idx < 0) continue;
    value = (value << 6) | idx;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out += String.fromCharCode((value >> bits) & 0xff);
    }
  }
  return out;
}

function decodeClaims(token: string): { exp?: unknown; iat?: unknown } | null {
  try {
    return JSON.parse(base64UrlDecode(token.split('.')[1]));
  } catch {
    return null;
  }
}

function tokenExpiresWithin(token: string, seconds: number) {
  const exp = decodeClaims(token)?.exp;
  if (typeof exp !== 'number') return true;
  return exp * 1000 - (Date.now() + clockSkewMs) < seconds * 1000;
}

function isSessionDead(e: unknown) {
  return e instanceof ApiError && (e.status === 401 || e.status === 403);
}

// For the WebSocket handshake, which can't recover from an expired token mid-request.
export async function getAccessToken(): Promise<string> {
  if (!accessToken || tokenExpiresWithin(accessToken, 30)) await refreshSession();
  if (!accessToken) throw new ApiError(401, 'Not signed in');
  return accessToken;
}

async function refreshOrSignOut(startedIn: number) {
  try {
    await refreshSession();
  } catch (e) {
    if (isSessionDead(e) && startedIn === epoch) listener?.onSignedOut();
    throw e;
  }
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const auth = opts.auth ?? true;
  const startedIn = epoch;

  if (auth && refreshToken && (!accessToken || tokenExpiresWithin(accessToken, 10))) {
    await refreshOrSignOut(startedIn);
  }

  let usedToken = auth ? accessToken : null;
  let res = await send(path, opts, usedToken);

  if (res.status === 401 && auth && refreshToken && startedIn === epoch) {
    // Another request may already have rotated the token while this one was in flight.
    if (accessToken === usedToken) await refreshOrSignOut(startedIn);
    usedToken = accessToken;
    res = await send(path, opts, usedToken);
  }

  if (res.status === 429) {
    const seconds = Number(res.headers.get('retry-after'));
    // The limiter rejects before the handler runs, so retrying a write can't duplicate it.
    if (Number.isFinite(seconds) && seconds > 0 && seconds <= MAX_AUTO_RETRY_AFTER_S) {
      await sleep(seconds * 1000);
      res = await send(path, opts, auth ? accessToken : null);
    }
  }

  return finish<T>(res, auth, startedIn);
}

async function finish<T>(res: Response, auth: boolean, startedIn: number): Promise<T> {
  if (!res.ok) {
    const err = await toError(res);
    if (auth && startedIn === epoch) {
      if (err.code === 'account_suspended' || err.status === 401) listener?.onSignedOut();
      else if (err.code === 'not_approved') listener?.onNotApproved();
    }
    throw err;
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export type UploadFile = { uri: string; name: string; type: string };

type UploadResponse = { status: number; body: string };

// Native multipart upload rather than fetch + FormData: React Native's fetch cannot read the
// content:// URIs the image picker returns and fails with an opaque "Network request failed"
// before anything reaches the network.
async function sendUpload(path: string, file: UploadFile, token: string | null): Promise<UploadResponse> {
  const headers: Record<string, string> = { 'X-App-Key': APP_KEY, Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await uploadAsync(`${API_BASE}${path}`, file.uri, {
      httpMethod: 'POST',
      uploadType: FileSystemUploadType.MULTIPART,
      fieldName: 'file',
      mimeType: file.type,
      headers,
    });
    return { status: res.status, body: res.body ?? '' };
  } catch (e) {
    // Keep the real reason: this used to be reported as a connection problem, which sent us
    // looking at the server for a failure that never left the device.
    throw new ApiError(0, `Upload failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/// Same handling as `finish`, for a response that isn't a `Response`.
function finishUpload<T>(res: UploadResponse, startedIn: number): T {
  if (res.status < 200 || res.status >= 300) {
    let err: ApiError;
    try {
      const json = JSON.parse(res.body);
      err = new ApiError(res.status, json.error ?? 'Upload failed', json.code, json.fields);
    } catch {
      err = new ApiError(res.status, res.body || `Upload failed (${res.status})`);
    }
    if (startedIn === epoch) {
      if (err.code === 'account_suspended' || err.status === 401) listener?.onSignedOut();
      else if (err.code === 'not_approved') listener?.onNotApproved();
    }
    throw err;
  }
  return (res.body ? JSON.parse(res.body) : undefined) as T;
}

/// Multipart POST. Always authenticated — the only uploads are account-owned files.
export async function upload<T>(path: string, file: UploadFile): Promise<T> {
  const startedIn = epoch;

  if (refreshToken && (!accessToken || tokenExpiresWithin(accessToken, 10))) {
    await refreshOrSignOut(startedIn);
  }

  let usedToken = accessToken;
  let res = await sendUpload(path, file, usedToken);

  if (res.status === 401 && refreshToken && startedIn === epoch) {
    if (accessToken === usedToken) await refreshOrSignOut(startedIn);
    usedToken = accessToken;
    res = await sendUpload(path, file, usedToken);
  }

  return finishUpload<T>(res, startedIn);
}

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 422 && e.fields) {
      return `Please check: ${Object.keys(e.fields).join(', ').replace(/_/g, ' ')}`;
    }
    return e.message;
  }
  return 'Something went wrong';
}
