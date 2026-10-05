import { Text, View, type ColorValue, type StyleProp, type TextStyle } from 'react-native';

import { C } from '@/constants/theme';

// Must match the embedded file name (app.json expo-font plugin) so Android resolves it natively.
export const ICON_FONT = 'MaterialSymbols_300Light';

// Without the font the codepoints would render as empty boxes; blank space reads better.
let fontUnavailable = false;
export function markIconFontUnavailable() {
  fontUnavailable = true;
}

// Material Symbols codepoints. The font is loaded once in the root layout, so icons render
// as plain text immediately instead of each one loading the font on mount.
const GLYPHS = {
  account_circle: 0xe853,
  apartment: 0xea40,
  arrow_back: 0xe5c4,
  chat: 0xe0b7,
  check: 0xe5ca,
  chevron_right: 0xe5cc,
  cloud_off: 0xe2c1,
  delete: 0xe872,
  edit: 0xe3c9,
  error: 0xe000,
  expand_more: 0xe5cf,
  forum: 0xe0bf,
  group: 0xe7ef,
  handshake: 0xebcb,
  hourglass_empty: 0xe88b,
  hourglass_top: 0xea5b,
  image: 0xe3f4,
  language: 0xe894,
  location_on: 0xe0c8,
  lock: 0xe897,
  lock_reset: 0xeade,
  logout: 0xe9ba,
  mail: 0xe158,
  person: 0xe7fd,
  person_add: 0xe7fe,
  refresh: 0xe5d5,
  search: 0xe8b6,
  send: 0xe163,
  share: 0xe80d,
  shield: 0xe9e0,
  travel_explore: 0xe2db,
} as const;

export type IconName = keyof typeof GLYPHS;

type Props = {
  name: IconName;
  size?: number;
  color?: ColorValue;
  style?: StyleProp<TextStyle>;
};

export function Icon({ name, size = 22, color = C.accent, style }: Props) {
  if (fontUnavailable) return <View style={{ width: size, height: size }} />;
  return (
    <Text
      accessible={false}
      allowFontScaling={false}
      style={[
        { fontFamily: ICON_FONT, fontSize: size, lineHeight: size, width: size, height: size, color, textAlign: 'center' },
        style,
      ]}>
      {String.fromCharCode(GLYPHS[name])}
    </Text>
  );
}
