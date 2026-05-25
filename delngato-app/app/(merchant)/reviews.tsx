/**
 * Merchant reviews — customer review listing with average rating.
 * Phase 9 implementation reading from platform store reviews.
 */

import { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';

import { AppBar, Card, Icon, Section } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { usePlatformStore } from '@/domain/stores/platform';

export default function MerchantReviews() {
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection } = useRtl();

  const reviews = usePlatformStore((s) => Object.values(s.reviews));

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return Math.round((reviews.reduce((s, r) => s + r.stars, 0) / reviews.length) * 10) / 10;
  }, [reviews]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="التقييمات" onBack={() => safeBack('/(merchant)/(tabs)/dashboard')} />

      {/* Average rating hero */}
      <View style={{ alignItems: 'center', paddingVertical: 20, gap: 6 }}>
        <Text style={{ fontFamily: fonts.arabicBold, fontSize: 44, color: colors.olive }}>
          {arDigits(avgRating)}
        </Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon.star
              key={star}
              size={18}
              color={star <= Math.round(avgRating) ? colors.gold : colors.canvas300}
            />
          ))}
        </View>
        <Text style={{ fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight }}>
          {arDigits(reviews.length)} تقييم
        </Text>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 30 }}>
            <Text style={{ fontFamily: fonts.arabic, fontSize: 14, color: colors.inkLight }}>
              لا توجد تقييمات بعد
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <FadeUp distance={4}>
            <Card padding={14}>
              <View style={{ flexDirection, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: fonts.arabicSemiBold,
                      fontSize: 14,
                      color: colors.ink,
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    {item.customerName ?? 'عميل'}
                  </Text>
                  {item.body ? (
                    <Text
                      style={{
                        fontFamily: fonts.arabic,
                        fontSize: 13,
                        color: colors.inkLight,
                        marginTop: 4,
                        lineHeight: 20,
                        textAlign: isRtl ? 'right' : 'left',
                      }}
                    >
                      {item.body}
                    </Text>
                  ) : null}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontFamily: fonts.arabicBold, fontSize: 13, color: colors.gold }}>
                    {arDigits(item.stars)}
                  </Text>
                  <Icon.star size={14} color={colors.gold} />
                </View>
              </View>
            </Card>
          </FadeUp>
        )}
      />
    </View>
  );
}
