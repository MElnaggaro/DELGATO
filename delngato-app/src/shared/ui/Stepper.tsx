import { Pressable, Text, View } from 'react-native';

import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { Bump } from '@/shared/motion';
import { Icon } from './Icon';

type Props = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  compact?: boolean;
};

/**
 * Quantity stepper. Increment button is the "primary" surface (olive on canvas);
 * decrement is the "alternate" (canvas-200 on olive text). Disabled at min
 * with 50% opacity. Digits localized via useArabicDigits.
 */
export function Stepper({ value, onChange, min = 0, compact = false }: Props) {
  const arDigits = useArabicDigits();
  const { flexDirection } = useRtl();
  const size = compact ? 28 : 36;
  const iconSize = compact ? 14 : 16;
  const atMin = value <= min;

  return (
    <View style={{ flexDirection, alignItems: 'center', gap: 8 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="نقص"
        disabled={atMin}
        onPress={() => onChange(Math.max(min, value - 1))}
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          backgroundColor: colors.canvas200,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: atMin ? 0.4 : 1,
        }}
      >
        <Icon.minus size={iconSize} color={colors.olive} />
      </Pressable>
      <Bump trigger={value} style={{ minWidth: 22, alignItems: 'center', justifyContent: 'center' }}>
        <Text
          style={{
            textAlign: 'center',
            fontFamily: fonts.arabicSemiBold,
            fontSize: compact ? 14 : 16,
            color: colors.ink,
          }}
        >
          {arDigits(value)}
        </Text>
      </Bump>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="زيادة"
        onPress={() => onChange(value + 1)}
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          backgroundColor: colors.olive,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon.plus size={iconSize} color={colors.canvas} />
      </Pressable>
    </View>
  );
}
