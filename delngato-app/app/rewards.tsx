import { ScrollView, Text, View, Pressable } from 'react-native';

import { AppBar, Icon, showToast } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts, shadow } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useWallet } from '@/features/wallet/hooks';
import { useAuthStore } from '@/features/auth/store';
import { REWARDS } from '@/features/loyalty/data';

export default function Rewards() {
  const arDigits = useArabicDigits();
  const { flexDirection, isRtl } = useRtl();
  const userId = useAuthStore((s) => s.user?.id);
  const wallet = useWallet(userId);
  const points = wallet?.points ?? 0;
  const redeem = (cost: number, title: string) => {
    // MVP placeholder
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="استبدال النقاط" onBack={() => safeBack('/points')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 24 }}>
        <FadeUp>
          <View
            style={{
              backgroundColor: 'rgba(31,74,61,0.06)',
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 16,
              marginBottom: 14,
              flexDirection,
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 100,
                backgroundColor: colors.olive,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.star size={20} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 11, color: colors.inkLight, textAlign: isRtl ? 'right' : 'left' }}>
                رصيدك
              </Text>
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 22, color: colors.olive, textAlign: isRtl ? 'right' : 'left' }}>
                {arDigits(points)}{' '}
                <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 12, color: colors.inkLight }}>
                  نقطة
                </Text>
              </Text>
            </View>
          </View>
        </FadeUp>

        <View style={{ gap: 10 }}>
          {REWARDS.map((rw, i) => {
            const enough = points >= rw.cost;
            return (
              <FadeUp key={rw.id} delay={i * 50}>
                <View
                  style={[{
                    backgroundColor: colors.canvas,
                    borderRadius: 12,
                    padding: 14,
                    flexDirection,
                    alignItems: 'center',
                    gap: 12,
                    opacity: enough ? 1 : 0.65,
                  }, shadow.card]}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      backgroundColor: enough ? colors.olive : colors.canvas200,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {rw.icon === 'bike' ? (
                      <Icon.bike size={22} color={enough ? colors.canvas : colors.inkMute} />
                    ) : rw.icon === 'tag' ? (
                      <Icon.tag size={22} color={enough ? colors.canvas : colors.inkMute} />
                    ) : (
                      <Icon.star size={22} color={enough ? colors.canvas : colors.inkMute} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fonts.arabicBold, fontSize: 15, color: colors.ink, textAlign: isRtl ? 'right' : 'left' }}>
                      {rw.title}
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.arabic,
                        fontSize: 12,
                        color: colors.inkLight,
                        marginTop: 4,
                        lineHeight: 18,
                        textAlign: isRtl ? 'right' : 'left'
                      }}
                    >
                      {rw.desc}
                    </Text>
                  </View>
                  <Pressable
                    disabled={!enough}
                    onPress={() => {
                      redeem(rw.cost, rw.title);
                      showToast(`تم استبدال ${rw.title}`, <Icon.check size={16} color={colors.gold} />);
                    }}
                    style={{
                      backgroundColor: enough ? colors.olive : colors.canvas200,
                      borderRadius: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fonts.arabicBold,
                        fontSize: 13,
                        color: enough ? colors.canvas : colors.inkMute,
                      }}
                    >
                      {arDigits(rw.cost)} نقطة
                    </Text>
                  </Pressable>
                </View>
              </FadeUp>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
