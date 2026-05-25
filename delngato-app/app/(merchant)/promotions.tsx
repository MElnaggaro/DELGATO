/**
 * Merchant promotions management — list active/scheduled promotions with
 * create CTA. Phase 9 implementation.
 */

import { Text, View, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { AppBar, Button, Card, Chip, Icon } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { usePlatformStore } from '@/domain/stores/platform';
import { selectPromotionsByStore } from '@/domain/selectors';

export default function MerchantPromotions() {
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection } = useRtl();

  // Read promotions for the demo merchant store.
  const promos = usePlatformStore((s) => {
    const storeIds = Object.keys(s.stores);
    return storeIds.length > 0 ? selectPromotionsByStore(s, storeIds[0]!) : [];
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="العروض والخصومات" onBack={() => safeBack('/(merchant)/(tabs)/dashboard')} />

      <FlatList
        data={promos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={
          <View style={{ marginBottom: 14 }}>
            <Button
              variant="primary"
              full
              onPress={() => {
                /* Phase 9+: navigate to promo creation */
              }}
            >
              + إنشاء عرض جديد
            </Button>
          </View>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 40, gap: 8 }}>
            <Icon.wallet size={28} color={colors.inkMute} />
            <Text style={{ fontFamily: fonts.arabic, fontSize: 14, color: colors.inkLight }}>
              لا توجد عروض حالياً
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <FadeUp distance={4}>
            <Card padding={14}>
              <View style={{ flexDirection, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: fonts.arabicSemiBold,
                      fontSize: 15,
                      color: colors.ink,
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    {item.title}
                  </Text>
                  {item.sub ? (
                    <Text
                      style={{
                        fontFamily: fonts.arabic,
                        fontSize: 12,
                        color: colors.inkLight,
                        marginTop: 4,
                        textAlign: isRtl ? 'right' : 'left',
                      }}
                    >
                      {item.sub}
                    </Text>
                  ) : null}
                </View>
                <Chip active>{item.kind === 'percent' ? `${arDigits(item.value)}%` : `${arDigits(item.value)} ج.م`}</Chip>
              </View>
            </Card>
          </FadeUp>
        )}
      />
    </View>
  );
}
