# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

**LazioItalia.app** mobile client, derived from the design-neutral `b2btemplate` of `b2bzoeapp` (the Zoe Milano
B2B app): an Android-first Expo (SDK 57, expo-router) client for the b2bserver Rust backend two directories up
(`../../`, see that repo's `CLAUDE.md` for the server side) — real login/registration, Discover, company
connections and live chat. Functionality is identical to `b2bzoeapp`; only the look differs. The design follows the
LazioItalia.app website (the `lazio` SvelteKit repo — `src/app.css` teal theme and `exports/design-prompt.md`):
deep-teal surfaces, travertine work surfaces, signal-red metal buttons, brushed-steel edges/discs, Tinos Bold
headlines over Inter. Brand media (logo mark, wordmarks, hero photo) are PNG renders of the site's
`static/brand/` and `static/media/` files.

### Keeping in sync with `b2bzoeapp`

These are byte-identical to `b2bzoeapp` and can be copied across as-is when the original changes:
`src/api/`, `src/context/`, `src/hooks/`, `src/utils/`, `src/constants/industries.ts`,
`src/components/form-scroll.tsx`. Screens (`src/app/`) and the other components share all logic with the
original but differ in names/styles (`GoldButton` → `PrimaryButton`, `OutlineButton` → `SecondaryButton`,
`GlassCard` → `Card`, `GoldRefreshControl` → `AppRefreshControl`, `GoldText` → `<Text style={Type.eyebrow}>`,
Tag tone `gold` → `accent`, `Zoe Milano` → `Brand.name`), so port changes there by hand.

### Where the design lives

1. `src/constants/theme.ts` — palette `C`, `Metal` gradients, `Font` families, `Type`, `Radius`, `Spacing`, and
   `Scheme` (`'light' | 'dark'`; drives keyboard appearance and navigation theme).
2. `src/constants/brand.ts` — `Brand.name` / `Brand.tagline` / `Brand.descriptor`.
3. `src/components/ui/*`, `src/components/brand.tsx` (`BrandLockup`), `src/components/auth-hero.tsx`, then
   per-screen `StyleSheet`s in `src/app/`.
4. `assets/images/` — icon, adaptive icon, splash and favicon (the site's logo box on deep teal `C.nav`),
   `brand/` (mark, red and ivory wordmarks) and `hero-cities.jpg` (the site's hero still, teal grade baked in).
5. `app.json` — `name`, `slug`, `scheme`, bundle id/package `app.lazioitalia`, `userInterfaceStyle` (must match
   `Scheme`), the root `backgroundColor` (`C.bg`) and the splash/adaptive-icon `backgroundColor`s (`C.nav`, the
   same as the boot screen in the root layout).

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

Palette `C` (semantic tokens: `bg`, `surface`, `surfacePressed`, `inputFill`, `text`/`textDim`/`textHint`/
`textMuted`, `accent`/`onAccent`/`accentDim`/`accentText`, `border`, `divider`, `scrim`, `danger`/`dangerDim`,
`success`, `warning`, plus the deep-teal set `nav`/`ink`/`ink2`/`ink3`/`hero` with `onInk`/`onInkMuted`/
`lineOnInk`/`coral`/`mint`/`steel`). Red text on teal is too low-contrast: on `ink` surfaces use `onInk`, and
`coral` for a red accent. `Metal` holds the site's 115° metal gradients, applied with `metal(finish)` /
`<MetalEdge>` (`components/ui/metal.tsx`) through RN's `experimental_backgroundImage`, always over a solid
`backgroundColor` fallback. `Font` maps weights to families (`Inter_400Regular` … `Tinos_700Bold`), each loaded in
the root layout and embedded natively via the `expo-font` plugin — set `fontFamily` from `Font` (or spread a `Type`
preset) on every text style and never add `fontWeight` (Android would fake-bold). Never hardcode colors in screens —
always go through `C`. Build screens from the primitives: `Screen` (travertine background, deep-teal status-bar
band + safe area), `ScreenHeader` (teal bar/hero with steel edge), `Card` (`tone="ink"` for the website's teal
"ticket", `edge` for the steel top line)/`Divider`, `PrimaryButton` (metal-red pill)/`SecondaryButton`/`TextButton`,
`Input`, `Avatar` (steel frame), `Tag` (uppercase pill), `Segmented`/`Chip`, `Kicker` (numbered "01" label),
`Icon`, and `states.tsx` (loading/empty/error, `AppRefreshControl`). `Icon` renders Material Symbols (300 Light) as
text from a font the root layout loads before hiding the splash (it is also embedded natively via the `expo-font`
plugin in `app.json`; the file name must match `ICON_FONT`); to use a new icon add its codepoint to `GLYPHS` in
`icon.tsx`. Every new `TextInput` needs `keyboardAppearance={Scheme}` and themed placeholder/cursor colors (the
`Input` primitive already does this); every navigator needs `contentStyle`/`sceneStyle` `backgroundColor: C.bg` so
transitions never flash a different color. The status bar is always `light` (every screen's top edge is teal).

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
