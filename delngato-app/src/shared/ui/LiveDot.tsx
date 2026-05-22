import { useEffect } from 'react';
import { Platform, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/shared/theme';

type Props = {
  /** Visible dot diameter (default 8). */
  size?: number;
  /** Dot fill color (default olive). */
  color?: string;
  /** Halo ring color (defaults to `color` at 60% via opacity). */
  ringColor?: string;
  /** Wrapper style — use for absolute positioning if needed. */
  style?: ViewStyle;
};

/**
 * Pulsing live indicator. Mirrors design reference `.dl-live-dot`:
 *   - a solid dot
 *   - an outer ring that scales 1 → 1.8 and fades 1 → 0 on a ~1.6s loop
 *
 * Used by:
 *   - OrderProgress current step center
 *   - Home active-order banner
 *   - Tracking map "مباشر" badge
 *   - Orders list live row indicator
 */
export function LiveDot({ size = 8, color = colors.olive, ringColor, style }: Props) {
  if (Platform.OS === 'web') {
    // Reanimated worklets are flaky on web; render the solid dot only.
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          style,
        ]}
      />
    );
  }
  return <LiveDotNative size={size} color={color} ringColor={ringColor} style={style} />;
}

function LiveDotNative({ size = 8, color = colors.olive, ringColor, style }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }),
      -1,
      false,
    );
  }, [t]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 1 - t.value,
    transform: [{ scale: 1 + t.value * 0.8 }],
  }));

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: ringColor ?? color,
          },
          ringStyle,
        ]}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
