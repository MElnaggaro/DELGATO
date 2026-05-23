import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/shared/theme';
import { dur, ease } from '@/shared/motion';
import { useRtl } from '@/shared/hooks/useRtl';

type Props = {
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
};

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 26;
const KNOB = 20;
const TRAVEL = TRACK_WIDTH - KNOB - 6;

/**
 * ToggleSwitch — iOS-style toggle. Used in notification-settings, privacy,
 * security. Mirrors design-reference toggle (44×26 track, 20px knob, olive on,
 * canvas-300 off).
 */
export function ToggleSwitch({ value, onChange, disabled }: Props) {
  const { isRtl } = useRtl();
  const t = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    t.value = withTiming(value ? 1 : 0, { duration: dur.transition - 100, easing: ease.out });
  }, [value, t]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(t.value, [0, 1], [colors.canvas300, colors.olive]),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: isRtl ? -t.value * TRAVEL : t.value * TRAVEL,
      },
    ],
  }));

  return (
    <Pressable
      onPress={disabled ? undefined : () => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.knob, knobStyle]}>
          <View style={styles.knobInner} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: 100,
    justifyContent: 'center',
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: 100,
    marginHorizontal: 3,
  },
  knobInner: {
    width: KNOB,
    height: KNOB,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
});
