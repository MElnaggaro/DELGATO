import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { AppBar, Button, Icon, IconForward, showToast } from '@/shared/ui';
import { FadeUp, Rise } from '@/shared/motion';
import { colors, fonts, shadow } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useLoyaltyStore } from '@/features/loyalty/store';
import { TopupSheet } from '@/features/loyalty/TopupSheet';

export default function Wallet() {
  const router = useRouter();
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection } = useRtl();
  const walletBalance = useLoyaltyStore((s) => s.walletBalance);
  const cashback = useLoyaltyStore((s) => s.cashbackThisMonth);
  const walletTx = useLoyaltyStore((s) => s.walletTx);
  const topUp = useLoyaltyStore((s) => s.topUp);

  const recent = walletTx.slice(0, 5);
  const [topupOpen, setTopupOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="محفظة دلنجاتُو" onBack={() => safeBack('/(tabs)/profile')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28 }}>
        <FadeUp>
          <LinearGradient
            colors={[colors.olive, colors.olive700]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              height: 200,
              borderRadius: 18,
              padding: 22,
              overflow: 'hidden',
              justifyContent: 'space-between',
              marginTop: 8,
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: -50,
                insetInlineEnd: -30,
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: 'rgba(232,177,79,0.16)',
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: -60,
                insetInlineStart: -30,
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: 'rgba(250,248,243,0.05)',
              }}
            />
            <View style={{ flexDirection, justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
              <View>
                <Text
                  style={{
                    fontFamily: fonts.arabicMedium,
                    fontSize: 12,
                    color: 'rgba(250,248,243,0.7)',
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  الرصيد المتاح
                </Text>
                <Text style={{ fontFamily: fonts.arabicBold, fontSize: 40, color: colors.canvas, marginTop: 4, lineHeight: 40, textAlign: isRtl ? 'right' : 'left' }}>
                  {arDigits(walletBalance)}{' '}
                  <Text
                    style={{
                      fontFamily: fonts.arabicMedium,
                      fontSize: 16,
                      color: 'rgba(250,248,243,0.7)',
                    }}
                  >
                    ج.م
                  </Text>
                </Text>
              </View>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: 'rgba(250,248,243,0.14)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.wallet size={22} color={colors.canvas} />
              </View>
            </View>

            <View style={{ flexDirection, gap: 18, position: 'relative' }}>
              <View>
                <Text
                  style={{
                    fontFamily: fonts.arabicSemiBold,
                    fontSize: 10,
                    color: 'rgba(250,248,243,0.6)',
                    letterSpacing: 0.5,
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  كاش باك الشهر
                </Text>
                <Text style={{ fontFamily: fonts.arabicBold, fontSize: 15, color: colors.gold, marginTop: 2, textAlign: isRtl ? 'right' : 'left' }}>
                  {arDigits(cashback)} ج.م
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: fonts.arabicSemiBold,
                    fontSize: 10,
                    color: 'rgba(250,248,243,0.6)',
                    letterSpacing: 0.5,
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  نقاط
                </Text>
                <Text style={{ fontFamily: fonts.arabicBold, fontSize: 15, color: colors.gold, marginTop: 2, textAlign: isRtl ? 'right' : 'left' }}>
                  {arDigits(1820)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </FadeUp>

        <View style={{ flexDirection, gap: 8, marginTop: 16 }}>
          {[
            { id: 'charge', label: 'شحن', icon: <Icon.plus size={20} color={colors.olive} /> },
            { id: 'transfer', label: 'تحويل', icon: <Icon.share size={20} color={colors.olive} /> },
            { id: 'pay', label: 'ادفع', icon: <Icon.zap size={20} color={colors.olive} /> },
          ].map((action, i) => (
            <Rise key={action.id} delay={i * 30} style={{ flex: 1 }}>
              <Pressable
                onPress={() => {
                  if (action.id === 'charge') {
                    setTopupOpen(true);
                  } else if (action.id === 'pay') {
                    router.push('/wallet-pay');
                  }
                }}
              >
                {({ pressed }) => (
                  <View
                    style={{
                      backgroundColor: pressed ? colors.canvas200 : colors.canvas,
                      borderRadius: 12,
                      paddingVertical: 14,
                      paddingHorizontal: 8,
                      alignItems: 'center',
                      gap: 6,
                      ...shadow.card,
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
                      }}
                    >
                      {action.icon}
                    </View>
                    <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 12, color: colors.ink }}>
                      {action.label}
                    </Text>
                  </View>
                )}
              </Pressable>
            </Rise>
          ))}
        </View>

        <FadeUp delay={100}>
          <Pressable
            onPress={() => router.push('/promo-code')}
            style={({ pressed }) => ({
              marginTop: 18,
              paddingHorizontal: 16,
              paddingVertical: 14,
              backgroundColor: pressed ? 'rgba(232,177,79,0.15)' : 'rgba(232,177,79,0.1)',
              borderRadius: 12,
              flexDirection,
              alignItems: 'center',
              gap: 12,
            })}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: 'rgba(232,177,79,0.3)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.flame size={20} color="#8A6418" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 13.5, color: colors.ink, textAlign: isRtl ? 'right' : 'left' }}>
                كاش باك ١٠٪ على كل طلب
              </Text>
              <Text style={{ fontFamily: fonts.arabic, fontSize: 11.5, color: colors.inkLight, marginTop: 2, textAlign: isRtl ? 'right' : 'left' }}>
                للأسبوع ده فقط — استخدم المحفظة في الدفع
              </Text>
            </View>
            <IconForward size={18} color={colors.inkMute} />
          </Pressable>
        </FadeUp>

        <View style={{ flexDirection, justifyContent: 'space-between', alignItems: 'baseline', marginTop: 22 }}>
          <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 12, color: colors.inkMute, letterSpacing: 0.5 }}>
            آخر المعاملات
          </Text>
          <Text
            onPress={() => router.push('/wallet-history')}
            style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.olive }}
          >
            عرض الكل
          </Text>
        </View>

        <View style={{ marginTop: 10, gap: 8 }}>
          {recent.map((tx, i) => {
            const isIn = tx.kind === 'in';
            return (
              <Rise key={tx.id} delay={i * 30}>
                <View
                  style={{
                    backgroundColor: colors.canvas,
                    borderRadius: 12,
                    padding: 12,
                    flexDirection,
                    alignItems: 'center',
                    gap: 12,
                    ...shadow.card,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: isIn ? 'rgba(31,74,61,0.08)' : 'rgba(197,59,44,0.08)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isIn ? (
                      <Icon.chevronDown size={18} color={colors.olive} />
                    ) : (
                      <Icon.chevronUp size={18} color="#A1271C" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: fonts.arabicSemiBold,
                        fontSize: 13.5,
                        color: colors.ink,
                        textAlign: isRtl ? 'right' : 'left',
                      }}
                    >
                      {tx.title}
                    </Text>
                    <Text style={{ fontFamily: fonts.arabic, fontSize: 11, color: colors.inkLight, marginTop: 2, textAlign: isRtl ? 'right' : 'left' }}>
                      {tx.date}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: fonts.arabicBold, fontSize: 15, color: isIn ? colors.olive : colors.ink }}>
                    {isIn ? '+' : '-'}{arDigits(tx.amount)}{' '}
                    <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 10, color: colors.inkLight }}>
                      ج.م
                    </Text>
                  </Text>
                </View>
              </Rise>
            );
          })}
        </View>

        <Button
          variant="ghost"
          style={{ marginTop: 14 }}
          onPress={() => router.push('/wallet-history')}
        >
          السجل
        </Button>
      </ScrollView>

      <TopupSheet
        visible={topupOpen}
        onClose={() => setTopupOpen(false)}
        onConfirm={({ amount, method }) => {
          topUp(amount, method);
          showToast(
            `اتشحنت المحفظة بـ ${arDigits(amount)} ج.م`,
            <Icon.check size={16} color={colors.gold} />,
          );
        }}
      />
    </View>
  );
}
