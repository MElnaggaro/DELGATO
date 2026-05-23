import { type ReactNode, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, fonts, fontSize } from '@/shared/theme';
import { ease } from '@/shared/motion';
import { Icon } from './Icon';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  /** Disable backdrop tap-to-close. */
  dismissOnScrim?: boolean;
  /** Disable drag-to-dismiss gesture on the grip area. */
  dismissOnDrag?: boolean;
  /** Max-height ratio of the screen. Default 0.88. */
  maxHeightRatio?: number;
  children: ReactNode;
};

const ENTER_MS = 320;
const EXIT_MS = 260;

/**
 * BottomSheet — modal sheet with grip + scrim + drag-to-dismiss.
 * Mirrors design-reference `dl-sheet` + `dl-sheet-scrim`. Uses
 * react-native-gesture-handler for the drag.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  dismissOnScrim = true,
  dismissOnDrag = true,
  maxHeightRatio = 0.88,
  children,
}: Props) {
  const translateY = useSharedValue(800);
  const scrimOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: ENTER_MS, easing: ease.out });
      scrimOpacity.value = withTiming(1, { duration: 200, easing: ease.out });
    } else {
      translateY.value = 800;
      scrimOpacity.value = 0;
    }
  }, [visible, translateY, scrimOpacity]);

  const handleClose = () => {
    translateY.value = withTiming(800, { duration: EXIT_MS, easing: ease.in });
    scrimOpacity.value = withTiming(0, { duration: 200, easing: ease.in }, (done) => {
      if (done) runOnJS(onClose)();
    });
  };

  const drag = Gesture.Pan()
    .enabled(dismissOnDrag)
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 800) {
        translateY.value = withTiming(800, { duration: EXIT_MS, easing: ease.in }, (done) => {
          if (done) runOnJS(onClose)();
        });
      } else {
        translateY.value = withTiming(0, { duration: 220, easing: ease.out });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: scrimOpacity.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={dismissOnScrim ? handleClose : undefined}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { maxHeight: `${maxHeightRatio * 100}%` as `${number}%` },
            sheetStyle,
          ]}
        >
          <GestureDetector gesture={drag}>
            <View style={styles.gripWrap}>
              <View style={styles.grip} />
            </View>
          </GestureDetector>

          {title ? (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable
                onPress={handleClose}
                accessibilityRole="button"
                accessibilityLabel="إغلاق"
                style={styles.closeBtn}
              >
                <Icon.x size={16} color={colors.ink} />
              </Pressable>
            </View>
          ) : null}

          <View style={{ flex: 1 }}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: 'rgba(15,26,23,0.48)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.canvas,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    shadowColor: '#0F1A17',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: -8 },
    shadowRadius: 30,
    elevation: 16,
    overflow: 'hidden',
  },
  gripWrap: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  grip: {
    width: 36,
    height: 4,
    backgroundColor: colors.canvas300,
    borderRadius: 100,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 2,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.arabicBold,
    fontSize: fontSize.h3 - 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 100,
    backgroundColor: colors.canvas200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
