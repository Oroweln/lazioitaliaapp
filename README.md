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

## Test checklist (mobile app)

Manual QA on an Android device or emulator. You need at least two accounts in two different companies
(**A** and **B**), ideally on two devices; a third account (**C**) is used for invites. Tick each box as it passes.

### Look & feel
- [x] Launcher icon is the gold Z on navy (adaptive icon, including the themed/monochrome variant)
- [x] Splash screen is navy with the gold Z; no white or blue flash at launch
- [x] With the phone set to **light mode**, every screen stays dark: no white backgrounds, cards, headers or tab bar
- [x] Screen transitions (push, back, tab switch) never flash white
- [x] Keyboard is the dark variant; text cursor and selection handles are gold
- [x] Alerts and confirmation dialogs are dark
- [x] Pull-to-refresh spinner is gold on a dark background
- [x] Status bar icons are light and readable
- [x] Icons show on first render (tabs, buttons, list chevrons), with no blank boxes or flicker
- [x] Layout works on a small phone and with large system font size

### Startup & session
- [x] Fresh install opens on Login
- [x] Killing and reopening the app while signed in goes straight to the app (no login flash)
- [x] With the server stopped, launching while signed in shows "Can't reach Zoe Milano"; **Retry** shows a spinner
      and recovers once the server is back
- [x] Airplane mode at launch shows the error screen within ~15 s, not an endless splash
- [x] Stay signed in past the access-token lifetime (15 min) and keep using the app: no forced logout
- [x] Device clock set a few hours wrong: app still works and doesn't log out

### Registration
- [x] **New company**: full name, email, password (12+ chars), company, industry, location → lands on
      "Awaiting approval"
- [x] Validation messages for empty name, invalid email, password under 12 chars, missing company name
- [x] Registering an already-used email shows a clear error (also with different capitalisation)
- [x] **Invite code** mode hides company fields; an invalid/expired code shows an error
- [x] Industry picker opens, selects, and shows the chosen value

### Login & two-factor
- [x] Wrong password shows "Incorrect email or password."
- [x] Email is case-insensitive (`User@X.com` logs into `user@x.com`)
- [x] Suspended account shows "This account has been suspended."
- [x] Pressing the keyboard **Go** key repeatedly sends only one login
- [x] Account with 2FA → code screen; wrong code shows an error; correct code signs in
- [x] Pressing **Go** twice on the code screen doesn't produce an error
- [x] "Back to sign in" from the code screen returns to Login

### Pending approval
- [x] Pending account sees company and email on the "Awaiting approval" screen
- [x] **Check status** while still pending shows "Still under review"
- [x] Approve the account on the server → **Check status** opens the main app
- [x] Owner can open **Complete company profile** and save changes while pending
- [x] **Account & security** and **Sign out** work while pending

### Discover
- [X] Lists approved companies; your own company is not shown
- [x] Search filters by name, description and city (results update after typing stops)
- [x] Industry chips filter; tapping an active chip clears it; **All** resets
- [X] Scrolling to the bottom loads more (with 20+ companies)
- [x] Pull-to-refresh works
- [x] Empty result shows "No companies found"

### Company page
- [X] Shows about, looking for, industry, location, size, website
- [x] Website link opens the browser; a non-http website (set via API) is **not** shown as a link(you cannot click the website)
- [X] **Connect** opens the sheet; optional note has a 500-char counter; sheet stays above the keyboard
- [X] After sending: button changes to "Request sent" and a "Request pending" tag appears
- [x] Sending again from another member of the same company shows "Connection request already sent"
- [X] If B already sent A a request, A's owner tapping **Connect** connects immediately; an A *member* sees
      "Your owner or admin can accept it"
- [x] Connected company shows **Message** → opens the chat
- [x] Opening a company that has since been unlisted shows "This company is no longer listed…"; **Try again**
      shows a loading state

### Connections
- [X] **Pending** tab: "Received" shows incoming requests with the note; "Sent" shows your outgoing requests;
      "Declined by you" shows requests you declined
