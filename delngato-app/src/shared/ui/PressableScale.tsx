import { type ReactNode } from 'react';
import { Pressable, type PressableProps, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { dur, ease } from '@/shared/motion';

type Props = Omit<PressableProps, 'children'> & {
  children: ReactNode;
  /** scale on press, default 0.96. */
  scaleTo?: number;
  style?: ViewStyle;
};

/**
 * Press feedback wrapper. translates the "100ms scale 0.88-ish" pattern from
 * the HTML reference's add-button into a proper Reanimated worklet so it stays
 * smooth on the UI thread. 100ms is brand-spec micro motion.
 */
export function PressableScale({ children, scaleTo = 0.96, style, ...rest }: Props) {
  const s = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: s.value }],
  }));
  return (
    <Pressable
      {...rest}
      onPressIn={(e) => {
        s.value = withTiming(scaleTo, { duration: dur.micro, easing: ease.out });
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.value = withTiming(1, { duration: dur.micro, easing: ease.out });
        rest.onPressOut?.(e);
      }}
    >
      <Animated.View style={[animStyle, style]}>{children}</Animated.View>
    </Pressable>
  );
}
