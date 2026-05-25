/**
 * Merchant products tab — Phase 8 stub.
 * Phase 9 wires `ProductRepository.list / upsert / archive / setStock / subscribeByStore`.
 */

import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';

export default function MerchantProducts() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView edges={['top']} />
      <View style={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontFamily: fonts.arabicBold, fontSize: 22, color: colors.ink }}>
          المنتجات
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <Card padding={20}>
          <Text
            style={{
              fontFamily: fonts.arabic,
              fontSize: 13,
              color: colors.inkLight,
              textAlign: 'center',
            }}
          >
            قائمة منتجات المحل + إضافة وتعديل وإخفاء — في المرحلة الجاية.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}
