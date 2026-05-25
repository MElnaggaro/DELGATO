/**
 * Merchant payouts — payout history with balance summary.
 * Phase 9 implementation. In production, this would read from a PayoutRepository;
 * for now it derives from platform store order data.
 */

import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { AppBar, Button, Card, Section } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { usePlatformStore } from '@/domain/stores/platform';

// Mock payout records — in production these come from PayoutRepository.
const MOCK_PAYOUTS = [
  { id: 'pay-1', date: '٢٠٢٦/٠٥/٢٠', amount: 3200, status: 'completed' as const, method: 'تحويل بنكي' },
  { id: 'pay-2', date: '٢٠٢٦/٠٥/١٣', amount: 2850, status: 'completed' as const, method: 'تحويل بنكي' },
  { id: 'pay-3', date: '٢٠٢٦/٠٥/٠٦', amount: 4100, status: 'completed' as const, method: 'إنستاباي' },
];

export default function MerchantPayouts() {
  const arDigits = useArabicDigits();
  const { flexDirection } = useRtl();

  const orders = usePlatformStore((s) => Object.values(s.orders));

  const pendingBalance = useMemo(() => {
    return orders
      .filter((o) => o.status === 'delivered')
      .reduce((s, o) => s + (o.merchantShare ?? 0), 0);
  }, [orders]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="المدفوعات" onBack={() => safeBack('/(merchant)/(tabs)/settings')} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Balance hero */}
        <View
          style={{
            marginHorizontal: 18,
            marginTop: 8,
            backgroundColor: colors.olive,
            borderRadius: 16,
            padding: 20,
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Text style={{ fontFamily: fonts.arabic, fontSize: 13, color: 'rgba(250,248,243,0.7)' }}>
            الرصيد المعلق
          </Text>
          <Text style={{ fontFamily: fonts.arabicBold, fontSize: 32, color: colors.canvas }}>
            {arDigits(pendingBalance)} ج.م
          </Text>
          <Button
            variant="secondary"
            onPress={() => {/* Phase 9+: request payout */}}
            style={{ marginTop: 8 }}
          >
            طلب سحب
          </Button>
        </View>

        {/* Payout history */}
        <Section label="سجل المدفوعات">
          <View style={{ gap: 10 }}>
            {MOCK_PAYOUTS.map((p) => (
              <FadeUp key={p.id} distance={4}>
                <Card padding={14}>
                  <View style={{ flexDirection, justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink }}>
                        {arDigits(p.amount)} ج.م
                      </Text>
                      <Text style={{ fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight, marginTop: 2 }}>
                        {p.method} · {p.date}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: 'rgba(31,74,61,0.08)',
                        borderRadius: 100,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                      }}
                    >
                      <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 11, color: colors.olive }}>
                        تم
                      </Text>
                    </View>
                  </View>
                </Card>
              </FadeUp>
            ))}
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}
