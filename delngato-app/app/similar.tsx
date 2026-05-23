import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppBar, EmptyState, Icon, ProductTile, showToast } from '@/shared/ui';
import { Rise } from '@/shared/motion';
import { colors } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { PRODUCTS, SHOPS, findProduct, findShop } from '@/features/catalog/data';
import { useCartStore } from '@/features/cart/store';

export default function Similar() {
  const router = useRouter();
  const { flexDirection } = useRtl();
  const params = useLocalSearchParams<{ id?: string; shopId?: string }>();
  const product = findProduct(params.id ?? '');
  const shop = findShop(params.shopId ?? '') ?? SHOPS[0]!;

  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const setItemQty = useCartStore((s) => s.setItemQty);

  const similar = product
    ? PRODUCTS.filter((p) => p.id !== product.id && p.section === product.section)
    : PRODUCTS.slice(0, 6);

  const qtyOf = (id: string) => items.find((i) => i.id === id)?.qty ?? 0;
  const setQty = (productId: string, qty: number) => {
    const p = PRODUCTS.find((x) => x.id === productId);
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
    const result = addItem(p, shop, qty);
    if (!result.ok && result.reason === 'conflict') {
      router.push({
        pathname: '/merchant-conflict',
        params: { newShopId: shop.id, newProductId: productId, newQty: String(qty) },
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
                  onTap={() => router.replace({ pathname: '/product', params: { id: p.id, shopId: shop.id } })}
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
