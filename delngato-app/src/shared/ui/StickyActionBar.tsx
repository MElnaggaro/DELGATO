import { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/shared/theme';

type Props = {
  children: ReactNode;
  /**
   * Reserve this much space at the bottom of the parent scroll view by setting
   * the parent's `contentContainerStyle={{ paddingBottom: STICKY_CTA_HEIGHT }}`.
   * Exported as `STICKY_CTA_HEIGHT` for convenience.
   */
  style?: ViewStyle;
  /** Render as a non-floating block (no absolute positioning). For full-screen flows like onboarding. */
  inline?: boolean;
};

/** Approximate height including safe-area inset — use as scroll content paddingBottom. */
export const STICKY_CTA_HEIGHT = 96;

/**
 * Floating bottom CTA bar matching the design reference's sticky action region.
 * - Canvas surface so it visually lifts off the scroll content below.
 * - 1px top border (canvas-300) for separation.
 * - Honors bottom safe area via SafeAreaView.
 * - Uses `insetInlineStart/End` so it pins to the visual edges in RTL.
 */
export function StickyActionBar({ children, style, inline }: Props) {
  if (inline) {
    return (
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.canvas }}>
        <View
          style={[
            {
              paddingHorizontal: 18,
              paddingTop: 12,
              paddingBottom: 8,
              gap: 10,
            },
            style,
          ]}
        >
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        insetInlineStart: 0,
        insetInlineEnd: 0,
        bottom: 0,
        backgroundColor: colors.canvas,
        borderTopWidth: 1,
        borderTopColor: colors.canvas300,
      }}
    >
      <SafeAreaView edges={['bottom']}>
        <View
          style={[
            {
              paddingHorizontal: 18,
              paddingTop: 12,
              paddingBottom: 8,
              gap: 10,
            },
            style,
          ]}
        >
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}
