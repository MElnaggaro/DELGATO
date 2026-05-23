import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { ViewProps } from 'react-native';

import { ease } from './presets';

type Props = ViewProps & {
  /** Triggers the bump animation whenever this value changes. */
  trigger: number | string;
  /** Peak scale. Default 1.18 (matches `dl-bump` keyframe). */
  peak?: number;
};

/**
 * Bump — scale 1 → peak → 1, 260ms ease.out. Mirrors design-reference
 * `dl-bump` keyframe. Used by Stepper count text and MiniCartBar badge.
 */
export function Bump({ trigger, peak = 1.18, style, ...rest }: Props) {
  if (Platform.OS === 'web') {
    return <View {...rest} style={style} />;
  }
  return <BumpNative trigger={trigger} peak={peak} style={style} {...rest} />;
}

function BumpNative({ trigger, peak = 1.18, style, ...rest }: Props) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(peak, { duration: 130, easing: ease.out }),
      withTiming(1, { duration: 130, easing: ease.out }),
    );
  }, [trigger, peak, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View {...rest} style={[animStyle, style]} />;
}
