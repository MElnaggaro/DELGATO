import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { AppBar, Button, Icon } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts, shadow } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useLoyaltyStore } from '@/features/loyalty/store';

export default function Points() {
  const router = useRouter();
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection } = useRtl();
  const points = useLoyaltyStore((s) => s.points);
  const nextTierPoints = 5000;
  const pointsRemaining = nextTierPoints - points;
  const progressPercent = (points / nextTierPoints) * 100;

  const EARN_METHODS = [
    { title: '١ نقطة على كل جنيه', desc: 'في كل طلب توصلك على البيت', icon: <Icon.bag size={18} color={colors.olive} /> },
    { title: '٥٠ نقطة هدية', desc: 'لما تقيّم طلبك بصدق', icon: <Icon.star size={18} color={colors.olive} /> },
    { title: '٢٠٠ نقطة', desc: 'لما تدعو صديق ويعمل أول طلب', icon: <Icon.user size={18} color={colors.olive} /> },
    { title: '× ٢ نقاط', desc: 'يوم جمعة على كل طلباتك', icon: <Icon.flame size={18} color={colors.olive} /> },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="نقاط دلنجاتُو" onBack={() => safeBack('/(tabs)/profile')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24 }}>
        <FadeUp>
          <LinearGradient
            colors={['rgb(31, 74, 61)', 'rgb(23, 54, 41)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 18,
              padding: 22,
              position: 'relative',
              overflow: 'hidden',
              marginTop: 10,
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: -40,
                [isRtl ? 'left' : 'right']: -30,
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: 'rgba(232, 177, 79, 0.12)',
              }}
            />
            <View style={{ position: 'relative' }}>
              <View style={{ alignSelf: 'flex-start', backgroundColor: colors.gold, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 }}>
                <Text style={{ fontFamily: fonts.arabicBold, fontSize: 12, color: colors.ink }}>
                  ذهبي
                </Text>
              </View>
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 48, color: colors.canvas, marginTop: 14, lineHeight: 56, textAlign: isRtl ? 'right' : 'left' }}>
                {arDigits(points)}
              </Text>
              <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 12, color: 'rgba(250, 248, 243, 0.7)', marginTop: 6, textAlign: isRtl ? 'right' : 'left' }}>
                نقطة في رصيدك
              </Text>

              <View style={{ marginTop: 18 }}>
                <View style={{ flexDirection, justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontFamily: fonts.arabic, fontSize: 11, color: 'rgba(250, 248, 243, 0.7)' }}>
                    التقدم لمستوى ماسي
                  </Text>
                  <Text style={{ fontFamily: fonts.arabic, fontSize: 11, color: 'rgba(250, 248, 243, 0.7)' }}>
                    {arDigits(pointsRemaining)} نقطة باقية
                  </Text>
                </View>
                <View style={{ height: 8, borderRadius: 100, backgroundColor: 'rgba(250, 248, 243, 0.16)', overflow: 'hidden' }}>
                  <View style={{ height: '100%', borderRadius: 100, backgroundColor: colors.gold, width: `${progressPercent}%` }} />
                </View>
              </View>
            </View>
          </LinearGradient>
        </FadeUp>

        <Text
          style={{
            marginTop: 22,
            fontSize: 12,
            color: colors.inkMute,
            fontFamily: fonts.arabicSemiBold,
            letterSpacing: 0.4,
            marginBottom: 10,
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          ازاي تكسب نقاط
        </Text>

        <View style={[{ backgroundColor: colors.canvas, borderRadius: 12, paddingVertical: 4 }, shadow.card]}>
          {EARN_METHODS.map((method, index) => (
            <View key={method.title}>
              <View style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection, alignItems: 'center', gap: 12 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(31,74,61,0.08)', alignItems: 'center', justifyContent: 'center' }}>
                  {method.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink, textAlign: isRtl ? 'right' : 'left' }}>
                    {method.title}
                  </Text>
                  <Text style={{ fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight, marginTop: 2, textAlign: isRtl ? 'right' : 'left' }}>
                    {method.desc}
                  </Text>
                </View>
              </View>
              {index < EARN_METHODS.length - 1 && (
                <View style={{ height: 1, backgroundColor: colors.canvas300, marginHorizontal: 16 }} />
              )}
            </View>
          ))}
        </View>

        <Button variant="primary" size="lg" full style={{ marginTop: 22 }} onPress={() => router.push('/rewards')}>
          استبدل النقاط
        </Button>
      </ScrollView>
    </View>
  );
}
