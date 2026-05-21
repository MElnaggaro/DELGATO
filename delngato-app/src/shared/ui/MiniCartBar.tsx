import { Pressable, Text, View } from 'react-native';

import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';

type Props = {
  count: number;
  total: number;
  shopName: string;
  onPress?: () => void;
};

export function MiniCartBar({ count, total, shopName, onPress }: Props) {
  const arDigits = useArabicDigits();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        position: 'absolute',
        insetInlineStart: 16,
        insetInlineEnd: 16,
        bottom: 16,
        backgroundColor: pressed ? colors.olive700 : colors.olive,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        shadowColor: colors.ink,
        shadowOpacity: 0.22,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 6,
      })}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 100,
          backgroundColor: colors.gold,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontFamily: fonts.arabicBold, fontSize: 13, color: colors.ink }}>
          {arDigits(count)}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.canvas }}>
          عرض السلة
        </Text>
        <Text style={{ fontFamily: fonts.arabic, fontSize: 11, color: 'rgba(250,248,243,0.7)' }}>
          {shopName}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
        <Text style={{ fontFamily: fonts.arabicBold, fontSize: 16, color: colors.canvas }}>
          {arDigits(total)}
        </Text>
        <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 11, color: 'rgba(250,248,243,0.7)' }}>
          ج.م
        </Text>
      </View>
    </Pressable>
  );
}
