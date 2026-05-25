/**
 * Merchant settings tab — Prototype stub.
 */

import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button, Card, Section } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';

export default function MerchantSettings() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView edges={['top']} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontFamily: fonts.arabicBold, fontSize: 22, color: colors.ink }}>
            الإعدادات
          </Text>
        </View>
        <Section label="المحل">
          <Card padding={16}>
            <Text style={{ fontFamily: fonts.arabic, fontSize: 13, color: colors.inkLight }}>
              بيانات المحل، ساعات العمل، طرق الدفع — في المرحلة الجاية.
            </Text>
          </Card>
        </Section>
        <Section label="الحساب">
          <View style={{ gap: 10 }}>
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

