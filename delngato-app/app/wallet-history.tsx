import { ScrollView, Text, View } from 'react-native';

import { AppBar, Icon, ListRow } from '@/shared/ui';
import { colors, fonts, shadow } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { safeBack } from '@/shared/utils/nav';
import { useWalletTxs } from '@/features/wallet/hooks';
import { useAuthStore } from '@/features/auth/store';

export default function WalletHistory() {
  const arDigits = useArabicDigits();
  const userId = useAuthStore((s) => s.user?.id);
  const txs = useWalletTxs(userId);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="سجل المحفظة" onBack={() => safeBack('/wallet')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28, paddingTop: 14 }}>
        <View
          style={{
            backgroundColor: colors.bgElevated,
            borderRadius: 12,
            overflow: 'hidden',
            ...shadow.card,
          }}
        >
          {txs.map((tx, i) => (
            <View
              key={tx.id}
              style={{
                borderBottomWidth: i < txs.length - 1 ? 1 : 0,
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
                sub={new Date(tx.ts).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' })}
                trailing={
                  <Text
                    style={{
                      fontFamily: fonts.arabicBold,
                      fontSize: 14,
                      color: tx.kind === 'in' ? colors.olive : colors.statusIssueText,
                    }}
                  >
                    {tx.kind === 'in' ? '+' : ''}
                    {arDigits(tx.amount)} ج.م
                  </Text>
                }
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
