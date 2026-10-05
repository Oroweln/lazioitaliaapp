import type { TextStyle } from 'react-native';

// LAZIOITALIA.APP THEME — the website's teal theme (lazio `src/app.css`, `:root:has(.teal-theme)`):
// deep teal surfaces, travertine work surfaces, signal-red actions, brushed-steel metal, Tinos Bold
// headlines over Inter. Native colors in app.json must follow `C.bg` / `C.nav`.

/// Light or dark. Drives the status bar, keyboard appearance and navigation theme; keep it in
/// sync with `userInterfaceStyle` in app.json, or system dialogs won't match the palette.
export const Scheme: 'light' | 'dark' = 'light';

export const C = {
  // Light work surfaces
  bg: '#eae2d6', // travertine
  surface: '#f6f1e8',
  surfacePressed: '#efe6d8',
  inputFill: '#fbf8f3',
  // Text on light: teal, as on the site
  text: '#035f69',
  textDim: '#3f5459',
  textHint: '#8a9698',
  textMuted: '#5f6f73',
  // Signal red: buttons, active states, markers
  accent: '#d52204',
  onAccent: '#ffffff',
  accentDim: 'rgba(213,34,4,0.10)',
  /// Red for small text on light (passes contrast on travertine).
  accentText: '#b81d03',
  border: '#d6ccbc',
  divider: '#e0d6c6',
  scrim: 'rgba(1,40,45,0.6)',
  danger: '#b81d03',
  dangerDim: 'rgba(184,29,3,0.08)',
  success: '#0a7a62',
  warning: '#b35400',

  // Deep teal surfaces (navbar, heroes, tickets) and what sits on them
  nav: '#013e45',
  ink: '#035f69',
  ink2: '#02545d',
  ink3: '#0a6e79',
  hero: '#0c7783',
  ivory: '#f3eee6',
  onInk: '#f3eee6',
  onInkMuted: '#cfe2e4',
  lineOnInk: 'rgba(243,238,230,0.2)',
  /// Red accent that must sit on teal (red text on teal is too low-contrast).
  coral: '#ff9a85',
  /// Positive values on teal ("Open", "Connected").
  mint: '#9fe0d2',
  steel: '#6b9caa',
  amber: '#e8492e',
} as const;

/// Metallic finishes (115° gradients), for `experimental_backgroundImage`. Always paired with
/// the solid color next to it as `backgroundColor`, so nothing is blank if gradients are off.
export const Metal = {
  red: 'linear-gradient(115deg, #a51902 0%, #d52204 18%, #ef4a2c 30%, #c81f04 44%, #9e1802 58%, #e2391c 76%, #d52204 88%, #a81a03 100%)',
  steel:
    'linear-gradient(115deg, #4a7481 0%, #8db7c4 16%, #d3e7ed 27%, #86b0bd 40%, #56808d 56%, #a3c8d3 74%, #6b9caa 88%, #4f7a87 100%)',
  teal: 'linear-gradient(115deg, #024a52 0%, #067481 18%, #248f9a 29%, #05707c 42%, #035560 58%, #1b8793 76%, #035f69 90%, #024a52 100%)',
  /// Hero band: lighter teal at the top fading to the main teal, with a soft glow.
  hero: 'linear-gradient(180deg, #0c7783 0%, #035f69 100%)',
  /// Legibility shade over the hero photo (deep teal at the bottom where text sits).
  photoShade:
    'linear-gradient(0deg, rgba(1,62,69,0.94) 0%, rgba(3,95,105,0.62) 38%, rgba(3,95,105,0.12) 66%, rgba(1,62,69,0.55) 100%)',
} as const;

export const MetalSolid = { red: C.accent, steel: C.steel, teal: C.ink, hero: C.hero, photoShade: 'rgba(1,62,69,0.3)' } as const;

/// Font families (each weight is its own family, loaded in the root layout and embedded natively
/// via the expo-font plugin). Never combine these with `fontWeight` — Android would fake-bold them.
export const Font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
  /// Headlines: Tinos Bold, like every h1–h6 on the site.
  serif: 'Tinos_700Bold',
} as const;

export const Radius = { sm: 8, md: 14, lg: 20, pill: 999 } as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Type = {
  display: { fontFamily: Font.serif, fontSize: 34, lineHeight: 37, letterSpacing: -0.2, color: C.text },
  title: { fontFamily: Font.serif, fontSize: 27, lineHeight: 31, letterSpacing: -0.15, color: C.text },
  heading: { fontFamily: Font.serif, fontSize: 21, lineHeight: 25, color: C.text },
  body: { fontFamily: Font.regular, fontSize: 15, lineHeight: 23, color: C.text },
  bodyDim: { fontFamily: Font.regular, fontSize: 14, lineHeight: 21, color: C.textDim },
  small: { fontFamily: Font.regular, fontSize: 12, lineHeight: 17, color: C.textMuted },
  /// Kicker: 0.75rem Inter 700, tracked, uppercase, red on light.
  eyebrow: {
    fontFamily: Font.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: C.accentText,
  },
  label: { fontFamily: Font.semibold, fontSize: 12, letterSpacing: 0.2, color: C.textDim },
  button: { fontFamily: Font.bold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' },
} satisfies Record<string, TextStyle>;

export const MaxContentWidth = 800;
