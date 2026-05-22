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

/**
 * Conservative scroll-content paddingBottom that reserves room for the floating
 * bar across both flat-bottom Android devices and notched iPhones. The bar's
 * own height is ~92dp (12 top + 56 lg button + 24 bottom); add ~28 for the
 * iPhone home-indicator inset on the worst case. Screens using this in their
 * `contentContainerStyle.paddingBottom` will avoid clipping their last item
 * under the sticky CTA.
 */
export const STICKY_CTA_HEIGHT = 120;

/**
 * Floating bottom CTA bar matching the design reference's sticky action region
 * (Cart, Checkout, Payment, Product, etc.).
 *
 * Pixel-parity rules (from design-reference JSX `<div style={{ padding: '12px 18px 24px',
 *   background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>`):
 *   - canvas surface, 1px top hairline in canvas-300
 *   - hard 24px bottom padding (NOT just safe-area)
 *   - safe-area inset is added ON TOP of the 24px so notched iPhones get
 *     clear space above the home indicator
 *   - 12px top padding; 18px horizontal; 10px gap between stacked actions
 *
 * Positioning: absolute on the screen by default (so the underlying scroll
 * fills the full screen) — pin via `insetInlineStart/End: 0` so RTL flips
 * naturally. Pair with `contentContainerStyle={{ paddingBottom: STICKY_CTA_HEIGHT }}`
 * on the parent scroll view.
 *
 * `inline` variant drops the absolute positioning and renders the bar as a
 * flex sibling — used by onboarding screens that lay out their own footer.
 */
export function StickyActionBar({ children, style, inline }: Props) {
  const inner = (
    <View
      style={[
        {
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 24,
          gap: 10,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (inline) {
    return (
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.canvas }}>
        {inner}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['bottom']}
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
      {inner}
    </SafeAreaView>
  );
}
