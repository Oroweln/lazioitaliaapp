import type { TextStyle } from 'react-native';

// PLACEHOLDER THEME — neutral grayscale wireframe. A derived app repaints itself here
// (plus the primitives in src/components/ui/ and the native colors in app.json).

/// Light or dark. Drives the status bar, keyboard appearance and navigation theme; keep it in
/// sync with `userInterfaceStyle` in app.json, or system dialogs won't match the palette.
export const Scheme: 'light' | 'dark' = 'light';

export const C = {
  bg: '#ffffff',
  surface: '#f2f2f2',
  surfacePressed: '#e4e4e4',
  inputFill: '#ffffff',
  text: '#111111',
  textDim: '#555555',
  textHint: '#9a9a9a',
  textMuted: '#777777',
  accent: '#333333',
  onAccent: '#ffffff',
  accentDim: 'rgba(0,0,0,0.08)',
  border: '#c8c8c8',
  divider: '#e2e2e2',
  scrim: 'rgba(0,0,0,0.4)',
  danger: '#c62828',
  dangerDim: 'rgba(198,40,40,0.08)',
  success: '#2e7d32',
  warning: '#9a6700',
} as const;

export const Radius = { sm: 4, md: 8, lg: 12, pill: 999 } as const;

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
  display: { fontSize: 30, fontWeight: '600', lineHeight: 36, color: C.text },
  title: { fontSize: 24, fontWeight: '600', lineHeight: 30, color: C.text },
  heading: { fontSize: 18, fontWeight: '600', lineHeight: 24, color: C.text },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22, color: C.text },
  bodyDim: { fontSize: 14, fontWeight: '400', lineHeight: 20, color: C.textDim },
  small: { fontSize: 12, fontWeight: '400', lineHeight: 16, color: C.textMuted },
  eyebrow: { fontSize: 12, fontWeight: '600', color: C.textMuted },
  label: { fontSize: 12, fontWeight: '600', color: C.textDim },
  button: { fontSize: 14, fontWeight: '600' },
} satisfies Record<string, TextStyle>;

export const MaxContentWidth = 800;
