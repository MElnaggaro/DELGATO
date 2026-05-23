import { useEffect } from 'react';
import { Platform, View, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { colors } from '@/shared/theme';

type SkelProps = {
  w?: number | `${number}%`;
  h?: number;
  r?: number;
  style?: ViewStyle;
};

/**
 * Skeleton primitive — shimmer placeholder. Mirrors design-reference
 * `dl-skel` (gradient sweep over 1.4s).
 *
 * On RN we approximate the CSS gradient sweep with a fading opacity loop
 * between canvas-200 and a lighter shade. Close enough visually.
 */
export function Skel({ w = '100%', h = 12, r = 8, style }: SkelProps) {
  const t = useSharedValue(0);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    t.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(t);
  }, [t]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: 0.65 + t.value * 0.35,
  }));

  return (
    <Animated.View
      style={[
        {
          width: w,
          height: h,
          borderRadius: r,
          backgroundColor: colors.canvas200,
        },
        animStyle,
        style,
      ]}
    />
  );
}

/** Pre-composed skeletons that mirror real card layouts. */
export function ShopCardSkel() {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.bgElevated,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#0F1A17',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Skel w={84} h={92} r={0} />
      <View style={{ flex: 1, padding: 14, gap: 8 }}>
        <Skel w="60%" h={14} />
        <Skel w="40%" h={11} />
        <Skel w="70%" h={11} />
      </View>
    </View>
  );
}

export function ProductTileSkel() {
  return (
    <View
      style={{
        backgroundColor: colors.bgElevated,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.canvas300,
        padding: 10,
        gap: 8,
      }}
    >
      <Skel h={96} r={10} />
      <Skel w="80%" h={14} />
      <Skel w="50%" h={11} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skel w={50} h={14} />
        <Skel w={30} h={30} r={8} />
      </View>
    </View>
  );
}

export function OrderCardSkel() {
  return (
    <View
      style={{
        backgroundColor: colors.bgElevated,
        borderRadius: 12,
        padding: 14,
        shadowColor: '#0F1A17',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Skel w={40} h={40} r={20} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skel w="60%" h={14} />
          <Skel w="40%" h={11} />
        </View>
        <Skel w={70} h={22} r={11} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Skel w={60} h={11} />
        <Skel w={70} h={14} />
      </View>
    </View>
  );
}
