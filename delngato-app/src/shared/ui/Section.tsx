import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { colors, fonts } from '@/shared/theme';

type Props = {
  label: string;
  children: ReactNode;
  /** Hide the label visually but keep it readable to assistive tech. */
  hideLabel?: boolean;
};

/**
 * Section header used across Checkout, Cart, Tracking. The micro caption
 * "header" with 0.04em letter-spacing is the brand's secondary header style.
 */
export function Section({ label, children, hideLabel }: Props) {
  return (
    <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
      {!hideLabel && (
        <Text
          accessibilityRole="header"
          style={{
            fontFamily: fonts.arabicSemiBold,
            fontSize: 12,
            letterSpacing: 0.5,
            color: colors.inkMute,
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
      )}
      {children}
    </View>
  );
}
