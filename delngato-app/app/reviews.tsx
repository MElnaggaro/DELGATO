import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppBar, Chip, Icon } from '@/shared/ui';
import { FadeUp, Rise } from '@/shared/motion';
import { colors, fonts, shadow } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { REVIEWS, findShop } from '@/features/catalog/data';

export default function Reviews() {
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection } = useRtl();
  const params = useLocalSearchParams<{ shopId?: string }>();
  const shop = findShop(params.shopId ?? '');

  const breakdown = [
    { stars: 5, pct: 0.62 },
    { stars: 4, pct: 0.24 },
    { stars: 3, pct: 0.08 },
    { stars: 2, pct: 0.04 },
    { stars: 1, pct: 0.02 },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title={shop?.name ?? 'التقييمات'} onBack={() => safeBack('/shop')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28, paddingTop: 12 }}>
        <FadeUp>
          <View
            style={{
              backgroundColor: colors.bgElevated,
              borderRadius: 14,
              padding: 16,
              flexDirection,
              alignItems: 'center',
              gap: 18,
              ...shadow.card,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 36, color: colors.olive }}>
                {shop?.rating ?? '٤٫٨'}
              </Text>
              <View style={{ flexDirection: 'row', gap: 2, marginTop: 4 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Icon.star
                    key={i}
                    size={12}
                    color={i <= 5 ? colors.gold : colors.canvas300}
                    fill={i <= 5 ? colors.gold : 'transparent'}
                  />
                ))}
              </View>
              <Text
                style={{
                  fontFamily: fonts.arabic,
                  fontSize: 11,
                  color: colors.inkLight,
                  marginTop: 6,
                }}
              >
                {arDigits(REVIEWS.length * 18)} تقييم
              </Text>
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              {breakdown.map((b) => (
                <View key={b.stars} style={{ flexDirection, alignItems: 'center', gap: 8 }}>
                  <Text
                    style={{
                      fontFamily: fonts.arabicMedium,
                      fontSize: 11,
                      color: colors.inkLight,
                      width: 14,
                    }}
                  >
                    {arDigits(b.stars)}
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      height: 6,
                      borderRadius: 100,
                      backgroundColor: colors.canvas200,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: `${b.pct * 100}%`,
                        height: 6,
                        backgroundColor: colors.gold,
                      }}
                    />
                  </View>
                  <Text
                    style={{
                      fontFamily: fonts.arabicMedium,
                      fontSize: 10,
                      color: colors.inkLight,
                      width: 30,
                      textAlign: 'left',
                    }}
                  >
                    {arDigits(Math.round(b.pct * 100))}٪
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </FadeUp>

        <Text
          style={{
            fontFamily: fonts.arabicSemiBold,
            fontSize: 12,
            color: colors.inkMute,
            letterSpacing: 0.4,
            marginTop: 22,
            marginBottom: 10,
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          آراء العملاء
        </Text>

        <View style={{ gap: 12 }}>
          {REVIEWS.map((r, i) => (
            <Rise key={r.id} delay={i * 50}>
              <View
                style={{
                  backgroundColor: colors.bgElevated,
                  borderRadius: 12,
                  padding: 14,
                  ...shadow.card,
                }}
              >
                <View style={{ flexDirection, alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 100,
                      backgroundColor: colors.olive,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fonts.arabicBold,
                        fontSize: 16,
                        color: colors.canvas,
                      }}
                    >
                      {r.avatar}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: fonts.arabicSemiBold,
                        fontSize: 14,
                        color: colors.ink,
                        textAlign: isRtl ? 'right' : 'left',
                      }}
                    >
                      {r.name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.arabic,
                        fontSize: 11,
                        color: colors.inkLight,
                        textAlign: isRtl ? 'right' : 'left',
                      }}
                    >
                      {r.date}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 1 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Icon.star
                        key={s}
                        size={12}
                        color={s <= r.stars ? colors.gold : colors.canvas300}
                        fill={s <= r.stars ? colors.gold : 'transparent'}
                      />
                    ))}
                  </View>
                </View>
                <Text
                  style={{
                    fontFamily: fonts.arabic,
                    fontSize: 14,
                    color: colors.ink,
                    lineHeight: 21,
                    marginTop: 12,
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  {r.body}
                </Text>
                {r.tags.length > 0 ? (
                  <View
                    style={{
                      marginTop: 12,
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 6,
                    }}
                  >
                    {r.tags.map((tag) => (
                      <Chip key={tag} active={false}>
                        {tag}
                      </Chip>
                    ))}
                  </View>
                ) : null}
              </View>
            </Rise>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
