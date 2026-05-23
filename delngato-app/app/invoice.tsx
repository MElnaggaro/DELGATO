import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppBar, Badge, Button, Card, Icon } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { safeBack } from '@/shared/utils/nav';
import { useOrdersStore } from '@/features/orders/store';

const ITEMS = [
  { name: 'لبن جهينة', qty: 2, price: 32 },
  { name: 'بيض بلدي', qty: 1, price: 145 },
  { name: 'خبز فينو', qty: 3, price: 12 },
];

const FEE = 10;

export default function Invoice() {
  const router = useRouter();
  const arDigits = useArabicDigits();
  const params = useLocalSearchParams<{ id?: string }>();
  const orders = useOrdersStore((s) => s.orders);
  const order = useMemo(
    () => orders.find((o) => o.id === params.id) ?? orders[0]!,
    [orders, params.id],
  );

  const sub = ITEMS.reduce((s, i) => s + i.qty * i.price, 0);
  const tax = Math.round(sub * 0.05);
  const total = sub + FEE + tax;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar
        title="الفاتورة"
        onBack={() => safeBack('/order-detail')}
        trailing={
          <Pressable hitSlop={6} style={{ padding: 6, flexDirection: 'row', gap: 4, alignItems: 'center' }}>
            <Icon.share size={16} color={colors.olive} />
            <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.olive }}>
              حفظ
            </Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 28 }}>
        <Card padding={20}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.canvas300,
            }}
          >
            <View>
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 22, color: colors.olive }}>
                دلنجاتُو
              </Text>
              <Text
                style={{
                  fontFamily: fonts.displayBold,
                  fontSize: 9,
                  color: colors.inkMute,
                  marginTop: 2,
                  letterSpacing: 1.8,
                }}
              >
                DELNGATO
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Badge variant="active">مدفوع</Badge>
              <Text
                style={{
                  fontFamily: fonts.arabicSemiBold,
                  fontSize: 13,
                  color: colors.ink,
                  marginTop: 6,
                }}
              >
                {order.id}
              </Text>
            </View>
          </View>

          <View
            style={{
              paddingVertical: 14,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 14,
            }}
          >
            <MetaCell label="تاريخ الفاتورة" value="الأحد · ٣٠ يونيو ٢٠٢٦" />
            <MetaCell label="المحل" value={order.shop} />
            <MetaCell label="العميل" value="أحمد محمد" />
            <MetaCell label="طريقة الدفع" value="كاش" />
          </View>

          <View
            style={{ borderTopWidth: 1, borderTopColor: colors.canvas300, paddingTop: 12 }}
          >
            <View
              style={{
                flexDirection: 'row',
                paddingBottom: 6,
                borderBottomWidth: 1,
                borderBottomColor: colors.canvas300,
              }}
            >
              <Text style={{ flex: 1, ...header() }}>المنتج</Text>
              <Text style={{ width: 50, textAlign: 'center', ...header() }}>الكمية</Text>
              <Text style={{ width: 80, textAlign: 'left', ...header() }}>السعر</Text>
            </View>
            {ITEMS.map((it, i) => (
              <View
                key={it.name}
                style={{
                  flexDirection: 'row',
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.canvas300,
                  alignItems: 'baseline',
                }}
              >
                <Text style={{ flex: 1, fontFamily: fonts.arabic, fontSize: 13, color: colors.ink }}>
                  {it.name}
                </Text>
                <Text
                  style={{
                    width: 50,
                    textAlign: 'center',
                    fontFamily: fonts.arabicMedium,
                    fontSize: 13,
                    color: colors.inkLight,
                  }}
                >
                  {arDigits(it.qty)}
                </Text>
                <Text
                  style={{
                    width: 80,
                    textAlign: 'left',
                    fontFamily: fonts.arabicSemiBold,
                    fontSize: 13,
                    color: colors.ink,
                  }}
                >
                  {arDigits(it.qty * it.price)} ج.م
                </Text>
              </View>
            ))}
          </View>

          <View style={{ paddingTop: 12 }}>
            <Row label="إجمالي المنتجات" value={`${arDigits(sub)} ج.م`} />
            <Row label="رسوم التوصيل" value={`${arDigits(FEE)} ج.م`} />
            <Row label="ضريبة القيمة المضافة (٥٪)" value={`${arDigits(tax)} ج.م`} />
            <View style={{ height: 1, backgroundColor: colors.canvas300, marginVertical: 10 }} />
            <Row label="الإجمالي" value={`${arDigits(total)} ج.م`} bold />
          </View>

          <View
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTopWidth: 1,
              borderTopColor: colors.canvas300,
              borderStyle: 'dashed',
            }}
          >
            <Text
              style={{
                fontFamily: fonts.arabic,
                fontSize: 11,
                color: colors.inkMute,
                textAlign: 'center',
                lineHeight: 18,
              }}
            >
              شكراً لاستخدامك دلنجاتُو · من الدلنجات · لأهل الدلنجات{'\n'}
              للاستفسار: support@delngato.app
            </Text>
          </View>
        </Card>

        <View style={{ marginTop: 16, gap: 10 }}>
          <Button variant="secondary" full leading={<Icon.share size={16} color={colors.olive} />}>
            مشاركة الفاتورة
          </Button>
          <Button
            variant="ghost"
            full
            leading={<Icon.refresh size={16} color={colors.olive} />}
            onPress={() => router.push({ pathname: '/refund', params: { id: order.id } })}
          >
            طلب استرجاع لطلب
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

function header() {
  return {
    fontFamily: fonts.arabicSemiBold,
    fontSize: 11,
    color: colors.inkMute,
    letterSpacing: 0.4,
  } as const;
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexGrow: 1, flexBasis: '40%' }}>
      <Text
        style={{
          fontFamily: fonts.arabicSemiBold,
          fontSize: 11,
          color: colors.inkMute,
          letterSpacing: 0.4,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontFamily: fonts.arabic, fontSize: 13, color: colors.ink, marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
      }}
    >
      <Text
        style={{
          fontFamily: bold ? fonts.arabicBold : fonts.arabicMedium,
          fontSize: bold ? 14 : 12.5,
          color: bold ? colors.ink : colors.inkLight,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: bold ? fonts.arabicBold : fonts.arabicSemiBold,
          fontSize: bold ? 17 : 13,
          color: colors.ink,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
