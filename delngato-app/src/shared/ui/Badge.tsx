import { type ReactNode } from 'react';
import { Text, View, type ViewStyle } from 'react-native';

import { colors, fonts } from '@/shared/theme';

type Variant =
  | 'active'
  | 'pending'
  | 'issue'
  | 'solid-olive'
  | 'solid-gold'
  | 'solid-ink'
  | 'outline'
  | 'ghost';

type Props = {
  variant?: Variant;
  children: ReactNode;
  style?: ViewStyle;
};

const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
  active: { bg: 'rgba(31,74,61,0.08)', fg: colors.olive },
  pending: { bg: 'rgba(232,177,79,0.18)', fg: colors.statusPendingText },
  issue: { bg: 'rgba(197,59,44,0.10)', fg: colors.statusIssueText },
  'solid-olive': { bg: colors.olive, fg: colors.canvas },
  'solid-gold': { bg: colors.gold, fg: colors.ink },
  'solid-ink': { bg: colors.ink, fg: colors.canvas },
  outline: {
    bg: 'transparent',
    fg: colors.inkLight,
    border: colors.canvas300,
  },
  ghost: {
    bg: 'rgba(250,248,243,0.16)',
    fg: colors.canvas,
    border: 'rgba(250,248,243,0.28)',
  },
};

/**
 * Status pill. Brand rule: gold is an accent, never a surface — so `pending`
 * uses a tinted gold background with a darker gold text, not a solid gold pill.
 * `solid-gold` is the one exception, reserved for "today's offer" hero badges.
 */
export function Badge({ variant = 'active', children, style }: Props) {
  const p = palette[variant];
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 100,
          backgroundColor: p.bg,
          borderWidth: p.border ? 1 : 0,
          borderColor: p.border,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily:
            variant === 'outline' ? fonts.arabicMedium : fonts.arabicSemiBold,
          fontSize: variant === 'solid-ink' ? 11 : 12,
          letterSpacing: variant === 'solid-ink' ? 0.04 * 11 : undefined,
          color: p.fg,
          includeFontPadding: false,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
