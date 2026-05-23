import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppBar, Badge, Chip, EmptyState, Icon, MiniCartBar, ProductTile } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { PRODUCTS, SHOPS, findShop } from '@/features/catalog/data';
import { useCartStore } from '@/features/cart/store';

export default function Shop() {
  const router = useRouter();
  const { isRtl, flexDirection, pick } = useRtl();
  const params = useLocalSearchParams<{ id?: string }>();
  const shop = useMemo(() => findShop(params.id ?? '') ?? SHOPS[0]!, [params.id]);
  const [section, setSection] = useState<string>('الكل');

  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const setItemQty = useCartStore((s) => s.setItemQty);
  const favorites = useCartStore((s) => s.favorites);
  const toggleFavorite = useCartStore((s) => s.toggleFavorite);

  const sections = useMemo(() => {
    const s = ['الكل', ...Array.from(new Set(PRODUCTS.map((p) => p.section)))];
    return s;
  }, []);

  const products = section === 'الكل' ? PRODUCTS : PRODUCTS.filter((p) => p.section === section);
  const qtyOf = (id: string) => items.find((i) => i.id === id)?.qty ?? 0;
  const shopCartItems = items.filter((i) => i.shopId === shop.id);
  const cartCount = shopCartItems.reduce((n, i) => n + i.qty, 0);
  const subtotal = shopCartItems.reduce((n, i) => n + i.qty * i.price, 0);
  const isFav = favorites.includes(shop.id);

  const setQty = (productId: string, qty: number) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;
    if (qty <= 0) {
      setItemQty(productId, 0);
      return;
    }
    const existing = items.find((i) => i.id === productId);
    if (existing) setItemQty(productId, qty);
    else addItem(product, shop, qty);
  };

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
        contentContainerStyle={{ paddingBottom: cartCount > 0 ? 120 : 24 }}
      >
        {/* Hero */}
        <View style={{ paddingHorizontal: 18, paddingBottom: 16 }}>
          <View
            style={{
              height: 158,
              borderRadius: 14,
              backgroundColor: shop.bgFrom,
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
              <Badge variant="ghost">{shop.cat}</Badge>
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
                <Pill icon={<Icon.clock size={13} color="rgba(250,248,243,0.75)" />} text={shop.eta} />
                <Pill icon={<Icon.bike size={13} color="rgba(250,248,243,0.75)" />} text={`توصيل ${shop.fee}`} />
                <Pill icon={<Icon.pin size={13} color="rgba(250,248,243,0.75)" />} text={shop.distance} />
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
        </View>

        {/* Sticky section chips */}
        <View style={{ backgroundColor: colors.canvas }}>
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
