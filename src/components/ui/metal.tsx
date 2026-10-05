import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Metal, MetalSolid } from '@/constants/theme';

export type MetalFinish = keyof typeof Metal;

/// Background style for a metallic finish: the gradient plus its solid color underneath.
export function metal(finish: MetalFinish): ViewStyle {
  return { backgroundColor: MetalSolid[finish], experimental_backgroundImage: Metal[finish] };
}

/// The website's brushed-steel (or metal-red) edge: a thin line under heroes and on card edges.
export function MetalEdge({
  finish = 'steel',
  height = 5,
  style,
}: {
  finish?: MetalFinish;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.edge, { height }, metal(finish), style]} />;
}

const styles = StyleSheet.create({
  edge: { alignSelf: 'stretch' },
});
