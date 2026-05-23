import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { ViewProps } from 'react-native';

type Props = ViewProps & {
  /** Pulse cycle duration in ms. Default 1600 matches `dl-pulse` keyframe. */
  duration?: number;
  /** Delay before the first cycle. Useful for staggered concentric rings. */
  delay?: number;
  /** Max scale at the end of the cycle. Default 1.8. */
  maxScale?: number;
  /** Active or paused. Default true. */
  active?: boolean;
};

/**
 * Pulse — a concentric ring expanding outward while fading. Used by
 * LiveDot, biometric scanner, location permission map ping.
 *
 * Renders an absolute-positioned ring; the parent must `position: 'relative'`.
 */
export function Pulse({
  duration = 1600,
  delay = 0,
  maxScale = 1.8,
  active = true,
  style,
  ...rest
}: Props) {
  if (Platform.OS === 'web') {
    return <View {...rest} style={style} />;
  }
  return (
    <PulseNative
      duration={duration}
      delay={delay}
      maxScale={maxScale}
      active={active}
      style={style}
      {...rest}
    />
  );
}

function PulseNative({ duration, delay, maxScale, active, style, ...rest }: Required<Pick<Props, 'duration' | 'delay' | 'maxScale' | 'active'>> & ViewProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      cancelAnimation(progress);
      progress.value = 0;
      return;
    }
    const t = setTimeout(() => {
      progress.value = withRepeat(
        withTiming(1, { duration, easing: Easing.out(Easing.quad) }),
        -1,
        false,
      );
    }, delay);
    return () => {
      clearTimeout(t);
      cancelAnimation(progress);
    };
  }, [duration, delay, active, progress]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * (maxScale - 1) }],
    opacity: 1 - progress.value,
  }));

  return <Animated.View {...rest} style={[animStyle, style]} />;
}
