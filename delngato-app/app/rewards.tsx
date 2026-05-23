import { ScrollView, Text, View } from 'react-native';

import { AppBar, Button, Icon, showToast } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { safeBack } from '@/shared/utils/nav';
import { useLoyaltyStore } from '@/features/loyalty/store';
import { REWARDS } from '@/features/loyalty/data';

export default function Rewards() {
  const arDigits = useArabicDigits();
  const points = useLoyaltyStore((s) => s.points);
  const redeem = useLoyaltyStore((s) => s.redeem);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="استبدل نقاطك" onBack={() => safeBack('/points')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 28 }}>
        <View style={{ gap: 12 }}>
          {REWARDS.map((rw) => {
            const enough = points >= rw.cost;
            return (
              <FadeUp key={rw.id}>
                <View
                  style={{
                    backgroundColor: colors.bgElevated,
                    borderRadius: 12,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: colors.canvas300,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: 'rgba(31,74,61,0.08)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {rw.icon === 'bike' ? (
                      <Icon.bike size={22} color={colors.olive} />
                    ) : rw.icon === 'tag' ? (
                      <Icon.tag size={22} color={colors.olive} />
                    ) : (
                      <Icon.star size={22} color={colors.olive} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fonts.arabicBold, fontSize: 14, color: colors.ink }}>
                      {rw.title}
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.arabic,
                        fontSize: 12,
                        color: colors.inkLight,
                        marginTop: 4,
                        lineHeight: 18,
                      }}
                    >
                      {rw.desc}
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.arabicBold,
                        fontSize: 13,
                        color: colors.gold600,
                        marginTop: 6,
                      }}
                    >
                      {arDigits(rw.cost)} نقطة
                    </Text>
                  </View>
                  <Button
                    variant={enough ? 'primary' : 'tertiary'}
                    disabled={!enough}
                    onPress={() => {
                      redeem(rw.cost, rw.title);
                      showToast(`تم استبدال ${rw.title}`, <Icon.check size={16} color={colors.gold} />);
                    }}
                  >
                    استبدال
                  </Button>
                </View>
              </FadeUp>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
