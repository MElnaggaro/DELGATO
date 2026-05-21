import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Badge, Button, Chip, EmptyState, Icon } from '@/shared/ui';
import { colors, fonts, shadow } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useOrdersStore } from '@/features/orders/store';
import type { OrderHistory, OrderStatus } from '@/features/catalog/data';

type Filter = 'all' | 'live' | 'done';

export default function OrdersTab() {
  const { t } = useTranslation();
  const router = useRouter();
  const arDigits = useArabicDigits();
  const orders = useOrdersStore((s) => s.orders);
  const [tab, setTab] = useState<Filter>('all');

  const filtered = useMemo(() => {
    if (tab === 'live') return orders.filter((o) => o.status === 'live');
    if (tab === 'done') return orders.filter((o) => o.status === 'done');
    return orders;
  }, [orders, tab]);

  const liveCount = orders.filter((o) => o.status === 'live').length;
  const doneCount = orders.filter((o) => o.status === 'done').length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView edges={['top']} />
      <View style={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontFamily: fonts.arabicBold, fontSize: 22, color: colors.ink }}>
          {t('orders.title')}
        </Text>
      </View>
      <View style={{ paddingHorizontal: 18, paddingBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip active={tab === 'all'} onPress={() => setTab('all')}>
              {`الكل · ${arDigits(orders.length)}`}
            </Chip>
            <Chip active={tab === 'live'} onPress={() => setTab('live')}>
              {`شغّال · ${arDigits(liveCount)}`}
            </Chip>
            <Chip active={tab === 'done'} onPress={() => setTab('done')}>
              {`متم · ${arDigits(doneCount)}`}
            </Chip>
          </View>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24 }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Icon.receipt size={28} color={colors.olive} />}
            title="مفيش طلبات هنا"
            body="أول ما تطلب أول طلب من دلنجاتُو هتلاقيه هنا."
            action={
              <Button variant="primary" onPress={() => router.replace('/(tabs)/home')}>
                تصفّح المحلات
              </Button>
            }
          />
        ) : (
          <View style={{ gap: 10 }}>
            {filtered.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                onPress={() => router.push({ pathname: '/order-detail', params: { id: o.id } })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function OrderCard({ order, onPress }: { order: OrderHistory; onPress: () => void }) {
  const arDigits = useArabicDigits();
  const isLive = order.status === 'live';
  const isCancelled = order.status === 'cancelled';
  const borderColor = isLive
    ? colors.olive
    : isCancelled
      ? colors.statusIssue
      : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.bgElevated,
        borderRadius: 12,
        padding: 14,
        opacity: pressed ? 0.94 : 1,
        ...shadow.card,
        borderLeftWidth: 3,
        borderLeftColor: borderColor,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 100,
            backgroundColor: colors.olive,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: fonts.arabicBold, fontSize: 18, color: colors.canvas }}>
            {order.shopLetter}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink }}
          >
            {order.shop}
          </Text>
          <Text style={{ fontFamily: fonts.arabic, fontSize: 11, color: colors.inkLight }}>
            {order.id} · {order.date}
          </Text>
        </View>
        <StatusBadge status={order.status} text={order.statusText} />
      </View>
      {!isCancelled ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <Text style={{ fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight }}>
            {arDigits(order.items)} منتج
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <Text style={{ fontFamily: fonts.arabicBold, fontSize: 16, color: colors.ink }}>
              {arDigits(order.total)}
            </Text>
            <Text
              style={{ fontFamily: fonts.arabicMedium, fontSize: 11, color: colors.inkLight }}
            >
              ج.م
            </Text>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

function StatusBadge({ status, text }: { status: OrderStatus; text: string }) {
  if (status === 'live') return <Badge variant="pending">{text}</Badge>;
  if (status === 'cancelled') return <Badge variant="issue">{text}</Badge>;
  return <Badge variant="active">{text}</Badge>;
}
