import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { Badge, Button, CategoryChip, CategoryChipRow, EmptyState, Icon, LiveDot, PressableScale } from '@/shared/ui';
import { colors, fonts, shadow } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { useAuthStore } from '@/features/auth/store';
import {
  useCustomerOrders,
  toDisplayStatus,
  statusText,
  type OrderDisplayStatus,
} from '@/features/orders/hooks';
import { usePlatformStore } from '@/domain/stores/platform';
import { DEMO_CUSTOMER } from '@/infrastructure/seed/seedData';
import type { Order } from '@/domain/types';

type Filter = 'all' | 'live' | 'done';

export default function OrdersTab() {
  const { t } = useTranslation();
  const router = useRouter();
  const arDigits = useArabicDigits();
  const { isRtl } = useRtl();
  const user = useAuthStore((s) => s.user);
  const orders = useCustomerOrders(user?.id ?? DEMO_CUSTOMER.id);
  const [tab, setTab] = useState<Filter>('all');

  const filtered = useMemo(() => {
    if (tab === 'live') return orders.filter((o) => toDisplayStatus(o.status) === 'live');
    if (tab === 'done') return orders.filter((o) => toDisplayStatus(o.status) === 'done');
    return orders;
  }, [orders, tab]);

  const liveCount = orders.filter((o) => toDisplayStatus(o.status) === 'live').length;
  const doneCount = orders.filter((o) => toDisplayStatus(o.status) === 'done').length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView edges={['top']} />
      <View style={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontFamily: fonts.arabicBold, fontSize: 22, color: colors.ink, textAlign: isRtl ? 'right' : 'left' }}>
          {t('orders.title')}
        </Text>
      </View>
      <CategoryChipRow>
        <CategoryChip active={tab === 'all'} onPress={() => setTab('all')}>
          {`الكل ${arDigits(orders.length)}`}
        </CategoryChip>
        <CategoryChip active={tab === 'live'} onPress={() => setTab('live')}>
          {`شغّال ${arDigits(liveCount)}`}
        </CategoryChip>
        <CategoryChip active={tab === 'done'} onPress={() => setTab('done')}>
          {`متم ${arDigits(doneCount)}`}
        </CategoryChip>
      </CategoryChipRow>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
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
          <Animated.View style={{ gap: 10 }}>
            {filtered.map((o) => (
              <Animated.View key={o.id} layout={LinearTransition}>
                <OrderCard
                  order={o}
                  onPress={() => router.push({ pathname: '/order-detail', params: { id: o.id } })}
                />
              </Animated.View>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection } = useRtl();
  const storeName = usePlatformStore((s) => s.stores[order.storeId]?.name ?? '');
  const storeLetter = usePlatformStore((s) => s.stores[order.storeId]?.letter ?? '');
  const display = toDisplayStatus(order.status);
  const isLive = display === 'live';
  const isCancelled = display === 'cancelled';
  const borderColor = isLive
    ? colors.olive
    : isCancelled
      ? colors.statusIssue
      : 'transparent';
  const itemCount = order.items.reduce((n, i) => n + i.qty, 0);
  const dateLabel = order.placedAt
    ? new Date(order.placedAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
    : '';

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.98}
      style={{
        backgroundColor: colors.bgElevated,
        borderRadius: 12,
        padding: 14,
        ...shadow.card,
        borderRightWidth: isRtl ? 3 : 0,
        borderRightColor: isRtl ? borderColor : 'transparent',
        borderLeftWidth: isRtl ? 0 : 3,
        borderLeftColor: isRtl ? 'transparent' : borderColor,
      }}
    >
      <View style={{ flexDirection, alignItems: 'center', gap: 12, marginBottom: 10, width: '100%' }}>
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
            {storeLetter}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink, textAlign: isRtl ? 'right' : 'left' }}
          >
            {storeName}
          </Text>
          <Text style={{ fontFamily: fonts.arabic, fontSize: 11, color: colors.inkLight, textAlign: isRtl ? 'right' : 'left' }}>
            {order.id} · {dateLabel}
          </Text>
        </View>
        <StatusBadge status={display} text={statusText(order.status)} />
      </View>
      {!isCancelled ? (
        <View
          style={{
            flexDirection,
            justifyContent: 'space-between',
            alignItems: 'baseline',
            width: '100%',
          }}
        >
          <Text style={{ fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight, textAlign: isRtl ? 'right' : 'left' }}>
            {arDigits(itemCount)} منتج
          </Text>
          <View style={{ flexDirection, alignItems: 'baseline', gap: 4 }}>
            <Text style={{ fontFamily: fonts.arabicBold, fontSize: 16, color: colors.ink, textAlign: isRtl ? 'right' : 'left' }}>
              {arDigits(order.total)}
            </Text>
            <Text
              style={{ fontFamily: fonts.arabicMedium, fontSize: 11, color: colors.inkLight, textAlign: isRtl ? 'right' : 'left' }}
            >
              ج.م
            </Text>
          </View>
        </View>
      ) : null}
    </PressableScale>
  );
}

function StatusBadge({ status, text }: { status: OrderDisplayStatus; text: string }) {
  const { isRtl, flexDirection } = useRtl();
  if (status === 'live') {
    return (
      <View
        style={{
          alignSelf: 'flex-start',
          paddingHorizontal: 10,
          paddingVertical: 3,
          borderRadius: 100,
          backgroundColor: 'rgba(232,177,79,0.18)',
          flexDirection,
          alignItems: 'center',
          gap: 4,
        }}
      >
        <LiveDot size={6} color={colors.olive} />
        <Text
          style={{
            fontFamily: fonts.arabicSemiBold,
            fontSize: 12,
            color: colors.statusPendingText,
            includeFontPadding: false,
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          {text}
        </Text>
      </View>
    );
  }
  if (status === 'cancelled') return <Badge variant="issue">{text}</Badge>;
  return <Badge variant="active">{text}</Badge>;
}
