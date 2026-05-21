import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import type { ViewProps } from 'react-native';

import { ease } from './presets';

type Props = ViewProps & { delay?: number; duration?: number };

/**
 * Pop — scale(0.92 → 1) + opacity. Used for hero monogram, map pin
 * appearance, decorative letter accents. Sub-spring; still no bounce.
 */
export function Pop({ delay = 0, duration = 280, style, ...rest }: Props) {
  if (Platform.OS === 'web') {
    return <View {...rest} style={style} />;
  }

  return <PopNative delay={delay} duration={duration} style={style} {...rest} />;
}

function PopNative({ delay = 0, duration = 280, style, ...rest }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration, easing: ease.out }));
  }, [t, delay, duration]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ scale: 0.92 + t.value * 0.08 }],
  }));

  return <Animated.View {...rest} style={[animStyle, style]} />;
}
