import { Text, View } from 'react-native';

import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';

type Props = {
  code: string;
  length?: number;
  error?: boolean;
};

/**
 * 6-cell OTP display. Current cell shows a thicker olive ring; filled cells
 * show the digit in mono-ish style. Active cell pulses subtly via opacity
 * cycling (not implemented here as a real animation — kept calm per brand).
 */
export function OtpCells({ code, length = 6, error }: Props) {
  const arDigits = useArabicDigits();
  const cells = Array.from({ length }, (_, i) => code[i] ?? '');
  const activeIdx = code.length;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
      {cells.map((c, i) => {
        const filled = c !== '';
        const isActive = i === activeIdx && !error;
        return (
          <View
            key={i}
            style={{
              width: 44,
              height: 56,
              borderRadius: 10,
              borderWidth: isActive || filled ? 2 : 1.5,
              borderColor: error
                ? colors.statusIssue
                : filled || isActive
                ? colors.olive
                : colors.canvas300,
              backgroundColor: filled ? colors.bgElevated : colors.canvas200,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: 22,
                color: colors.ink,
              }}
            >
              {filled ? arDigits(c) : ''}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
