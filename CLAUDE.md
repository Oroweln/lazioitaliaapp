# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

`zoe-app` — the Android-first Expo (SDK 57, expo-router) client for the Zoe Milano B2B network. It is the
frontend of the Rust backend two directories up (`../../`, see that repo's `CLAUDE.md` for the server side):
real login/registration, Discover, company connections and live chat. The visual identity mirrors the Zoe
Milano website (github.com/Oroweln/zoemilanocomv2): **dark-only** navy + champagne gold. There is no light
theme and no white surface anywhere — keep it that way.

## Commands

```bash
npx expo run:android   # build + install the native Android app (target platform)
npm run lint           # expo lint (eslint-config-expo, includes React Compiler hook rules)
npx tsc --noEmit       # type-check
```

Do NOT use `npm run android` / `npm run ios` for real testing — use the native build. No test runner is
configured. Web is not a target (the WebSocket needs an `X-App-Key` upgrade header browsers can't send).

Backend for local dev: `cd ../.. && cargo run` (needs Postgres; see server `CLAUDE.md`). No users are seeded —
register in the app, then approve via SQL (`users.status='approved'`, `businesses.approved=true`) or an admin
account calling `POST /api/v2/admin/users/{id}/approve`.

### Configuration

`.env` (gitignored; copy `.env.example`): `EXPO_PUBLIC_API_URL` (server origin, no `/api/v2`; `10.0.2.2` =
host from the emulator, use a LAN IP on a physical device) and `EXPO_PUBLIC_APP_KEY` (tenant slug,
`zoemilano`). Read in `src/api/config.ts`. Debug builds allow cleartext HTTP; a release build needs HTTPS.

## Architecture

### Routing and auth guards (`src/app/`)

The root `_layout.tsx` renders nothing until auth bootstraps (native splash stays up), then uses
`Stack.Protected` guards keyed on `useAuth().status`:

- `signedOut` / `totp` → `(auth)/` (login, register, totp; nested guards inside `(auth)/_layout.tsx`)
- `pending` → `pending.tsx` (awaiting admin approval)
- `approved` → `(tabs)/` (discover, connections, messages, profile) plus full-screen `business/[id]` and
  `chat/[id]` (pushed over the tabs so the tab bar hides)
- `pending` or `approved` → `account/` (edit-business, edit-profile, invites, security)

`index.tsx` redirects by status and is the anchor the router falls back to when a guard flips. Navigation
after login/logout happens by changing `status`, never by `router.replace`.

### API layer (`src/api/`)

- `types.ts` mirrors the server exactly: **snake_case fields, integer ids, ISO timestamps**. Don't camelCase.
- `client.ts` `api<T>()` adds `X-App-Key` + bearer token, aborts after 15 s, and parses JSON *or* plain-text
  errors (Axum extractor rejections and 429s are not JSON) into `ApiError {status, code, fields, retryAfter}`.
  Access token lives in memory only; the refresh token is in `expo-secure-store`. Tokens are refreshed
  proactively near `exp` (corrected for device clock skew via `iat`) and on 401 via a **single-flight**
  `refreshSession()`, skipping the refresh if another request already rotated the token — never refresh
  concurrently: presenting an already-rotated refresh token makes the server revoke the whole token family.
  A 429 with `retry-after` ≤ 8 s is retried once transparently.
- `session.epoch()` increments on every sign-out. Anything started under an older epoch (an in-flight refresh or
  a late 401) must not store tokens or sign out the new session; module-level caches (e.g.
  `hooks/use-connections.ts`) reset when the epoch changes.
- Session-level errors are routed through a listener set by `AuthProvider`: `code: account_suspended` or an
  unrecoverable 401 → signed out; `code: not_approved` → status `pending`. A plain 403 is an ordinary
  permission denial and must not sign the user out.
- `endpoints.ts` groups typed calls (`Auth`, `Account`, `Company`, `Discover`, `ConnectionsApi`, `Chat`).

### Auth state (`src/context/auth-context.tsx`)

Status comes from the live `GET /profile` (`me.status`), not token claims. Login may return
`requires_totp` + `pending_token` → status `totp` → `verifyTotp`. `register` creates the account then logs in
(new accounts are `pending` but do receive tokens). `useMe()` is for screens that are only reachable signed in;
`me` is intentionally not cleared on sign-out so screens being unmounted don't crash.

### Realtime (`src/context/realtime-context.tsx`)

One WebSocket while `approved`: connects with the `X-App-Key` header (React Native's `WebSocket` 3rd-arg
`headers`), sends `{"type":"auth","token"}` as the first frame, closes in background and reconnects on
foreground. Invariants that keep it from reconnect-looping: at most one socket or connect attempt at a time,
close events from a socket that is no longer current are ignored, and backoff only resets after a connection has
stayed up 30 s. A text keepalive goes out every 25 s. Server pushes carry no payload (`new_message` +
`conversation_id` only); screens subscribe with `useRealtime()` and refetch. A synthetic `resync` event fires on
*every* successful connect (pushes sent while no socket was open are never replayed), and screens must refetch on
it. The chat thread pages backwards until the newest page overlaps what's on screen, and only replaces the list
(bumping a generation that cancels in-flight "load older") after a very long absence.

### Backend behaviour the UI depends on

- **Chat writes (start conversation, send) are limited to 30/min per user**; reads are not. Pushes are still
  coalesced (Messages list only refetches while focused, chat thread debounces) — don't add polling.
- Unread counts come from the server (`unread_count` in `GET /chat`); the chat thread reports progress with
  `POST /chat/{id}/read {last_message_id}`.
- Conversations are between users; `GET /chat` includes `other_business_name`. Received connection requests
  include `requester_business_id`, used for relation matching in `utils/connections.ts`.
- Connections are cached app-wide in `hooks/use-connections.ts` (pages through all results). Call
  `invalidateConnections()` after sending or answering a request.
- Connection requests are accepted/declined by the **target company's owner/admin** (`PATCH /connections/{id}`),
  not by a platform admin, despite the `pending_admin` status name.
- Discover filters industry by case-insensitive exact match, so registration, company editing and the Discover
  chips must all use `src/constants/industries.ts`.
- `PUT /business` / `PUT /profile` use absent-vs-null semantics: `account/edit-business.tsx` sends only changed
  fields and `null` to clear. Website must be a full URL (`normalizeWebsite` adds `https://`).

### Theme (`src/constants/theme.ts`, `src/components/ui/`)

Single palette `C` (values from the website's `app.css`: bg `#0d0d1a`, cream text `#f5ecd3`, gold
`#c28e1a`/`#e0b347`), `Gradients` (gold text, CTA, skybox backdrop), `Radius`, `Type` presets. Build screens
from the primitives: `Screen` (navy backdrop with the gold skybox glow + safe area), `ScreenHeader`,
`GlassCard`/`Divider`, `GoldButton`/`OutlineButton`/`TextButton`, `Input`, `GoldText` (masked gradient text —
keep to headings/eyebrows, not list rows), `Avatar`, `Tag`, `Segmented`/`Chip`, `Icon`, and `states.tsx`
(loading/empty/error, gold `RefreshControl`). `Icon` renders Material Symbols (300 Light) as text from a font the
root layout loads before hiding the splash (it is also embedded natively via the `expo-font` plugin in
`app.json`; the file name must match `ICON_FONT`); to use a new icon add its codepoint to `GLYPHS` in `icon.tsx`.
Every new `TextInput` needs `keyboardAppearance="dark"` and themed placeholder/cursor colors (the `Input` primitive already does this); every navigator needs `contentStyle`/`sceneStyle`
`backgroundColor: C.bg` so transitions never flash light. `app.json` sets `userInterfaceStyle: "dark"` and the
native root/splash/adaptive-icon backgrounds to navy.

Brand assets: `assets/images/zoe-mark.png` (gold Z) and `zoe-wordmark.png`, taken from the website repo;
launcher/splash icons are generated from the mark.

### Conventions

- Open company websites only through `openWebsite`/`isWebUrl` (`utils/links.ts`) — they're written by other
  companies, and anything but `http(s)` must never reach `Linking`.
- Submit handlers that hit the network guard re-entry with a ref, not just a disabled button: a keyboard "go"
  key fires before the disabled state renders (a duplicate login invalidates the pending 2FA token).
- `useAsync` returns `retry` for error-screen "Try again" buttons (shows loading again), `reload` for
  pull-to-refresh, `silentReload` for background updates.

- Path aliases `@/*` → `src/*`, `@/assets/*` → `assets/*`.
- React Compiler is on and lint enforces its hook rules: don't write refs during render, and don't call a
  function that synchronously sets state from an effect body (fetch in the effect with `.then(...)`
  callbacks — see `hooks/use-async.ts`).
- `KeyboardAvoidingView` uses `behavior="padding"` on Android too (the app is edge-to-edge, so the window is
  not resized for the keyboard).
