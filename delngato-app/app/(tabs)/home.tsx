import { useMemo, useState, useCallback } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  ActiveOrderCard,
  CategoryChip,
  CategoryChipRow,
  CategoryIconTile,
  EmptyState,
  HeroDealCard,
  Icon,
  QuickAccessTile,
  SearchField,
  Section,
  ShopCard,
  showToast,
} from '@/shared/ui';
import { FadeUp, Rise } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { useSelectedAddress } from '@/features/addresses/store';
import { CATEGORIES, SHOPS, type CategoryKey } from '@/features/catalog/data';
import { useOrdersStore } from '@/features/orders/store';

const CATEGORY_ICON: Record<NonNullable<(typeof CATEGORIES)[number]['icon']>, React.ReactNode> = {
  store: <Icon.store size={26} color={colors.olive} />,
  pill: <Icon.pill size={26} color={colors.olive} />,
  utensils: <Icon.utensils size={26} color={colors.olive} />,
  cookie: <Icon.cookie size={26} color={colors.olive} />,
  leaf: <Icon.leaf size={26} color={colors.olive} />,
};

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection, pick } = useRtl();
  const addr = useSelectedAddress();
  const [cat, setCat] = useState<CategoryKey>('all');
  const [refreshing, setRefreshing] = useState(false);

  const orders = useOrdersStore((s) => s.orders);
  const liveOrder = useMemo(() => orders.find((o) => o.status === 'live'), [orders]);
  const unreadCount = useOrdersStore((s) =>
    s.notifications.reduce((n, x) => (x.read ? n : n + 1), 0),
  );

  const filtered = cat === 'all' ? SHOPS : SHOPS.filter((s) => s.catKey === cat);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast('تم تحديث المحلات', <Icon.check size={16} color={colors.gold} />);
    }, 900);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView edges={['top']}>
        <FadeUp
          style={{
            paddingHorizontal: 18,
            paddingTop: 14,
            paddingBottom: 6,
            flexDirection,
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Pressable
            onPress={() => router.push('/addresses')}
            style={{ flex: 1, gap: 2 }}
            hitSlop={6}
          >
            <Text
              style={{
                fontFamily: fonts.arabicMedium,
                fontSize: 11,
                color: colors.inkMute,
                textAlign: 'left',
              }}
            >
              {t('home.deliveryTo')}
            </Text>
            <View style={{ flexDirection, alignItems: 'center', gap: 4 }}>
              <Icon.pin size={16} color={colors.olive} />
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: fonts.arabicSemiBold,
                  fontSize: 15,
                  color: colors.ink,
                  textAlign: 'left',
                }}
              >
                {addr
                  ? `${addr.label === 'home' ? 'البيت' : addr.label === 'work' ? 'الشغل' : 'العنوان'} · ${addr.street}`
                  : 'اختر عنوان التوصيل'}
              </Text>
              <Icon.chevronDown size={16} color={colors.inkLight} />
            </View>
          </Pressable>
          <Pressable
            onPress={() => router.push('/notifications')}
            accessibilityLabel="إشعارات"
            style={{
              width: 40,
              height: 40,
              borderRadius: 100,
              backgroundColor: colors.canvas200,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.bell size={20} color={colors.ink} />
            {unreadCount > 0 ? (
              <View
                style={{
                  position: 'absolute',
                  top: 8,
                  left: pick(8, undefined),
                  right: pick(undefined, 8),
                  width: 8,
                  height: 8,
                  borderRadius: 8,
                  backgroundColor: colors.gold,
                  borderWidth: 2,
                  borderColor: colors.canvas200,
                }}
              />
            ) : null}
          </Pressable>
        </FadeUp>
      </SafeAreaView>

      <View style={{ paddingHorizontal: 18, paddingTop: 6, paddingBottom: 8 }}>
        <SearchField
          value=""
          onChangeText={() => {}}
          readOnly
          onTapWhenReadOnly={() => router.push('/(tabs)/search')}
          placeholder={t('home.searchPlaceholder')}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.olive}
            colors={[colors.olive]}
          />
        }
      >
        {/* Category icon strip (5 tiles, horizontal scroll) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingTop: 6 }}
          contentContainerStyle={{ paddingHorizontal: 18, gap: 12, paddingBottom: 14 }}
        >
          {CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
            <CategoryIconTile
              key={c.key}
              icon={c.icon ? CATEGORY_ICON[c.icon] : <Icon.store size={26} color={colors.olive} />}
              label={c.label}
              onPress={() => router.push({ pathname: '/category', params: { key: c.key } })}
            />
          ))}
        </ScrollView>

        {/* Active order banner */}
        {liveOrder ? (
          <View style={{ paddingHorizontal: 18, paddingBottom: 14 }}>
            <ActiveOrderCard
              order={liveOrder}
              onPress={() =>
                router.push({ pathname: '/tracking', params: { orderId: liveOrder.id } })
              }
            />
          </View>
        ) : null}

        {/* Category filter chips */}
        <CategoryChipRow>
          {CATEGORIES.map((c) => (
            <CategoryChip key={c.key} active={cat === c.key} onPress={() => setCat(c.key)}>
              {c.label}
            </CategoryChip>
          ))}
        </CategoryChipRow>

        {/* Hero deal banner */}
        <Rise delay={120} style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 16 }}>
          <HeroDealCard
            badge={t('home.offerToday')}
            title={t('home.offerTitle')}
            sub={
              <Text
                style={{
                  fontFamily: fonts.arabic,
                  fontSize: 12,
                  color: 'rgba(250,248,243,0.7)',
                  textAlign: isRtl ? 'right' : 'left',
                  marginTop: 6,
                }}
              >
                {t('home.offerCode')}{' '}
                <Text style={{ fontFamily: fonts.arabicBold, color: colors.gold }}>DLN10</Text>
              </Text>
            }
            icon={<Icon.bike size={36} color={colors.gold} />}
            onPress={() => router.push('/deals')}
          />
        </Rise>

        {/* Quick access — 3 tiles */}
        <View style={{ paddingHorizontal: 18, paddingBottom: 16, flexDirection: 'row', gap: 8 }}>
          <QuickAccessTile
            icon={<Icon.tag size={20} color={colors.statusPendingText} />}
            label="العروض"
            accent="gold"
            onPress={() => router.push('/deals')}
          />
          <QuickAccessTile
            icon={<Icon.star size={20} color={colors.olive} />}
            label="محلات مميزة"
            onPress={() => router.push('/featured')}
          />
          <QuickAccessTile
            icon={<Icon.heart size={20} color={colors.olive} />}
            label="مقترح ليك"
            onPress={() => router.push('/recommendations')}
          />
        </View>

        {/* Nearby shops */}
        <Section
          title={t('home.nearbyShops')}
          action={{ label: t('common.viewAll'), onPress: () => router.push('/nearby') }}
          paddingTop={4}
        >
          <View style={{ gap: 10 }}>
            {filtered.length === 0 ? (
              <EmptyState
                icon={<Icon.store size={28} color={colors.olive} />}
                title={t('home.noShopsTitle')}
                body={t('home.noShopsBody')}
              />
            ) : (
              filtered.map((s) => (
                <ShopCard
                  key={s.id}
                  shop={s}
                  onPress={() => router.push({ pathname: '/shop', params: { id: s.id } })}
                />
              ))
            )}
          </View>
        </Section>

        <Text
          style={{
            fontFamily: fonts.arabic,
            fontSize: 11,
            color: colors.inkMute,
            textAlign: 'center',
            marginTop: 20,
          }}
        >
          {arDigits(filtered.length)} محل قريب منك
        </Text>
      </ScrollView>
    </View>
  );
}
