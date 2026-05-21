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
  /** Stagger delay in ms. Lists multiply by item index (e.g. i * 40). */
  delay?: number;
};

/**
 * Rise — translateY(8 → 0) + opacity(0 → 1) over 300ms ease-out.
 * Use for list items (cards, rows). For inline text use <FadeUp/>.
 */
export function Rise({ delay = 0, style, ...rest }: Props) {
  if (Platform.OS === 'web') {
    return <View {...rest} style={style} />;
  }

  return <RiseNative delay={delay} style={style} {...rest} />;
}

function RiseNative({ delay = 0, style, ...rest }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration: dur.transition, easing: ease.out }));
  }, [t, delay]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateY: (1 - t.value) * 8 }],
  }));

  return <Animated.View {...rest} style={[animStyle, style]} />;
}
