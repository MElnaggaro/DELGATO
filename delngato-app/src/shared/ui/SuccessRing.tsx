import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/shared/theme';
import { ease } from '@/shared/motion';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type Props = {
  size?: number;
  checkSize?: number;
};

/**
 * SuccessRing — the olive circle with stroke-drawn check used on
 * order success + refund success. Mirrors `dl-success-ring` + `dl-check-path`.
 * Ring scales in (320ms), check strokes (360ms after 240ms delay).
 */
export function SuccessRing({ size = 88, checkSize = 56 }: Props) {
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);
  const dashOffset = useSharedValue(36);

  useEffect(() => {
    if (Platform.OS === 'web') {
      ringScale.value = 1;
      ringOpacity.value = 1;
      dashOffset.value = 0;
      return;
    }
    ringScale.value = withTiming(1, { duration: 320, easing: ease.out });
    ringOpacity.value = withTiming(1, { duration: 320, easing: ease.out });
    dashOffset.value = withDelay(240, withTiming(0, { duration: 360, easing: ease.out }));
  }, [ringScale, ringOpacity, dashOffset]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const pathProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.olive,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: colors.olive,
          shadowOpacity: 0.28,
          shadowOffset: { width: 0, height: 12 },
          shadowRadius: 32,
          elevation: 8,
        },
        ringStyle,
      ]}
    >
      <Svg width={checkSize} height={checkSize} viewBox="0 0 24 24" fill="none">
        <AnimatedPath
          d="M20 6 L9 17 L4 12"
          stroke={colors.canvas}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={36}
          animatedProps={pathProps}
        />
      </Svg>
    </Animated.View>
  );
}

/** SSR-safe fallback for web. */
export function SuccessRingStatic({ size = 88, checkSize = 56 }: Props) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.olive,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={checkSize} height={checkSize} viewBox="0 0 24 24" fill="none">
        <Path
          d="M20 6 L9 17 L4 12"
          stroke={colors.canvas}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
