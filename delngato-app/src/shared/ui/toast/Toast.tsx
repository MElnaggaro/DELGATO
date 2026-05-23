import { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

import { colors, fonts, fontSize } from '@/shared/theme';
import { dur, ease } from '@/shared/motion/presets';
import { useToastStore } from './store';

const VISIBLE_MS = 2200;
const ENTER_MS = 240;
const EXIT_MS = 200;

/**
 * Global toast host. Mount once at the root layout above all screens.
 * Pulls from useToastStore and renders the current entry; auto-dismisses
 * after VISIBLE_MS, then advances queue.
 */
export function ToastHost() {
  const insets = useSafeAreaInsets();
  const current = useToastStore((s) => s.current);
  const dismiss = useToastStore((s) => s.dismiss);

  const translate = useSharedValue(-12);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!current) return;
    translate.value = -12;
    opacity.value = 0;
    translate.value = withTiming(0, { duration: ENTER_MS, easing: ease.out });
    opacity.value = withTiming(1, { duration: ENTER_MS, easing: ease.out });
    const t = setTimeout(() => {
      translate.value = withTiming(-12, { duration: EXIT_MS, easing: ease.in });
      opacity.value = withTiming(0, { duration: EXIT_MS, easing: ease.in }, (done) => {
        if (done) runOnJS(dismiss)();
      });
    }, VISIBLE_MS);
    return () => clearTimeout(t);
  }, [current?.id]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translate.value }],
    opacity: opacity.value,
  }));

  if (!current) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { top: insets.top + 12 }]}
    >
      <Animated.View style={[styles.toast, style]}>
        {current.icon ? <View style={styles.icon}>{current.icon}</View> : null}
        <Text style={styles.text} numberOfLines={2}>
          {current.msg}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 18,
    right: 18,
    zIndex: 90,
  },
  toast: {
    backgroundColor: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#0F1A17',
    shadowOpacity: 0.24,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 26,
    elevation: 8,
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.canvas,
    fontFamily: fonts.arabicMedium,
    fontSize: fontSize.body - 2,
    lineHeight: (fontSize.body - 2) * 1.4,
    flex: 1,
  },
});
