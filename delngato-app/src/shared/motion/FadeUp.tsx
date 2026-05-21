import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import type { ViewProps } from 'react-native';

import { dur, ease } from './presets';

type Props = ViewProps & {
  delay?: number;
  /** translateY start, default 4 (subtle FadeUp). */
  distance?: number;
  /** override duration. */
  duration?: number;
};

/**
 * FadeUp — small translateY + opacity entrance. Use for inline elements
 * (titles, captions). For list items use <Rise/>.
 */
export function FadeUp({ delay = 0, distance = 4, duration = dur.transition, style, ...rest }: Props) {
  if (Platform.OS === 'web') {
    return <View {...rest} style={style} />;
  }

  return <FadeUpNative delay={delay} distance={distance} duration={duration} style={style} {...rest} />;
}

function FadeUpNative({ delay = 0, distance = 4, duration = dur.transition, style, ...rest }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration, easing: ease.out }));
  }, [t, delay, duration]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateY: (1 - t.value) * distance }],
  }));

  return <Animated.View {...rest} style={[animStyle, style]} />;
}
