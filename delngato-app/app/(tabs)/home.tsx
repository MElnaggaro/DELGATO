import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Badge, Chip, EmptyState, Icon, SearchField, Section, ShopCard } from '@/shared/ui';
import { FadeUp, Rise } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useSelectedAddress } from '@/features/addresses/store';
import { CATEGORIES, SHOPS, type CategoryKey } from '@/features/catalog/data';
import { useOrdersStore } from '@/features/orders/store';

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const arDigits = useArabicDigits();
  const addr = useSelectedAddress();
  const [cat, setCat] = useState<CategoryKey>('all');

  const orders = useOrdersStore((s) => s.orders);
  const liveOrder = useMemo(() => orders.find((o) => o.status === 'live'), [orders]);
  const unreadCount = useOrdersStore((s) =>
    s.notifications.reduce((n, x) => (x.read ? n : n + 1), 0),
  );

  const filtered = cat === 'all' ? SHOPS : SHOPS.filter((s) => s.catKey === cat);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView edges={['top']}>
        <FadeUp
          style={{
            paddingHorizontal: 18,
            paddingTop: 14,
            paddingBottom: 6,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Pressable
            onPress={() => router.push('/addresses')}
            style={{ flex: 1, gap: 2 }}
            hitSlop={6}
          >
            <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 11, color: colors.inkMute }}>
              {t('home.deliveryTo')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon.pin size={16} color={colors.olive} />
              <Text
                numberOfLines={1}
                style={{ fontFamily: fonts.arabicSemiBold, fontSize: 15, color: colors.ink }}
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
                  insetInlineEnd: 8,
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
      >
        {/* Browse by category — titled icon scroller */}
        <Section title={t('search.browseCategory')} paddingTop={8}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -18 }}
            contentContainerStyle={{ paddingHorizontal: 18, gap: 12 }}
          >
            {CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
              <Pressable
                key={c.key}
                onPress={() => router.push({ pathname: '/category', params: { key: c.key } })}
                style={{ alignItems: 'center', gap: 8, minWidth: 64 }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: colors.canvas200,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {c.icon === 'store' ? (
                    <Icon.store size={26} color={colors.olive} />
                  ) : c.icon === 'pill' ? (
                    <Icon.pill size={26} color={colors.olive} />
                  ) : c.icon === 'utensils' ? (
                    <Icon.utensils size={26} color={colors.olive} />
                  ) : c.icon === 'cookie' ? (
                    <Icon.cookie size={26} color={colors.olive} />
                  ) : (
                    <Icon.leaf size={26} color={colors.olive} />
                  )}
                </View>
                <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 12, color: colors.ink }}>
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Section>

        {/* Active order banner */}
        {liveOrder ? (
          <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
            <Pressable
              onPress={() => router.push({ pathname: '/tracking', params: { orderId: liveOrder.id } })}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#1a201d' : colors.ink,
                borderRadius: 14,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              })}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: 'rgba(232,177,79,0.18)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.bike size={20} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: colors.gold,
                    }}
                  />
                  <Text
                    style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.canvas }}
                  >
                    {t('orders.liveBadge')}
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.arabic,
                      fontSize: 11,
                      color: 'rgba(250,248,243,0.5)',
                    }}
                  >
                    {liveOrder.id}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: fonts.arabic,
                    fontSize: 12,
                    color: 'rgba(250,248,243,0.7)',
                    marginTop: 4,
                  }}
                >
                  {liveOrder.statusText} · {liveOrder.shop}
                </Text>
              </View>
              <Icon.chevronDown size={20} color={colors.canvas} />
            </Pressable>
          </View>
        ) : null}

        {/* Hero offer */}
        <Rise delay={120} style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6 }}>
          <View
            style={{
              backgroundColor: colors.olive,
              borderRadius: 14,
              padding: 18,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              overflow: 'hidden',
            }}
          >
            <View style={{ flex: 1, gap: 8 }}>
              <Badge variant="solid-gold">{t('home.offerToday')}</Badge>
              <Text
                style={{
                  fontFamily: fonts.arabicBold,
                  fontSize: 20,
                  color: colors.canvas,
                  lineHeight: 26,
                }}
              >
                {t('home.offerTitle')}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.arabic,
                  fontSize: 12,
                  color: 'rgba(250,248,243,0.7)',
                }}
              >
                {t('home.offerCode')}{' '}
                <Text style={{ fontFamily: fonts.arabicBold, color: colors.gold }}>DLN10</Text>
              </Text>
            </View>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 100,
                backgroundColor: 'rgba(232,177,79,0.25)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.bike size={36} color={colors.gold} />
            </View>
          </View>
        </Rise>

        {/* Filter chips (below hero per design ref) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 18, gap: 8, paddingTop: 12, paddingBottom: 4 }}
        >
          {CATEGORIES.map((c) => (
            <Chip key={c.key} active={cat === c.key} onPress={() => setCat(c.key)}>
              {c.label}
            </Chip>
          ))}
        </ScrollView>

        {/* Nearby shops section */}
        <Section
          title={t('home.nearbyShops')}
          action={{ label: t('common.viewAll'), onPress: () => setCat('all') }}
          paddingTop={14}
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
