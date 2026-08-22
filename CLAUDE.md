# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npx expo run:android  # build and install native Android APK (first run takes ~2 min via Gradle)
npx expo run:ios      # build and install native iOS app
npm run web           # start for web
npm run lint          # run expo lint (ESLint via Expo config)
npm run reset-project # wipe src/app back to blank template via scripts/reset-project.js
```

Do NOT use `npm run android` / `npm run ios` — those open Expo Go, not the native build.
No test runner is configured yet.

## Architecture

### Routing — expo-router (file-based)

All routes live under `src/app/`. Entry point is `expo-router/entry` → `src/app/_layout.tsx`.

```
src/app/
  _layout.tsx           root layout: AuthProvider + ThemeProvider + AnimatedSplashOverlay + Stack
  index.tsx             redirects to /(auth)/login
  (auth)/
    _layout.tsx         Stack (no header); redirects to /(tabs)/discover if already logged in
    login.tsx
    register.tsx
  (tabs)/
    _layout.tsx         Tabs (4 tabs); redirects to /(auth)/login if not logged in
    discover/
      _layout.tsx       Stack with themed header
      index.tsx         Discover screen — search + filter chips + business list
      [id].tsx          Business profile — full detail + Connect button
    connections/
      _layout.tsx       Stack with themed header
      index.tsx         Connections screen — Pending / Connected toggle
      [id].tsx          Business profile (from connections context)
    messages/
      _layout.tsx       Stack with themed header
      index.tsx         Conversations list
      [id].tsx          Chat screen — local-state send (showcase)
    profile.tsx         Profile screen — single screen, no nested stack
```

### Auth flow

`src/context/auth-context.tsx` — simple `useState`-based auth, no persistence.
- `login()` sets `isLoggedIn = true`; caller uses `router.replace('/(tabs)/discover')`
- `logout()` sets `isLoggedIn = false`; caller uses `router.replace('/(auth)/login')`
- Both tab and auth layouts guard their routes with `<Redirect>` based on `isLoggedIn`.

### Mock data

`src/data/mock.ts` — all showcase data lives here. Every client-specific value is marked `// TODO`.
Fill in by grepping for `// TODO`. Industries must stay consistent with the `FILTERS` array in
`(tabs)/discover/index.tsx` since they drive the filter chips.

Key exports: `mockBusinesses` (10), `myBusiness` (logged-in company), `mockConnections` (4),
`mockConversations` (2), `mockMessages` (keyed by conversation ID), `MY_COMPANY_ID = 99`.

`src/utils/colors.ts` — `avatarColor(name)` and `INDUSTRY_COLORS` map used across Discover,
Business Profile, Connections, and Chat screens.

### Theme system

All design tokens are in `src/constants/theme.ts`:

- `Colors` — light/dark palettes (`text`, `background`, `backgroundElement`, `backgroundSelected`, `textSecondary`).
- `Primary` — `#208AEF`. The single brand accent color; swap this per client.
- `Fonts` — platform-specific font stacks (system-ui on iOS, CSS vars on web).
- `Spacing` — named scale (`half`=2 … `six`=64).
- `BottomTabInset` — platform-safe bottom padding (iOS 50, Android 80, web 0).
- `MaxContentWidth` — 800, applied to constrain content on wide screens.

Use the `useTheme()` hook (`src/hooks/use-theme.ts`) to get the active palette. It normalizes `'unspecified'` to `'light'`.

### Themed primitives

- `ThemedText` (`src/components/themed-text.tsx`) — `Text` wrapper; accepts a `type` prop (`default` | `title` | `subtitle` | `small` | `smallBold` | `link` | `linkPrimary` | `code`) and an optional `themeColor` key to pick a non-default color from the palette.
- `ThemedView` (`src/components/themed-view.tsx`) — `View` wrapper; `type` prop selects a background from `ThemeColor` (defaults to `'background'`).

Screens in `(auth)/` and `(tabs)/` use `useTheme()` directly with inline styles for more
flexibility. Use `ThemedText`/`ThemedView` for simple wrappers, inline styles for custom layouts.

### Platform overrides

Files ending in `.web.tsx` / `.web.ts` shadow their `.tsx` / `.ts` counterparts on web.
`app-tabs.tsx` / `app-tabs.web.tsx` are unused (original template artifact — tab nav is now in
`(tabs)/_layout.tsx`). `animated-icon.web.tsx` and `use-color-scheme.web.ts` are still active.

### Path aliases

`@/*` → `src/*` and `@/assets/*` → `assets/*` (configured in `tsconfig.json`). Use these in all imports.

### Key config

- `app.json` — `experiments.typedRoutes: true` (typed `href` in expo-router) and `experiments.reactCompiler: true`.
- Splash screen background `#208AEF`.
- URL scheme: `lombardiaapp://`.

### Per-client delivery checklist

When adapting this whitepaper app for a new client:

1. Grep `// TODO` in `src/data/mock.ts` and fill in all company data.
2. Update `"APP NAME"` and `"Tagline"` in `src/app/(auth)/login.tsx`.
3. Replace `Primary` in `src/constants/theme.ts` with the client's brand color.
4. Swap logo asset referenced in `login.tsx` and `profile.tsx` (`@/assets/images/icon.png`).
5. Update `app.json`: `name`, `slug`, `scheme`, splash `backgroundColor`.
6. Adjust the `FILTERS` array in `(tabs)/discover/index.tsx` to match the client's industry set.
