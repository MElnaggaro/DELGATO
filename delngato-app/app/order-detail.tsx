import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppBar, Button, Card, Icon, LiveDot, OrderProgress, Row } from '@/shared/ui';
import { colors, fonts, shadow } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { safeBack } from '@/shared/utils/nav';
import { useOrdersStore } from '@/features/orders/store';

const SAMPLE_ITEMS = [
  { name: 'لبن جهينة', qty: 2, price: 64 },
  { name: 'بيض بلدي', qty: 1, price: 145 },
  { name: 'خبز فينو', qty: 3, price: 36 },
];

export default function OrderDetail() {
  const router = useRouter();
  const { t } = useTranslation();
  const arDigits = useArabicDigits();
  const params = useLocalSearchParams<{ id?: string }>();
  const orders = useOrdersStore((s) => s.orders);
  const order = useMemo(
    () => orders.find((o) => o.id === params.id) ?? orders[0]!,
    [orders, params.id],
  );
  const isLive = order.status === 'live';

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title={order.id} onBack={() => safeBack('/(tabs)/orders')} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
          <Card padding={16}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                marginBottom: 12,
              }}
            >
              {isLive ? <LiveDot size={8} color={colors.olive} /> : null}
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 17, color: colors.ink }}>
                {order.statusText}
              </Text>
            </View>
            <OrderProgress step={order.step} />
            {isLive ? (
              <View style={{ marginTop: 14 }}>
                <Button
                  variant="secondary"
                  full
                  onPress={() => router.push({ pathname: '/tracking', params: { orderId: order.id } })}
                >
                  تتبع مباشر للطلب
                </Button>
              </View>
            ) : null}
          </Card>
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
          <Text
            style={{
              fontFamily: fonts.arabicSemiBold,
              fontSize: 12,
              color: colors.inkMute,
              letterSpacing: 0.4,
              marginBottom: 8,
            }}
          >
            المحل
          </Text>
          <View
            style={{
              backgroundColor: colors.bgElevated,
              borderRadius: 12,
              padding: 12,
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
              ...shadow.card,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 100,
                backgroundColor: colors.olive,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 20, color: colors.canvas }}>
                {order.shopLetter}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink }}>
                {order.shop}
              </Text>
              <Text style={{ fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight }}>
                {order.date}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
          <Text
            style={{
              fontFamily: fonts.arabicSemiBold,
              fontSize: 12,
              color: colors.inkMute,
              letterSpacing: 0.4,
              marginBottom: 8,
            }}
          >
            المنتجات
          </Text>
          <Card padding={14}>
            {SAMPLE_ITEMS.map((it, i) => (
              <View
                key={it.name}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 8,
                  borderBottomWidth: i < SAMPLE_ITEMS.length - 1 ? 1 : 0,
                  borderBottomColor: colors.canvas300,
                }}
              >
                <Text style={{ fontFamily: fonts.arabic, fontSize: 14, color: colors.ink }}>
                  <Text style={{ fontFamily: fonts.arabicBold, color: colors.olive }}>
                    {arDigits(it.qty)}×{' '}
                  </Text>
                  {it.name}
                </Text>
                <Text
                  style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.ink }}
                >
                  {arDigits(it.price)} ج.م
                </Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
          <Card padding={14}>
            <Row label="عنوان التوصيل" value="البيت · شارع الجلاء" />
            <Row label="طريقة الدفع" value="كاش عند الاستلام" />
            <Row label="رسوم التوصيل" value={`${arDigits(10)} ج.م`} />
            <View style={{ height: 1, backgroundColor: colors.canvas300, marginVertical: 10 }} />
            <Row label="الإجمالي" value={`${arDigits(order.total)} ج.م`} bold />
          </Card>
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 18, gap: 10 }}>
          {!isLive && order.status !== 'cancelled' ? (
            <>
              <Button variant="primary" full onPress={() => router.push('/cart')}>
                إعادة الطلب
              </Button>
              <Button variant="ghost" full onPress={() => router.push('/rate')}>
                {t('tracking.rate')}
              </Button>
            </>
          ) : null}
          <Button
            variant="ghost"
            full
            onPress={() => router.push('/support')}
            leading={<Icon.help size={18} color={colors.olive} />}
          >
            محتاج مساعدة في الطلب؟
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
