import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { ViewProps } from 'react-native';

import { ease } from './presets';

type Props = ViewProps & { delay?: number; duration?: number };

/**
 * StickIn — slide-up from below the viewport. Used by MiniCartBar on
 * first mount and sticky CTA bars. Mirrors `dl-stick-in` (120% → 0%).
 */
export function StickIn({ delay = 0, duration = 280, style, ...rest }: Props) {
  if (Platform.OS === 'web') {
    return <View {...rest} style={style} />;
  }
  return <StickInNative delay={delay} duration={duration} style={style} {...rest} />;
}

function StickInNative({ delay = 0, duration = 280, style, ...rest }: Props) {
  const offset = useSharedValue(120);

  useEffect(() => {
    const t = setTimeout(() => {
      offset.value = withTiming(0, { duration, easing: ease.out });
    }, delay);
    return () => clearTimeout(t);
  }, [delay, duration, offset]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return <Animated.View {...rest} style={[animStyle, style]} />;
}
