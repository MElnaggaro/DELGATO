import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppBar, Button, EmptyState, Icon, ProductTile, showToast } from '@/shared/ui';
import { Rise } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useAllProducts, useAllStores } from '@/features/discovery';
import { useCartStore } from '@/features/cart/store';
import { useDiscoveryStore } from '@/features/discovery/store';
import type { Product as DomainProduct, Store } from '@/domain/types';
import type { Product as CatalogProduct, Shop as CatalogShop } from '@/features/catalog/data';

export default function RecentlyViewed() {
  const router = useRouter();
  const { flexDirection } = useRtl();
  const recentlyViewed = useDiscoveryStore((s) => s.recentlyViewed);
  const clearRecent = useDiscoveryStore((s) => s.clearRecent);
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const setItemQty = useCartStore((s) => s.setItemQty);

  const allProducts = useAllProducts();
  const allStores = useAllStores();

  const list = recentlyViewed.map((id) => allProducts.find((p) => p.id === id)).filter((p): p is DomainProduct => !!p);
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
      <AppBar
        title="شفتها قبل كده"
        onBack={() => safeBack('/(tabs)/home')}
        trailing={
          list.length > 0 ? (
            <Pressable onPress={clearRecent} hitSlop={6} style={{ padding: 6 }}>
              <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.olive }}>
                مسح
              </Text>
            </Pressable>
          ) : null
        }
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28, paddingTop: 8 }}>
        {list.length === 0 ? (
          <EmptyState
            icon={<Icon.clock size={28} color={colors.olive} />}
            title="مفيش حاجة شفتها"
            body="المنتجات اللي تفتحها هتظهر هنا للوصول السريع."
            action={
              <Button variant="primary" onPress={() => router.replace('/(tabs)/home')}>
                تصفّح المحلات
              </Button>
            }
          />
        ) : (
          <View
            style={{
              flexDirection,
              flexWrap: 'wrap',
              gap: 10,
              justifyContent: 'space-between',
            }}
          >
            {list.map((p, i) => (
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
        )}
      </ScrollView>
    </View>
  );
}
