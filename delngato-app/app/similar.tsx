import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppBar, EmptyState, Icon, ProductTile, showToast } from '@/shared/ui';
import { Rise } from '@/shared/motion';
import { colors } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useProductDetail, useProductsByStore, useStoreDetail } from '@/features/discovery';
import { useCartStore } from '@/features/cart/store';
import type { Product as DomainProduct, Store } from '@/domain/types';
import type { Product as CatalogProduct, Shop as CatalogShop } from '@/features/catalog/data';

export default function Similar() {
  const router = useRouter();
  const { flexDirection } = useRtl();
  const params = useLocalSearchParams<{ id?: string; shopId?: string }>();
  const product = useProductDetail(params.id);
  const store = useStoreDetail(params.shopId);
  const storeProducts = useProductsByStore(params.shopId);

  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const setItemQty = useCartStore((s) => s.setItemQty);

  const similar = product
    ? storeProducts.filter((p) => p.id !== product.id && p.section === product.section)
    : storeProducts.slice(0, 6);

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

  const qtyOf = (id: string) => items.find((i) => i.id === id)?.qty ?? 0;
  const setQty = (productId: string, qty: number) => {
    if (!store) return;
    const p = storeProducts.find((x) => x.id === productId);
    if (!p) return;
    if (qty <= 0) {
      setItemQty(productId, 0);
      return;
    }
    const existing = items.find((i) => i.id === productId);
    if (existing) {
      setItemQty(productId, qty);
      return;
    }
    const result = addItem(toCatalogProduct(p), toCatalogShop(store), qty);
    if (!result.ok && result.reason === 'conflict') {
      router.push({
        pathname: '/merchant-conflict',
        params: { newShopId: store.id, newProductId: productId, newQty: String(qty) },
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="منتجات شبيهة" onBack={() => safeBack('/product')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28, paddingTop: 14 }}>
        {similar.length === 0 ? (
          <EmptyState
            icon={<Icon.store size={28} color={colors.olive} />}
            title="مفيش منتجات شبيهة"
            body="جرب منتج تاني أو ارجع للمحل."
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
            {similar.map((p, i) => (
              <Rise key={p.id} delay={i * 40} style={{ width: '48.5%' }}>
                <ProductTile
                  product={p}
                  qty={qtyOf(p.id)}
                  onTap={() => router.replace({ pathname: '/product', params: { id: p.id, shopId: store?.id ?? '' } })}
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
