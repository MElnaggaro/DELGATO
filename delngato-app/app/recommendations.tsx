import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppBar, Icon, ProductTile, showToast } from '@/shared/ui';
import { FadeUp, Rise } from '@/shared/motion';
import { colors, fonts, shadow } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useAllProducts, useAllStores } from '@/features/discovery';
import { useCartStore } from '@/features/cart/store';
import type { Product as DomainProduct, Store } from '@/domain/types';
import type { Product as CatalogProduct, Shop as CatalogShop } from '@/features/catalog/data';

export default function Recommendations() {
  const router = useRouter();
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection } = useRtl();
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const setItemQty = useCartStore((s) => s.setItemQty);

  const allProducts = useAllProducts();
  const allStores = useAllStores();

  const recProducts = [allProducts[1], allProducts[3], allProducts[7], allProducts[11], allProducts[4], allProducts[2]].filter((p): p is DomainProduct => !!p);
  const qtyOf = (id: string) => items.find((i) => i.id === id)?.qty ?? 0;
  const defaultStore = allStores[0];

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
    if (!defaultStore) return;
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
    const result = addItem(toCatalogProduct(product), toCatalogShop(defaultStore), qty);
    if (!result.ok && result.reason === 'conflict') {
      router.push({
        pathname: '/merchant-conflict',
        params: { newShopId: defaultStore.id, newProductId: productId, newQty: String(qty) },
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="مقترح ليك" onBack={() => safeBack('/(tabs)/home')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28 }}>
        <FadeUp>
          <View
            style={{
              backgroundColor: 'rgba(31,74,61,0.06)',
              borderRadius: 12,
              padding: 14,
              marginTop: 8,
              marginBottom: 16,
              flexDirection,
              gap: 10,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: colors.olive,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.star size={18} color={colors.canvas} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: fonts.arabicBold,
                  fontSize: 13.5,
                  color: colors.ink,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                بناءً على طلباتك السابقة
              </Text>
              <Text
                style={{
                  fontFamily: fonts.arabic,
                  fontSize: 12,
                  color: colors.inkLight,
                  marginTop: 2,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                منتجات بنفتكر إنها هتعجبك
              </Text>
            </View>
          </View>
        </FadeUp>

        <Text style={section(isRtl)}>منتجات تطلبها كتير</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
          {recProducts.slice(0, 4).map((p, i) => (
            <Rise key={p.id} delay={i * 40} style={{ width: '48.5%' }}>
              <ProductTile
                product={p}
                qty={qtyOf(p.id)}
                onTap={() => router.push({ pathname: '/product', params: { id: p.id, shopId: defaultStore?.id ?? '' } })}
                onAdd={() => {
                  setQty(p.id, 1);
                  showToast('اتضاف للسلة', <Icon.check size={16} color={colors.gold} />);
                }}
                onChange={(n) => setQty(p.id, n)}
              />
            </Rise>
          ))}
        </View>

        <Text style={section(isRtl)}>جديد في الدلنجات</Text>
        <View style={{ gap: 8 }}>
          {recProducts.slice(4).map((p) => (
            <Pressable
              key={p.id}
              onPress={() => router.push({ pathname: '/product', params: { id: p.id, shopId: defaultStore?.id ?? '' } })}
              style={({ pressed }) => ({
                backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
                borderRadius: 12,
                padding: 10,
                flexDirection,
                alignItems: 'center',
                gap: 12,
                ...shadow.card,
              })}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 10,
                  backgroundColor: p.hue,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: fonts.arabicBold, fontSize: 28, color: 'rgba(15,26,23,0.18)' }}>
                  {p.name[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: fonts.arabicSemiBold,
                    fontSize: 14,
                    color: colors.ink,
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  {p.name}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.arabic,
                    fontSize: 12,
                    color: colors.inkLight,
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  {p.sub}
                </Text>
              </View>
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 14, color: colors.olive }}>
                {arDigits(p.price)}{' '}
                <Text
                  style={{
                    fontFamily: fonts.arabicMedium,
                    fontSize: 11,
                    color: colors.inkLight,
                  }}
                >
                  ج.م
                </Text>
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function section(isRtl: boolean) {
  return {
    fontFamily: fonts.arabicSemiBold,
    fontSize: 12,
    color: colors.inkMute,
    letterSpacing: 0.4,
    marginTop: 18,
    marginBottom: 10,
    textAlign: (isRtl ? 'right' : 'left') as 'right' | 'left',
  } as const;
}
