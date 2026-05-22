import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';

type Props = {
  /** Micro caption label (12px ink-mute) — for settings/form-style groupings. */
  label?: string;
  /** Page-section title (18px bold ink) — for major content sections like "المحلات القريبة". */
  title?: string;
  /** Optional trailing action shown next to a `title` (e.g. "عرض الكل"). */
  action?: {
    label: string;
    onPress: () => void;
  };
  children: ReactNode;
  /** Hide the label/title visually but keep it readable to assistive tech. */
  hideLabel?: boolean;
  /** Override the standard 18px horizontal padding. Use 0 for full-bleed children. */
  paddingHorizontal?: number;
  /** Override the standard 14px top padding. */
  paddingTop?: number;
};

/**
 * Section wrapper used across screens. Two visual modes:
 *   - `label` → micro caption (12px ink-mute) used in checkout, profile groups, etc.
 *   - `title` → page-section title (18px bold ink) used in home "browse by category",
 *     "nearby shops", profile header, etc., with optional trailing action link.
 *
 * If both are passed, `title` wins (label is unused). If neither is passed, the
 * children render with the padding but no header.
 */
export function Section({
  label,
  title,
  action,
  children,
  hideLabel,
  paddingHorizontal = 18,
  paddingTop = 14,
}: Props) {
  const { isRtl, flexDirection } = useRtl();
  return (
    <View style={{ paddingHorizontal, paddingTop }}>
      {!hideLabel && title ? (
        <View
          style={{
            flexDirection,
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 12,
          }}
        >
          <Text
            accessibilityRole="header"
            style={{
              fontFamily: fonts.arabicBold,
              fontSize: 18,
              color: colors.ink,
              includeFontPadding: false,
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            {title}
          </Text>
          {action ? (
            <Pressable onPress={action.onPress} hitSlop={8}>
              <Text
                style={{
                  fontFamily: fonts.arabicSemiBold,
                  fontSize: 13,
                  color: colors.olive,
                  includeFontPadding: false,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                {action.label}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : !hideLabel && label ? (
        <Text
          accessibilityRole="header"
          style={{
            fontFamily: fonts.arabicSemiBold,
            fontSize: 12,
            letterSpacing: 0.5,
            color: colors.inkMute,
            marginBottom: 8,
            includeFontPadding: false,
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          {label}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

