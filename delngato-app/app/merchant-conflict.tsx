import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppBar, Badge, Button, Card, Icon, showToast } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { findProduct, findShop } from '@/features/catalog/data';
import { useCartStore } from '@/features/cart/store';

export default function MerchantConflict() {
  const router = useRouter();
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection } = useRtl();
  const params = useLocalSearchParams<{ newShopId?: string; newProductId?: string; newQty?: string }>();

  const items = useCartStore((s) => s.items);
  const forceReplaceWith = useCartStore((s) => s.forceReplaceWith);

  const existing = items[0];
  const newShop = findShop(params.newShopId ?? '');
  const newProduct = findProduct(params.newProductId ?? '');
  const newQty = parseInt(params.newQty ?? '1', 10) || 1;

  const keep = () => router.back();
  const replace = () => {
    if (newProduct && newShop) {
      forceReplaceWith(newProduct, newShop, newQty);
      showToast('السلة اتفرّغت وبدأنا من جديد', <Icon.refresh size={16} color={colors.gold} />);
      router.back();
      if (newShop) {
        setTimeout(
          () =>
            router.replace({ pathname: '/shop', params: { id: newShop.id } }),
          80,
        );
      }
    } else {
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar onBack={() => safeBack('/cart')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 28 }}>
        <FadeUp style={{ alignItems: 'center', marginTop: 20 }}>
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 100,
              backgroundColor: 'rgba(232,177,79,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
            }}
          >
            <Icon.bag size={36} color={colors.statusPendingText} />
          </View>
          <Text style={{ fontFamily: fonts.arabicBold, fontSize: 22, color: colors.ink, textAlign: 'center' }}>
            سلتك من محل تاني
          </Text>
          <Text
            style={{
              fontFamily: fonts.arabic,
              fontSize: 14,
              color: colors.inkLight,
              marginTop: 10,
              lineHeight: 22,
              textAlign: 'center',
              maxWidth: 320,
            }}
          >
            عندك دلوقتي منتجات من{' '}
            <Text style={{ fontFamily: fonts.arabicBold, color: colors.ink }}>
              {existing?.shop ?? 'محل'}
            </Text>
            .{'\n'}تقدر تطلب من محل واحد بس في المرة.
          </Text>
        </FadeUp>

        <FadeUp delay={80} style={{ marginTop: 26, gap: 14 }}>
          <Card padding={14}>
            <View style={{ flexDirection, alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 100,
                  backgroundColor: colors.olive,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: fonts.arabicBold, fontSize: 18, color: colors.canvas }}>
                  {(existing?.shop ?? 'م')[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: fonts.arabic,
                    fontSize: 11,
                    color: colors.inkLight,
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  السلة الحالية
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.arabicSemiBold,
                    fontSize: 14,
                    color: colors.ink,
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  {existing?.shop ?? 'محل'}
                </Text>
              </View>
              <Badge variant="active">{arDigits(items.length)} منتج</Badge>
            </View>
          </Card>

          <Card padding={14} style={{ borderWidth: 1.5, borderColor: colors.gold }}>
            <View style={{ flexDirection, alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 100,
                  backgroundColor: colors.gold,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: fonts.arabicBold, fontSize: 18, color: colors.ink }}>
                  {newShop?.letter ?? 'م'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: fonts.arabic,
                    fontSize: 11,
                    color: colors.inkLight,
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  المحل الجديد
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.arabicSemiBold,
                    fontSize: 14,
                    color: colors.ink,
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  {newShop?.name ?? 'محل جديد'}
                </Text>
              </View>
            </View>
          </Card>
        </FadeUp>

        <View style={{ marginTop: 28, gap: 10 }}>
          <Button variant="primary" size="lg" full onPress={replace}>
            فضّي السلة وابدأ من جديد
          </Button>
          <Button variant="ghost" full onPress={keep}>
            خلي السلة زي ما هي
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
