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

type Props = ViewProps & { delay?: number };

/**
 * LogoIn — splash brand reveal. Scale 0.88 → 1.04 → 1, fade in, 560ms.
 * Mirrors `dl-logo-in` keyframe.
 */
export function LogoIn({ delay = 0, style, ...rest }: Props) {
  if (Platform.OS === 'web') {
    return <View {...rest} style={style} />;
  }
  return <LogoInNative delay={delay} style={style} {...rest} />;
}

function LogoInNative({ delay = 0, style, ...rest }: Props) {
  const scale = useSharedValue(0.88);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const t = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 280, easing: ease.out });
      scale.value = withSequence(
        withTiming(1.04, { duration: 336, easing: ease.out }),
        withTiming(1, { duration: 224, easing: ease.out }),
      );
    }, delay);
    return () => clearTimeout(t);
  }, [delay, scale, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View {...rest} style={[animStyle, style]} />;
}
