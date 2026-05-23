import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { AppBar, Button, Icon } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useLoyaltyStore } from '@/features/loyalty/store';
import { REWARDS } from '@/features/loyalty/data';

export default function Points() {
  const router = useRouter();
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection } = useRtl();
  const points = useLoyaltyStore((s) => s.points);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="نقاط دلنجاتُو" onBack={() => safeBack('/(tabs)/profile')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28 }}>
        <FadeUp>
          <LinearGradient
            colors={[colors.gold, colors.gold600]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              height: 160,
              borderRadius: 16,
              padding: 20,
              overflow: 'hidden',
              justifyContent: 'space-between',
              marginTop: 8,
            }}
          >
            <View style={{ flexDirection, justifyContent: 'space-between', alignItems: 'center' }}>
              <Text
                style={{ fontFamily: fonts.arabicMedium, fontSize: 12, color: 'rgba(15,26,23,0.7)' }}
              >
                النقاط المتاحة
              </Text>
              <Icon.star size={22} color={colors.ink} />
            </View>
            <View>
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 40, color: colors.ink }}>
                {arDigits(points)}{' '}
                <Text
                  style={{
                    fontFamily: fonts.arabicMedium,
                    fontSize: 16,
                    color: 'rgba(15,26,23,0.6)',
                  }}
                >
                  نقطة
                </Text>
              </Text>
              <Text style={{ fontFamily: fonts.arabic, fontSize: 12, color: 'rgba(15,26,23,0.6)' }}>
                كل ١٠٠ نقطة = ٥ ج.م خصم
              </Text>
            </View>
          </LinearGradient>
        </FadeUp>

        <Text style={section(isRtl)}>كافآت متاحة</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {REWARDS.map((rw) => {
            const enough = points >= rw.cost;
            return (
              <View
                key={rw.id}
                style={{
                  width: '48%',
                  backgroundColor: colors.bgElevated,
                  borderRadius: 12,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: colors.canvas300,
                  opacity: enough ? 1 : 0.55,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: 'rgba(31,74,61,0.08)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                  }}
                >
                  {rw.icon === 'bike' ? (
                    <Icon.bike size={20} color={colors.olive} />
                  ) : rw.icon === 'tag' ? (
                    <Icon.tag size={20} color={colors.olive} />
                  ) : (
                    <Icon.star size={20} color={colors.olive} />
                  )}
                </View>
                <Text
                  style={{
                    fontFamily: fonts.arabicBold,
                    fontSize: 14,
                    color: colors.ink,
                  }}
                >
                  {rw.title}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.arabic,
                    fontSize: 11,
                    color: colors.inkLight,
                    marginTop: 4,
                    lineHeight: 17,
                    minHeight: 34,
                  }}
                >
                  {rw.desc}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.arabicBold,
                    fontSize: 13,
                    color: enough ? colors.olive : colors.inkMute,
                    marginTop: 10,
                  }}
                >
                  {arDigits(rw.cost)} نقطة
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ marginTop: 16 }}>
          <Button variant="primary" full onPress={() => router.push('/rewards')}>
            استبدل نقاطك
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

function section(isRtl: boolean) {
  return {
    fontFamily: fonts.arabicSemiBold,
    fontSize: 12,
    color: colors.inkMute,
    letterSpacing: 0.4,
    marginTop: 20,
    marginBottom: 10,
    textAlign: (isRtl ? 'right' : 'left') as 'right' | 'left',
  } as const;
}
