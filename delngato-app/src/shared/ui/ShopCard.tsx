import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, fonts, shadow } from '@/shared/theme';
import type { Store } from '@/domain/types';
import { useRtl } from '@/shared/hooks/useRtl';
import { Badge } from './Badge';
import { Icon } from './Icon';

type Props = {
  shop: Store;
  onPress?: () => void;
  compact?: boolean;
};

/** Derive Arabic ETA string from prepTimeMin. */
function formatEta(prepTime: number): string {
  const low = prepTime;
  const high = prepTime + Math.round(prepTime * 0.5);
  return `${low}–${high} د`;
}

/** Derive Arabic fee string from deliveryFee number. */
function formatFee(fee: number): string {
  return `${fee} ج.م`;
}

/** Derive Arabic rating string from numeric rating. */
function formatRating(rating: number): string {
  return rating.toFixed(1).replace('.', '٫');
}

export function ShopCard({ shop, onPress, compact }: Props) {
  const { isRtl, flexDirection, pick } = useRtl();
  const tileWidth = compact ? 64 : 84;
  const letterSize = compact ? 28 : 36;
  const phantomSize = compact ? 64 : 96;

  return (
    <View style={{ ...shadow.card, borderRadius: 12, backgroundColor: colors.bgElevated }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => ({
          borderRadius: 12,
          opacity: shop.open ? (pressed ? 0.92 : 1) : 0.78,
        })}
      >
        <View style={{ flexDirection: 'row', width: '100%', borderRadius: 12, overflow: 'hidden' }}>
          <LinearGradient
            colors={[shop.bg.bgFrom, shop.bg.bgTo || colors.olive900]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: tileWidth,
              minWidth: tileWidth,
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
                includeFontPadding: false,
              }}
            >
              {shop.letter}
            </Text>
            <Text
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: letterSize,
                color: colors.canvas,
                includeFontPadding: false,
              }}
            >
              {shop.letter}
            </Text>
          </LinearGradient>
          <View style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 14, gap: 6, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: fonts.arabicSemiBold,
                  fontSize: 15,
                  color: colors.ink,
                  flex: 1,
                }}
              >
                {shop.name}
              </Text>
              <Badge variant={shop.open ? 'active' : 'issue'}>{shop.open ? 'مفتوح' : 'مغلق'}</Badge>
            </View>
            <Text style={{ fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight }}>
              {shop.category} · {shop.distance ?? ''}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Icon.star size={13} color={colors.gold} />
                <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 12, color: colors.inkLight }}>
                  {formatRating(shop.rating)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon.clock size={13} color={colors.inkLight} />
                <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 12, color: colors.inkLight }}>
                  {formatEta(shop.prepTimeMin)}
                </Text>
              </View>
              <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 12, color: colors.inkLight }}>
                توصيل {formatFee(shop.deliveryFee)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
