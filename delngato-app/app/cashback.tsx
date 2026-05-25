import { ScrollView, Text, View } from 'react-native';

import { AppBar, Card, Icon, ListRow } from '@/shared/ui';
import { colors, fonts, shadow } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useWallet, useWalletTxs } from '@/features/wallet/hooks';
import { useAuthStore } from '@/features/auth/store';

export default function Cashback() {
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection } = useRtl();
  const userId = useAuthStore((s) => s.user?.id);
  const cashback = 0; // MVP placeholder
  const tx = useWalletTxs(userId).filter((t) => t.title.includes('كاش باك'));

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="الكاش باك" onBack={() => safeBack('/wallet')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28, paddingTop: 12 }}>
        <Card padding={20} style={{ backgroundColor: 'rgba(232,177,79,0.10)', borderWidth: 0 }}>
          <View style={{ flexDirection, justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text
                style={{
                  fontFamily: fonts.arabicMedium,
                  fontSize: 12,
                  color: colors.inkLight,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                كاش باك الشهر ده
              </Text>
              <Text
                style={{
                  fontFamily: fonts.arabicBold,
                  fontSize: 36,
                  color: colors.olive,
                  marginTop: 6,
                }}
              >
                {arDigits(cashback)}{' '}
                <Text
                  style={{
                    fontFamily: fonts.arabicMedium,
                    fontSize: 16,
                    color: colors.inkLight,
                  }}
                >
                  ج.م
                </Text>
              </Text>
            </View>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: 'rgba(232,177,79,0.3)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.refresh size={26} color={colors.statusPendingText} />
            </View>
          </View>
        </Card>

        <Text style={section(isRtl)}>سجل الكاش باك</Text>
        {tx.length === 0 ? (
          <View
            style={{
              padding: 24,
              backgroundColor: colors.bgElevated,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: fonts.arabic, fontSize: 13, color: colors.inkLight }}>
              لسه مفيش كاش باك. ابدأ أول طلب وكاش باكك هيظهر هنا.
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: colors.bgElevated,
              borderRadius: 12,
              overflow: 'hidden',
              ...shadow.card,
            }}
          >
            {tx.map((t, i) => (
              <View
                key={t.id}
                style={{
                  borderBottomWidth: i < tx.length - 1 ? 1 : 0,
                  borderBottomColor: colors.canvas300,
                }}
              >
                <ListRow
                  icon={<Icon.refresh size={18} color={colors.statusPendingText} />}
                  label={t.title}
                  sub={t.ts.split('T')[0]}
                  trailing={
                    <Text
                      style={{
                        fontFamily: fonts.arabicBold,
                        fontSize: 14,
                        color: colors.olive,
                      }}
                    >
                      +{arDigits(t.amount)} ج.م
                    </Text>
                  }
                />
              </View>
            ))}
          </View>
        )}
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
