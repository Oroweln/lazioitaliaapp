import type { TextStyle } from 'react-native';

// Zoe Milano is dark-only; values mirror the website's src/app.css tokens.
export const C = {
  bg: '#0d0d1a',
  surface: '#16162a',
  surfaceHover: '#1e1e38',
  glass: 'rgba(22,22,42,0.55)',
  inputFill: 'rgba(13,13,26,0.45)',
  text: '#f5ecd3',
  textDim: 'rgba(245,236,211,0.6)',
  textHint: 'rgba(245,236,211,0.38)',
  textMuted: '#8888aa',
  accent: '#c28e1a',
  accentLight: '#e0b347',
  accentDim: 'rgba(194,142,26,0.15)',
  onGold: '#1a1300',
  ctaFrame: '#3d2a14',
  border: '#2a2a4a',
  borderGold: 'rgba(216,178,113,0.35)',
  divider: 'rgba(194,142,26,0.14)',
  danger: '#e05252',
  success: '#52a852',
  warning: '#d4a017',
} as const;

type Gradient = { colors: readonly [string, string, ...string[]]; locations: readonly [number, number, ...number[]] };

export const Gradients = {
  gold: {
    colors: ['#d9b271', '#c19d5d', '#a38345', '#ae8d4e', '#cca665', '#d1aa69'],
    locations: [0, 0.25, 0.52, 0.68, 0.96, 1],
  },
  cta: {
    colors: ['#e9cd9a', '#d9b271', '#b8934f', '#6b4a1f'],
    locations: [0, 0.3, 0.65, 1],
  },
  skybox: {
    colors: ['#0d0d1a', '#12101a', '#2a2012', '#5c4618'],
    locations: [0, 0.45, 0.8, 1],
  },
  scrim: {
    colors: ['rgba(13,13,26,0.92)', 'rgba(13,13,26,0.55)', 'rgba(13,13,26,0.7)', 'rgba(13,13,26,0.94)'],
    locations: [0, 0.35, 0.75, 1],
  },
  hairline: {
    colors: ['rgba(194,142,26,0)', 'rgba(194,142,26,0.35)', 'rgba(194,142,26,0)'],
    locations: [0, 0.5, 1],
  },
} satisfies Record<string, Gradient>;

export const Radius = { sm: 8, md: 14, lg: 24, pill: 999 } as const;

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
  display: { fontSize: 34, fontWeight: '300', letterSpacing: -0.6, lineHeight: 40, color: C.text },
  title: { fontSize: 26, fontWeight: '300', letterSpacing: -0.4, lineHeight: 32, color: C.text },
  heading: { fontSize: 18, fontWeight: '500', lineHeight: 24, color: C.text },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 24, color: C.text },
  bodyDim: { fontSize: 14, fontWeight: '300', lineHeight: 22, color: C.textDim },
  small: { fontSize: 12, fontWeight: '400', lineHeight: 16, color: C.textMuted },
  eyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 2.6, textTransform: 'uppercase', color: C.accentLight },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', color: C.accentLight },
  button: { fontSize: 13, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase' },
} satisfies Record<string, TextStyle>;

export const MaxContentWidth = 800;
