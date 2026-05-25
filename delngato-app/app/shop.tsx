import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppBar, Badge, Chip, EmptyState, Icon, MiniCartBar, ProductTile } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useStoreDetail, useProductsByStore } from '@/features/discovery';
import { useCartStore } from '@/features/cart/store';
import type { Product as DomainProduct, Store } from '@/domain/types';
import type { Product as CatalogProduct, Shop as CatalogShop } from '@/features/catalog/data';

export default function Shop() {
  const router = useRouter();
  const { isRtl, flexDirection, pick, textStart } = useRtl();
  const params = useLocalSearchParams<{ id?: string }>();
  const store = useStoreDetail(params.id);
  const allProducts = useProductsByStore(params.id);
  const [section, setSection] = useState<string>('الكل');
  const [scrolled, setScrolled] = useState(false);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > 8 && !scrolled) setScrolled(true);
    else if (y <= 8 && scrolled) setScrolled(false);
  };

  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const setItemQty = useCartStore((s) => s.setItemQty);
  const favorites = useCartStore((s) => s.favorites);
  const toggleFavorite = useCartStore((s) => s.toggleFavorite);

  const sections = useMemo(() => {
    const s = ['الكل', ...Array.from(new Set(allProducts.map((p) => p.section).filter(Boolean) as string[]))];
    return s;
  }, [allProducts]);

  const products = section === 'الكل' ? allProducts : allProducts.filter((p) => p.section === section);
  const shop = store; // alias for template compatibility
  const shopId = shop?.id ?? '';
  const qtyOf = (id: string) => items.find((i) => i.id === id)?.qty ?? 0;
  const shopCartItems = items.filter((i) => i.shopId === shopId);
  const cartCount = shopCartItems.reduce((n, i) => n + i.qty, 0);
  const subtotal = shopCartItems.reduce((n, i) => n + i.qty * i.price, 0);
  const isFav = favorites.includes(shopId);

  /** Adapt domain types to cart store's catalog-type interface. */
  const toCatalogProduct = (p: DomainProduct): CatalogProduct => ({
    id: p.id, name: p.name, sub: p.sub, price: p.price, hue: p.hue,
    tag: p.tag ?? null, section: p.section ?? '', available: p.availability !== 'out' && p.availability !== 'archived',
  });
  const toCatalogShop = (s: Store): CatalogShop => ({
    id: s.id, letter: s.letter, name: s.name, cat: s.category, catKey: s.catKey as any,
    distance: s.distance ?? '', rating: String(s.rating), eta: '', fee: '',
    open: s.open, desc: s.desc ?? '', bgFrom: s.bg.bgFrom, bgTo: s.bg.bgTo, tags: [...s.tags],
  });

  const setQty = (productId: string, qty: number) => {
    if (!shop) return;
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;
    if (qty <= 0) {
      setItemQty(productId, 0);
      return;
    }
    const existing = items.find((i) => i.id === productId);
    if (existing) {
      setItemQty(productId, qty);
      return;
    }
    const result = addItem(toCatalogProduct(product), toCatalogShop(shop), qty);
    if (!result.ok && result.reason === 'conflict') {
      router.push({
        pathname: '/merchant-conflict',
        params: {
          newShopId: shop.id,
          newProductId: productId,
          newQty: String(qty),
        },
      });
    }
  };

  if (!shop) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar
        title={shop.name}
        onBack={() => safeBack('/(tabs)/home')}
        trailing={
          <View style={{ flexDirection, gap: 4 }}>
            <Pressable onPress={() => toggleFavorite(shop.id)} hitSlop={6} style={{ padding: 6 }}>
              <Icon.heart
                size={22}
                color={isFav ? colors.statusIssue : colors.ink}
                fill={isFav ? colors.statusIssue : 'transparent'}
              />
            </Pressable>
            <Pressable
              onPress={() =>
                void Share.share({
                  message: `${shop.name} على دلنجاتُو — ${shop.desc}`,
                })
              }
              accessibilityLabel="مشاركة"
              hitSlop={6}
              style={{ padding: 6 }}
            >
              <Icon.share size={22} color={colors.ink} />
            </Pressable>
          </View>
        }
      />

      <ScrollView
        stickyHeaderIndices={[1]}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: cartCount > 0 ? 120 : 24 }}
      >
        {/* Hero */}
        <View style={{ paddingHorizontal: 18, paddingBottom: 16 }}>
          <View
            style={{
              height: 158,
              borderRadius: 14,
              backgroundColor: shop.bg.bgFrom,
              padding: 16,
              justifyContent: 'space-between',
              overflow: 'hidden',
            }}
          >
            <Text
              style={{
                position: 'absolute',
                top: -30,
                left: pick(-20, undefined),
                right: pick(undefined, -20),
                fontFamily: fonts.arabicBold,
                fontSize: 180,
                lineHeight: 180 * 0.85,
                color: 'rgba(250,248,243,0.07)',
              }}
            >
              {shop.letter}
            </Text>
            <View style={{ flexDirection, gap: 8 }}>
              <Badge variant="solid-gold">{shop.rating} ★</Badge>
              <Badge variant="ghost">{shop.category}</Badge>
              {shop.tags[0] ? <Badge variant="ghost">{shop.tags[0]}</Badge> : null}
            </View>
            <View>
              <Text
                style={{ fontFamily: fonts.arabicBold, fontSize: 22, color: colors.canvas }}
              >
                {shop.name}
              </Text>
              <View
                style={{
                  flexDirection,
                  flexWrap: 'wrap',
                  gap: 14,
                  marginTop: 6,
                }}
              >
                <Pill icon={<Icon.clock size={13} color="rgba(250,248,243,0.75)" />} text={`${shop.prepTimeMin}–${shop.prepTimeMin + Math.round(shop.prepTimeMin * 0.5)} د`} />
                <Pill icon={<Icon.bike size={13} color="rgba(250,248,243,0.75)" />} text={`توصيل ${shop.deliveryFee} ج.م`} />
                <Pill icon={<Icon.pin size={13} color="rgba(250,248,243,0.75)" />} text={shop.distance ?? ''} />
              </View>
            </View>
          </View>
          <View
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 10,
              backgroundColor: colors.canvas200,
            }}
          >
            <Text style={{ fontFamily: fonts.arabic, fontSize: 13, lineHeight: 22, color: colors.inkLight }}>
              {shop.desc}
            </Text>
          </View>

          {/* Quick actions strip */}
          <View style={{ flexDirection, gap: 8, marginTop: 12 }}>
            <Pressable
              onPress={() => router.push({ pathname: '/reviews', params: { shopId: shop.id } })}
              style={{ flex: 1 }}
            >
              {({ pressed }) => (
                <View
                  style={{
                    backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.canvas300,
                    padding: 10,
                    flexDirection,
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Icon.star size={16} color={colors.gold} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: fonts.arabicBold,
                        fontSize: 12.5,
                        color: colors.ink,
                        textAlign: textStart,
                      }}
                    >
                      التقييمات
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.arabic,
                        fontSize: 10,
                        color: colors.inkLight,
                        textAlign: textStart,
                      }}
                    >
                      {shop.rating} · شوف الكل
                    </Text>
                  </View>
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={() =>
                router.push({ pathname: '/contact-merchant', params: { shopId: shop.id } })
              }
              style={{ flex: 1 }}
            >
              {({ pressed }) => (
                <View
                  style={{
                    backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.canvas300,
                    padding: 10,
                    flexDirection,
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Icon.message size={16} color={colors.olive} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: fonts.arabicBold,
                        fontSize: 12.5,
                        color: colors.ink,
                        textAlign: textStart,
                      }}
                    >
                      تواصل مع المحل
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.arabic,
                        fontSize: 10,
                        color: colors.inkLight,
                        textAlign: textStart,
                      }}
                    >
                      رد في دقايق
                    </Text>
                  </View>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Sticky section chips — gains a 1px bottom shadow once scrolled */}
        <View
          style={{
            backgroundColor: colors.canvas,
            borderBottomWidth: scrolled ? 1 : 0,
            borderBottomColor: colors.canvas300,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 18, gap: 6, paddingTop: 6, paddingBottom: 12 }}
          >
            {sections.map((s) => (
              <Chip key={s} active={section === s} onPress={() => setSection(s)}>
                {s}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Grid */}
        <View style={{ paddingHorizontal: 18 }}>
          {products.length === 0 ? (
            <EmptyState
              icon={<Icon.store size={28} color={colors.olive} />}
              title="مفيش منتجات في القسم ده"
              body="جرب قسم تاني."
            />
          ) : (
            <View
              style={{ flexDirection, flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}
            >
              {products.map((p) => (
                <View key={p.id} style={{ width: '48.5%' }}>
                  <ProductTile
                    product={p}
                    qty={qtyOf(p.id)}
                    onTap={() => router.push({ pathname: '/product', params: { id: p.id, shopId: shop.id } })}
                    onAdd={() => setQty(p.id, 1)}
                    onChange={(n) => setQty(p.id, n)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {cartCount > 0 ? (
        <MiniCartBar
          count={cartCount}
          total={subtotal}
          shopName={shop.name}
          onPress={() => router.push('/cart')}
        />
      ) : null}
    </View>
  );
}

function Pill({ icon, text }: { icon: React.ReactNode; text: string }) {
  const { flexDirection: fd } = useRtl();
  return (
    <View style={{ flexDirection: fd, alignItems: 'center', gap: 4 }}>
      {icon}
      <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 12, color: 'rgba(250,248,243,0.75)' }}>
        {text}
      </Text>
    </View>
  );
}
