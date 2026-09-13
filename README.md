# Zoe Milano — B2B Network App

Android-first mobile app for the Zoe Milano B2B network. Companies discover each other, send connection
requests, and — once connected — their people chat in real time.

This app is the frontend of **b2bserver**, the Rust/Axum backend two directories up (`../../`). Its look
follows the [Zoe Milano website](https://github.com/Oroweln/zoemilanocomv2): a dark-only navy and champagne-gold
theme with no light mode.

---

## Features

**Account**
- Sign in, with two-factor authentication (TOTP) when it is enabled
- Request membership as a new company, or join an existing company with an invite code
- "Awaiting approval" screen until Zoe Milano approves the account
- Stays signed in across restarts (refresh token kept in secure storage)

**Discover**
- Browse approved companies with search, industry filters, pull-to-refresh and infinite scroll
- Company page: about, what they are looking for, location, size, website
- Send a connection request with an optional note

**Connections**
- Received and sent requests with status
- Company owners and admins accept or decline incoming requests
- Connected companies list with a "Message" shortcut

**Messages**
- Conversation list with company names and unread counts
- Live chat over WebSocket, with older messages loaded on scroll

**Profile**
- Edit your name and your company's details
- Team member list and invite codes (create, share, revoke)
- Enable or disable two-factor authentication
- Sign out, delete account

---

## Tech stack

- Expo SDK 57, React Native 0.86, React 19 (React Compiler enabled)
- expo-router (file-based routing, `Stack.Protected` auth guards)
- expo-secure-store, expo-linear-gradient, masked-view, Material Symbols icon font
- Plain `fetch` + React Native `WebSocket` against b2bserver's `/api/v2`

---

## Getting started

### 1. Run the backend

The app needs b2bserver running locally (see `../../CLAUDE.md` for full details):

```bash
sudo systemctl start postgresql
sudo -u postgres psql -f ../../schema.sql   # first time only — creates the DB (destructive)
cd ../.. && cargo run                       # listens on :4000
```

If your database was created from an older `schema.sql`, apply the migrations instead of recreating it:

```bash
sudo -u postgres psql -d b2bserver -f ../../migrations/001_unread_and_email_case.sql
```

### 2. Configure the app

```bash
cp .env.example .env
```

| Variable | Default | Meaning |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `http://10.0.2.2:4000` | Server origin, without `/api/v2`. `10.0.2.2` is your computer as seen from the Android emulator; on a physical phone use your computer's LAN IP. |
| `EXPO_PUBLIC_APP_KEY` | `zoemilano` | Tenant slug sent as the `X-App-Key` header. |

Debug builds allow plain HTTP. A release build should talk to the server over HTTPS.

### 3. Install and run

```bash
npm install
npx expo run:android    # builds and installs the native app (first build takes a few minutes)
```

Use `npx expo run:android`, not `npm run android` — the native build is required. Web is not supported
(browsers can't send the header the WebSocket requires).

### 4. Create test accounts

No users are seeded. Register accounts in the app — they start as **pending**. Approve them in SQL:

```sql
UPDATE users SET status = 'approved' WHERE email = 'you@example.com';
UPDATE businesses SET approved = true WHERE name = 'Your Company';
```

or make one user an admin (`UPDATE users SET role = 'admin' ...`) and call
`POST /api/v2/admin/users/{id}/approve`. Then tap **Check status** on the pending screen.

A good end-to-end check: register two companies, approve both, connect from one, accept from the other, then
chat — messages should appear live on the other device without refreshing.

---

## Scripts

| Command | Purpose |
|---|---|
| `npx expo run:android` | Build and install the native Android app |
| `npx expo run:ios` | Build and install the native iOS app |
| `npm start` | Start Metro for an already-installed dev build |
| `npm run lint` | ESLint (Expo config, React Compiler hook rules) |
| `npx tsc --noEmit` | Type-check |

There is no test runner yet.

---

## Project structure

```
src/
  app/                  routes (expo-router)
    _layout.tsx         providers + auth guards
    (auth)/             login, register, totp
    pending.tsx         awaiting approval
    (tabs)/             discover, connections, messages, profile
    business/[id].tsx   company page
    chat/[id].tsx       chat thread
    account/            edit company, edit name, invites, security
  api/                  config, HTTP client (token refresh), typed endpoints, server types
  context/              auth state, realtime WebSocket
  components/ui/        design-system primitives (Screen, GlassCard, GoldButton, Input, ...)
  constants/            theme tokens, shared industry list
  hooks/ utils/         data loading, connections cache, formatting, connection helpers
assets/images/          Zoe Milano mark + wordmark, app/splash icons
```

---

## Design

All tokens live in `src/constants/theme.ts`, taken from the website's CSS:

| Token | Value |
|---|---|
| Background | `#0d0d1a` (navy) with a subtle gold glow |
| Surface / glass | `#16162a` / `rgba(22,22,42,0.55)` |
| Text | `#f5ecd3` (cream) · muted `#8888aa` |
| Gold | `#c28e1a` · light `#e0b347` · gradient `#d9b271 → #a38345 → #d1aa69` |

Screens are built from the primitives in `src/components/ui/`. The app is intentionally dark-only — don't
introduce white or light surfaces.

---

## Notes on server behaviour

- Sending messages and starting conversations is limited to **30 per minute** per user; reading is not.
- Unread counts are tracked by the server, so they stay in sync across devices.
- The same account can be signed in on several devices at once (up to 5 live connections).
- Emails are case-insensitive.
- If a company you want to connect with has already asked to connect with you, sending a request accepts theirs
  (owners and admins only).
- Company websites must be `http://` or `https://` links.
- When a company owner deletes their account, ownership passes to another team member; a company with no
  members left is removed.
