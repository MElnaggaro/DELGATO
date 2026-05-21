import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/shared/theme';
import { Icon } from './Icon';

type Props = {
  size?: number;
  color?: string;
};

export function Spinner({ size = 20, color = colors.olive }: Props) {
  const r = useSharedValue(0);
  useEffect(() => {
    r.value = withRepeat(withTiming(360, { duration: 700 }), -1, false);
  }, [r]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return (
    <Animated.View style={style}>
      <Icon.refresh size={size} color={color} />
    </Animated.View>
  );
}
