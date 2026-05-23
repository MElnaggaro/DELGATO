import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { AppBar, Button, Card, Icon, ListRow, showToast } from '@/shared/ui';
import { FadeUp, Rise } from '@/shared/motion';
import { colors, fonts, shadow } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useLoyaltyStore } from '@/features/loyalty/store';

const TOPUP_OPTIONS = [50, 100, 200, 500];

export default function Wallet() {
  const router = useRouter();
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection } = useRtl();
  const walletBalance = useLoyaltyStore((s) => s.walletBalance);
  const cashback = useLoyaltyStore((s) => s.cashbackThisMonth);
  const walletTx = useLoyaltyStore((s) => s.walletTx);
  const topUp = useLoyaltyStore((s) => s.topUp);

  const recent = walletTx.slice(0, 5);

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
              height: 180,
              borderRadius: 16,
              padding: 20,
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
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: 'rgba(232,177,79,0.16)',
              }}
            />
            <View style={{ flexDirection, justifyContent: 'space-between', alignItems: 'center' }}>
              <Text
                style={{
                  fontFamily: fonts.arabicMedium,
                  fontSize: 12,
                  color: 'rgba(250,248,243,0.7)',
                }}
              >
                الرصيد المتاح
              </Text>
              <Icon.wallet size={22} color={colors.canvas} />
            </View>
            <Text style={{ fontFamily: fonts.arabicBold, fontSize: 40, color: colors.canvas }}>
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
            <Text
              style={{
                fontFamily: fonts.arabic,
                fontSize: 12,
                color: 'rgba(250,248,243,0.6)',
              }}
            >
              كاش باك ١٠٪ على المحفظة لمدة أسبوع
            </Text>
          </LinearGradient>
        </FadeUp>

        <Text style={section()}>اشحن المحفظة</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {TOPUP_OPTIONS.map((amount) => (
            <Rise key={amount} delay={amount / 2} style={{ flex: 1 }}>
              <Button
                variant="secondary"
                full
                onPress={() => {
                  topUp(amount);
                  showToast(`اتشحن ${arDigits(amount)} ج.م`, <Icon.plus size={16} color={colors.gold} />);
                }}
              >
                {`+${arDigits(amount)}`}
              </Button>
            </Rise>
          ))}
        </View>

        <Card padding={14} style={{ marginTop: 14 }}>
          <View style={{ flexDirection, alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: 'rgba(232,177,79,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.refresh size={20} color={colors.statusPendingText} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: fonts.arabicSemiBold,
                  fontSize: 13,
                  color: colors.ink,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                كاش باك الشهر ده
              </Text>
              <Text
                style={{
                  fontFamily: fonts.arabic,
                  fontSize: 11,
                  color: colors.inkLight,
                  textAlign: isRtl ? 'right' : 'left',
                  marginTop: 2,
                }}
              >
                بنرجّع جزء من كل طلب
              </Text>
            </View>
            <Text style={{ fontFamily: fonts.arabicBold, fontSize: 18, color: colors.olive }}>
              +{arDigits(cashback)}
            </Text>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 24, marginBottom: 8 }}>
          <Text style={section()}>آخر المعاملات</Text>
          <Text
            onPress={() => router.push('/wallet-history')}
            style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.olive }}
          >
            عرض الكل
          </Text>
        </View>
        <View
          style={{
            backgroundColor: colors.bgElevated,
            borderRadius: 12,
            overflow: 'hidden',
            ...shadow.card,
          }}
        >
          {recent.map((tx, i) => (
            <View
              key={tx.id}
              style={{
                borderBottomWidth: i < recent.length - 1 ? 1 : 0,
                borderBottomColor: colors.canvas300,
              }}
            >
              <ListRow
                icon={
                  tx.kind === 'in' ? (
                    <Icon.plus size={18} color={colors.olive} />
                  ) : (
                    <Icon.minus size={18} color={colors.statusIssueText} />
                  )
                }
                label={tx.title}
                sub={tx.date}
                value={`${tx.kind === 'in' ? '+' : ''}${arDigits(tx.amount)} ج.م`}
              />
            </View>
          ))}
        </View>

        <Button
          variant="ghost"
          full
          style={{ marginTop: 14 }}
          onPress={() => router.push('/cashback')}
        >
          سجل الكاش باك
        </Button>
      </ScrollView>
    </View>
  );
}

function section() {
  return {
    fontFamily: fonts.arabicSemiBold,
    fontSize: 12,
    color: colors.inkMute,
    letterSpacing: 0.4,
    marginTop: 20,
    marginBottom: 10,
  } as const;
}
