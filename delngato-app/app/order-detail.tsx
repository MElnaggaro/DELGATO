import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppBar, Button, Card, Icon, LiveDot, OrderProgress, Row } from '@/shared/ui';
import { colors, fonts, shadow } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { safeBack } from '@/shared/utils/nav';
import { useOrderDetail, statusText, statusStep, toDisplayStatus } from '@/features/orders/hooks';
import { usePlatformStore } from '@/domain/stores/platform';

export default function OrderDetail() {
  const router = useRouter();
  const { t } = useTranslation();
  const arDigits = useArabicDigits();
  const params = useLocalSearchParams<{ id?: string }>();
  const order = useOrderDetail(params.id);
  const storeName = usePlatformStore((s) => order ? (s.stores[order.storeId]?.name ?? '') : '');
  const storeLetter = usePlatformStore((s) => order ? (s.stores[order.storeId]?.letter ?? '') : '');

  if (!order) return null;

  const display = toDisplayStatus(order.status);
  const isLive = display === 'live';
  const isDone = display === 'done';
  const isCancelled = display === 'cancelled';
  const dateLabel = order.placedAt
    ? new Date(order.placedAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
    : '';

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
                {statusText(order.status)}
              </Text>
            </View>
            <OrderProgress step={statusStep(order.status)} />
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
                {storeLetter}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink }}>
                {storeName}
              </Text>
              <Text style={{ fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight }}>
                {dateLabel}
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
            {order.items.map((it, i) => (
              <View
                key={it.productId}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 8,
                  borderBottomWidth: i < order.items.length - 1 ? 1 : 0,
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
                  {arDigits(it.subtotal)} ج.م
                </Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
          <Card padding={14}>
            <Row label="عنوان التوصيل" value={order.address || '—'} />
            <Row label="طريقة الدفع" value={order.payment === 'cash' ? 'كاش عند الاستلام' : order.payment === 'wallet' ? 'محفظة' : 'بطاقة'} />
            <Row label="رسوم التوصيل" value={`${arDigits(order.deliveryFee)} ج.م`} />
            <View style={{ height: 1, backgroundColor: colors.canvas300, marginVertical: 10 }} />
            <Row label="الإجمالي" value={`${arDigits(order.total)} ج.م`} bold />
          </Card>
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 18, gap: 10 }}>
          {isLive ? (
            <>
              <Button
                variant="secondary"
                full
                leading={<Icon.message size={16} color={colors.olive} />}
                onPress={() =>
                  router.push({
                    pathname: '/chat',
                    params: { kind: 'driver', name: 'محمود السيد', avatar: 'م' },
                  })
                }
              >
                شات مع الكابتن
              </Button>
              <Button
                variant="ghost"
                full
                leading={<Icon.x size={16} color={colors.statusIssueText} />}
                onPress={() => router.push({ pathname: '/cancel-order', params: { id: order.id } })}
              >
                <Text
                  style={{
                    fontFamily: fonts.arabicSemiBold,
                    fontSize: 16,
                    color: colors.statusIssueText,
                  }}
                >
                  إلغاء الطلب
                </Text>
              </Button>
            </>
          ) : null}
          {isDone ? (
            <>
              <Button variant="primary" full onPress={() => router.push('/cart')}>
                إعادة الطلب
              </Button>
              <Button
                variant="secondary"
                full
                leading={<Icon.receipt size={16} color={colors.olive} />}
                onPress={() => router.push({ pathname: '/invoice', params: { id: order.id } })}
              >
                عرض الفاتورة
              </Button>
              <Button variant="ghost" full onPress={() => router.push('/rate')}>
                {t('tracking.rate')}
              </Button>
              <Button
                variant="ghost"
                full
                leading={<Icon.refresh size={16} color={colors.olive} />}
                onPress={() => router.push({ pathname: '/refund', params: { id: order.id } })}
              >
                طلب استرجاع
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
