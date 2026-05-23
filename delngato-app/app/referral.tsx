import { Pressable, ScrollView, Share, Text, View } from 'react-native';

import { AppBar, Button, Icon, showToast } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { REFERRAL_REWARD_AMOUNT } from '@/features/loyalty/data';

const CODE = 'AHMED2025';
const INVITED = [
  { name: 'يوسف', status: 'فعّال', reward: 30 },
  { name: 'سارة', status: 'فعّال', reward: 30 },
  { name: 'محمد', status: 'في انتظار أول طلب', reward: 0 },
];

export default function Referral() {
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection } = useRtl();

  const share = () =>
    void Share.share({
      message: `جرّب دلنجاتُو معايا! استخدم كود ${CODE} وهتاخد توصيل ببلاش على أول طلب.`,
    });

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="ادعِ صديق" onBack={() => safeBack('/(tabs)/profile')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28 }}>
        <FadeUp>
          <View
            style={{
              backgroundColor: 'rgba(31,74,61,0.06)',
              borderRadius: 16,
              padding: 22,
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 100,
                backgroundColor: colors.olive,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              <Icon.heart size={32} color={colors.canvas} />
            </View>
            <Text
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: 20,
                color: colors.ink,
                textAlign: 'center',
              }}
            >
              ادعِ صديق · اكسب {arDigits(REFERRAL_REWARD_AMOUNT)} ج.م
            </Text>
            <Text
              style={{
                fontFamily: fonts.arabic,
                fontSize: 13,
                color: colors.inkLight,
                marginTop: 8,
                lineHeight: 20,
                textAlign: 'center',
                maxWidth: 300,
              }}
            >
              لما صديقك يطلب أول طلب بكودك، انت بتاخد {arDigits(REFERRAL_REWARD_AMOUNT)} ج.م في محفظتك وهو
              بياخد توصيل ببلاش.
            </Text>
          </View>
        </FadeUp>

        <View
          style={{
            marginTop: 16,
            backgroundColor: colors.bgElevated,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 1.5,
            borderColor: colors.olive,
            flexDirection,
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: fonts.arabicMedium,
                fontSize: 11,
                color: colors.inkLight,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              كودك الشخصي
            </Text>
            <Text
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: 20,
                color: colors.olive,
                letterSpacing: 2.4,
                textAlign: isRtl ? 'right' : 'left',
                marginTop: 4,
              }}
            >
              {CODE}
            </Text>
          </View>
          <Pressable
            hitSlop={6}
            onPress={() => showToast(`اتنسخ كود ${CODE}`, <Icon.check size={16} color={colors.gold} />)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: colors.canvas200,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.tag size={20} color={colors.olive} />
          </Pressable>
        </View>

        <View style={{ marginTop: 14 }}>
          <Button
            variant="primary"
            size="lg"
            full
            onPress={share}
            leading={<Icon.share size={16} color={colors.canvas} />}
          >
            شارك الكود
          </Button>
        </View>

        <Text style={section(isRtl)}>أصحاب دعيتهم</Text>
        <View
          style={{
            backgroundColor: colors.bgElevated,
            borderRadius: 12,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.canvas300,
          }}
        >
          {INVITED.map((f, i) => (
            <View
              key={f.name}
              style={{
                flexDirection,
                alignItems: 'center',
                gap: 12,
                padding: 14,
                borderBottomWidth: i < INVITED.length - 1 ? 1 : 0,
                borderBottomColor: colors.canvas300,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 100,
                  backgroundColor: colors.olive,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: fonts.arabicBold, fontSize: 16, color: colors.canvas }}>
                  {f.name[0]}
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
                  {f.name}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.arabic,
                    fontSize: 11,
                    color: colors.inkLight,
                    marginTop: 2,
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  {f.status}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: fonts.arabicBold,
                  fontSize: 13,
                  color: f.reward > 0 ? colors.olive : colors.inkMute,
                }}
              >
                {f.reward > 0 ? `+${arDigits(f.reward)} ج.م` : '—'}
              </Text>
            </View>
          ))}
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
    marginTop: 22,
    marginBottom: 10,
    textAlign: (isRtl ? 'right' : 'left') as 'right' | 'left',
  } as const;
}
