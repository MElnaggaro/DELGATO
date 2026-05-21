import { Text, View } from 'react-native';

import { colors, fonts } from '@/shared/theme';

type Props = {
  label: string;
  value: string;
  bold?: boolean;
};

/** Two-column label/value row used by cart and order summaries. */
export function Row({ label, value, bold }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingVertical: 4,
      }}
    >
      <Text
        style={{
          fontFamily: bold ? fonts.arabicBold : fonts.arabicMedium,
          fontSize: bold ? 15 : 13,
          color: bold ? colors.ink : colors.inkLight,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: bold ? fonts.arabicBold : fonts.arabicSemiBold,
          fontSize: bold ? 18 : 14,
          color: colors.ink,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
