/**
 * Merchant analytics — revenue chart, order counts, popular items.
 * Phase 9 implementation with mock data derived from platform store.
 */

import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { AppBar, Card, Section } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { usePlatformStore } from '@/domain/stores/platform';

const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
// Mock daily revenue data for bar chart
const DAILY_REVENUE = [420, 680, 530, 910, 740, 1200, 860];

export default function MerchantAnalytics() {
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection } = useRtl();

  const orders = usePlatformStore((s) => Object.values(s.orders));

  const stats = useMemo(() => {
    const total = orders.reduce((s, o) => s + o.total, 0);
    const delivered = orders.filter((o) => o.status === 'delivered').length;
    const cancelled = orders.filter((o) => o.status === 'cancelled' || o.status === 'rejected').length;
    const avgOrder = orders.length > 0 ? Math.round(total / orders.length) : 0;
    return { total, delivered, cancelled, avgOrder, count: orders.length };
  }, [orders]);

  const maxRevenue = Math.max(...DAILY_REVENUE, 1);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="التحليلات" onBack={() => safeBack('/(merchant)/(tabs)/dashboard')} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* KPI row */}
        <Section label="ملخص الأداء">
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <KpiTile label="إجمالي المبيعات" value={`${arDigits(stats.total)} ج.م`} accent={colors.olive} />
            <KpiTile label="عدد الطلبات" value={arDigits(stats.count)} />
            <KpiTile label="متوسط الطلب" value={`${arDigits(stats.avgOrder)} ج.م`} />
          </View>
        </Section>

        {/* Mini bar chart */}
        <Section label="إيراد الأسبوع">
          <Card padding={14}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120 }}>
              {DAILY_REVENUE.map((rev, i) => (
                <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                  <View
                    style={{
                      width: 24,
                      borderRadius: 6,
                      backgroundColor: i === 5 ? colors.olive : 'rgba(31,74,61,0.15)',
                      height: (rev / maxRevenue) * 90,
                      marginBottom: 6,
                    }}
                  />
                  <Text style={{ fontFamily: fonts.arabic, fontSize: 9, color: colors.inkMute }}>
                    {DAYS[i]}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </Section>

        {/* Order breakdown */}
        <Section label="توزيع الطلبات">
          <Card padding={14}>
            <View style={{ gap: 12 }}>
              <StatRow label="تم التوصيل" value={arDigits(stats.delivered)} color={colors.olive} />
              <StatRow label="ملغي / مرفوض" value={arDigits(stats.cancelled)} color={colors.statusIssue} />
              <StatRow label="إجمالي" value={arDigits(stats.count)} color={colors.ink} />
            </View>
          </Card>
        </Section>
      </ScrollView>
    </View>
  );
}

function KpiTile({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgElevated,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.canvas300,
        padding: 12,
      }}
    >
      <Text style={{ fontFamily: fonts.arabic, fontSize: 11, color: colors.inkLight }}>
        {label}
      </Text>
      <Text style={{ fontFamily: fonts.arabicBold, fontSize: 18, color: accent ?? colors.ink, marginTop: 6 }}>
        {value}
      </Text>
    </View>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 8, height: 8, borderRadius: 100, backgroundColor: color }} />
        <Text style={{ fontFamily: fonts.arabic, fontSize: 13, color: colors.ink }}>{label}</Text>
      </View>
      <Text style={{ fontFamily: fonts.arabicBold, fontSize: 14, color }}>{value}</Text>
    </View>
  );
}