- [X] Owner/admin sees **Accept** / **Decline**; decline asks for confirmation
- [x] A member sees "Your company owner or admin can accept this request" instead of buttons
- [X] **Accept** moves the company to the **Connected** tab; the other side sees it after refresh
- [X] Counts on the segment labels are correct
- [X] Tapping a card opens that company's page
- [z] **Message** opens the chat; fast double-tap opens it only once
- [X] Returning to the tab refreshes the data; pull-to-refresh works

### Messages list
- [x] Shows the other person's name, their company, last message and time
- [x] Unread badge shows the count; opening the chat and returning clears it
- [x] Unread state matches on a second device signed into the same account
- [x] New message from B moves the conversation to the top and updates the badge (tab open, no refresh)
- [x] While in another tab, a new message arrives → switching to Messages shows it
- [x] With 50+ conversations, scrolling loads more and nothing is duplicated or skipped
  (retest: paging state fixed, and a **Load older conversations** button now appears at the end of the list whenever more exist — if the button shows but scrolling never loads, `onEndReached` is the culprit)
- [x] Empty state for a new account

### Chat
- [x] Opens at the newest message; own messages right (gold), theirs left; day separators correct
- [x] Sending shows the message immediately; the input clears
- [x] Text typed while a message is still sending is kept
- [x] Sending with the server down shows "Message not sent" and puts the text back in the input
- [x] Messages from B appear live without refreshing
- [x] Scrolling up loads older messages (conversation with 50+ messages)
- [x] Input sits directly on top of the keyboard, with no gap and no jump when the keyboard opens/closes
- [X] Multi-line messages grow the input up to a max height; 4000-char limit enforced
- [X] Typing stays smooth in a long conversation
- [x] Opening the chat within the first seconds after launch still shows messages B sent at that moment

### Realtime & connectivity
- [x] Background the app, have B send several messages, reopen → all appear, no gaps
- [x] Background for a long time with 100+ messages sent meanwhile → chat shows the newest, scrolling up loads
      the rest with no gap
- [x] Toggle airplane mode on/off in a chat → live messages resume on their own within ~5 s
  *(retest: reconnect backoff no longer climbs to a minute while offline; a **Reconnecting…** line shows under the chat header while the socket is down)*
- [x] Same account signed in on two phones → both receive live messages; no constant reconnecting (watch
      server logs)
- [x] Opening the invite share sheet or authenticator app and returning doesn't break live updates
- [x] Suspend the account on the server while in the app → signed out within about a minute or on the next action
- [x] Set the account back to pending on the server → app moves to "Awaiting approval"

### Profile
- [x] Shows company, website, industry, your role, your name and email
- [x] Team section lists members with roles and "(you)"; if loading fails, an error with **Try again** shows
- [x] **Your name**: change and save → updated on Profile and in chats
- [x] **Edit company** (owner/admin only): change fields, clear a field, save → Profile updates
- [x] Website without `https://` is saved with it added; an invalid website shows an error
- [x] Member doesn't see **Edit company** / **Invite colleagues**
- [x] Pull-to-refresh works

### Invites
- [x] Create a **Member** invite → code shown once with **Share invite**; share sheet opens with instructions
- [x] Register account C with that code → C appears in the team list with the right role
- [x] Create an **Admin** invite → C2 joins as admin and can accept requests
- [x] A pending invited admin gets **no** "Complete company profile" button, and `PUT /business`, `POST /business/logo`, `POST /business/invites` all answer 403 for them (server rebuild required)
- [x] The company **owner** can still edit the company while pending (onboarding path must keep working)
- [x] **Revoke** asks for confirmation and removes the invite; a revoked code can't be used

### Security
- [x] **Enable two-factor**: setup key shown, **Open authenticator app** works (or shows a fallback message),
      wrong code rejected, correct code enables it
- [x] Sign out and back in → asks for the code
- [x] **Disable two-factor** with a wrong password shows "Incorrect password."; the correct one disables it
- [x] **Delete account** asks twice; afterwards you're on Login and can't sign in with that account
- [x] Owner with teammates deletes their account → next member becomes owner
- [x] Only member deletes their account → company disappears from Discover

### Sign out
- [x] **Sign out** asks for confirmation and returns to Login immediately, even in airplane mode
- [x] Sign in as a different account → no data from the previous account (connections, chats, team)
- [x] Android back button on Login doesn't return into the app

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
