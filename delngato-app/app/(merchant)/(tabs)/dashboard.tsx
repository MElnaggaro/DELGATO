/**
 * Merchant dashboard — Phase 8 stub.
 *
 * Surfaces the canonical sections (KPIs, live order queue summary, acceptance
 * toggle, quick actions) with mock data drawn from the platform store via
 * existing selectors. Phase 9 wires the full realtime feed +
 * MerchantRepository acceptance toggle persistence.
 */

import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { Button, Card, Section, ToggleSwitch } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';

export default function MerchantDashboard() {
  const router = useRouter();
  const arDigits = useArabicDigits();
  const [accepting, setAccepting] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView edges={['top']} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8 }}>
          <Text
            style={{
              fontFamily: fonts.arabicBold,
              fontSize: 22,
              color: colors.ink,
            }}
          >
            لوحة التحكم
          </Text>
          <Text
            style={{
              fontFamily: fonts.arabic,
              fontSize: 13,
              color: colors.inkLight,
              marginTop: 4,
            }}
          >
            ملخص يومك
          </Text>
        </View>

        <Section label="الحالة">
          <Card padding={14}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View>
                <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink }}>
                  استقبال الطلبات
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.arabic,
                    fontSize: 12,
                    color: colors.inkLight,
                    marginTop: 2,
                  }}
                >
                  {accepting ? 'بتقبل طلبات جديدة' : 'متوقف مؤقتاً'}
                </Text>
              </View>
              <ToggleSwitch value={accepting} onChange={() => setAccepting((v) => !v)} />
            </View>
          </Card>
        </Section>

        <Section label="ملخص اليوم">
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <KpiTile label="طلبات جديدة" value={arDigits(3)} accent={colors.olive} />
            <KpiTile label="مبيعات اليوم" value={`${arDigits(1840)} ج.م`} />
            <KpiTile label="متوسط الطلب" value={`${arDigits(95)} ج.م`} />
          </View>
        </Section>

        <Section label="إجراءات سريعة">
          <View style={{ gap: 10 }}>
            <Button variant="secondary" full onPress={() => router.push('/(merchant)/(tabs)/orders')}>
              عرض كل الطلبات
            </Button>
            <Button variant="secondary" full onPress={() => router.push('/(merchant)/(tabs)/products')}>
              إدارة المنتجات
            </Button>
            <Button
              variant="ghost"
              full
              onPress={() => router.replace('/(onboarding)/welcome')}
            >
              تسجيل الخروج
            </Button>
          </View>
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
      <Text
        style={{
          fontFamily: fonts.arabic,
          fontSize: 11,
          color: colors.inkLight,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: fonts.arabicBold,
          fontSize: 18,
          color: accent ?? colors.ink,
          marginTop: 6,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
