import { Pressable, Text, View } from 'react-native';

import { colors, fonts, shadow } from '@/shared/theme';
import type { Shop } from '@/features/catalog/data';
import { useRtl } from '@/shared/hooks/useRtl';
import { Badge } from './Badge';
import { Icon } from './Icon';

type Props = {
  shop: Shop;
  onPress?: () => void;
  compact?: boolean;
};

export function ShopCard({ shop, onPress, compact }: Props) {
  const { isRtl, flexDirection, pick } = useRtl();
  const tileWidth = compact ? 64 : 84;
  const letterSize = compact ? 28 : 36;
  const phantomSize = compact ? 64 : 96;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flexDirection,
        borderRadius: 12,
        backgroundColor: colors.bgElevated,
        overflow: 'hidden',
        opacity: shop.open ? (pressed ? 0.92 : 1) : 0.78,
        ...shadow.card,
      })}
    >
      <View
        style={{
          width: tileWidth,
          minWidth: tileWidth,
          backgroundColor: shop.bgFrom,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Text
          style={{
            position: 'absolute',
            fontSize: phantomSize,
            fontFamily: fonts.arabicBold,
            color: 'rgba(250,248,243,0.10)',
            top: -6,
            right: 4,
            lineHeight: phantomSize,
          }}
        >
          {shop.letter}
        </Text>
        <Text
          style={{
            fontFamily: fonts.arabicBold,
            fontSize: letterSize,
            color: colors.canvas,
          }}
        >
          {shop.letter}
        </Text>
      </View>
      <View style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 14, gap: 6, minWidth: 0 }}>
        <View style={{ flexDirection, alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: fonts.arabicSemiBold,
              fontSize: 15,
              color: colors.ink,
              flex: 1,
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            {shop.name}
          </Text>
          <Badge variant={shop.open ? 'active' : 'issue'}>{shop.open ? 'مفتوح' : 'مغلق'}</Badge>
        </View>
        <Text style={{ fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight, textAlign: isRtl ? 'right' : 'left' }}>
          {shop.cat} · {shop.distance}
        </Text>
        <View style={{ flexDirection, alignItems: 'center', gap: 12, marginTop: 2 }}>
          <View style={{ flexDirection, alignItems: 'center', gap: 3 }}>
            <Icon.star size={13} color={colors.gold} />
            <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 12, color: colors.inkLight, textAlign: isRtl ? 'right' : 'left' }}>
              {shop.rating}
            </Text>
          </View>
          <View style={{ flexDirection, alignItems: 'center', gap: 4 }}>
            <Icon.clock size={13} color={colors.inkLight} />
            <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 12, color: colors.inkLight, textAlign: isRtl ? 'right' : 'left' }}>
              {shop.eta}
            </Text>
          </View>
          <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 12, color: colors.inkLight, textAlign: isRtl ? 'right' : 'left' }}>
            توصيل {shop.fee}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
