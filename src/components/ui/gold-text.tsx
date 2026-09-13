import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

import { Gradients } from '@/constants/theme';

type Props = Omit<TextProps, 'style'> & { style?: StyleProp<TextStyle> };

export function GoldText({ style, children, ...rest }: Props) {
  return (
    <MaskedView
      style={{ alignSelf: 'flex-start' }}
      maskElement={
        <Text style={style} {...rest}>
          {children}
        </Text>
      }>
      <LinearGradient
        colors={Gradients.gold.colors}
        locations={Gradients.gold.locations}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        {/* invisible copy gives the gradient the text's exact size */}
        <Text style={[style, { opacity: 0 }]} {...rest}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}
