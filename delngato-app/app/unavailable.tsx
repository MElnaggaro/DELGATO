import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  AppBar,
  Badge,
  Button,
  Icon,
  ProductTile,
  showToast,
} from '@/shared/ui';
import { Rise } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useProductDetail, useProductsByStore, useStoreDetail } from '@/features/discovery';
import { useCartStore, useNotifySubscribed } from '@/features/cart/store';
import type { Product as DomainProduct, Store } from '@/domain/types';
import type { Product as CatalogProduct, Shop as CatalogShop } from '@/features/catalog/data';

export default function Unavailable() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; shopId?: string }>();
  const product = useProductDetail(params.id);
  const store = useStoreDetail(params.shopId);
  const storeProducts = useProductsByStore(params.shopId);
  const { isRtl, flexDirection } = useRtl();

  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const setItemQty = useCartStore((s) => s.setItemQty);
  const toggleNotify = useCartStore((s) => s.toggleNotify);
  const subscribed = useNotifySubscribed(product?.id ?? '');

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

  const alternatives = useMemo(
    () =>
      product
        ? storeProducts.filter(
            (p) => p.section === product.section && p.id !== product.id && p.availability !== 'out' && p.availability !== 'archived',
          ).slice(0, 4)
        : [],
    [product, storeProducts],
  );

  if (!product || !store) return null;

  const shop = store; // alias for template compatibility

  const qtyOf = (id: string) => items.find((i) => i.id === id)?.qty ?? 0;
  const setQty = (productId: string, qty: number) => {
    const p = storeProducts.find((x) => x.id === productId);
    if (!p) return;
    if (qty <= 0) {
      setItemQty(productId, 0);
      return;
    }
    if (items.find((i) => i.id === productId)) {
      setItemQty(productId, qty);
      return;
    }
    const result = addItem(toCatalogProduct(p), toCatalogShop(shop), qty);
    if (!result.ok && result.reason === 'conflict') {
      router.push({
        pathname: '/merchant-conflict',
        params: { newShopId: shop.id, newProductId: productId, newQty: String(qty) },
      });
    }
  };

  const onToggleNotify = () => {
    const nowSubscribed = toggleNotify(product.id);
    showToast(
      nowSubscribed ? 'هنخبرك أول ما يرجع' : 'تم إلغاء التنبيه',
      <Icon.check size={16} color={colors.gold} />,
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar onBack={() => safeBack(`/shop?id=${shop.id}`)} />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Hero */}
        <View
          style={{
            marginHorizontal: 18,
            height: 220,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: product.hue,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: fonts.arabicBold,
              fontSize: 200,
              lineHeight: 200 * 0.9,
              color: 'rgba(15,26,23,0.10)',
            }}
          >
            {product.name[0]}
          </Text>
          {/* Greyscale veil */}
          <View
            style={{
              ...StyleSheetAbsoluteFill,
              backgroundColor: 'rgba(15,26,23,0.4)',
            }}
          />
          <View style={{ position: 'absolute', top: 14, insetInlineStart: 14 }}>
            <Badge variant="issue">خلصت من المحل</Badge>
          </View>
        </View>

        {/* Headline */}
        <View
          style={{
            paddingHorizontal: 18,
            paddingTop: 22,
            alignItems: isRtl ? 'flex-end' : 'flex-start',
          }}
        >
          <Text
            style={{
              fontFamily: fonts.arabicBold,
              fontSize: 22,
              color: colors.ink,
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            المنتج ده مش متاح دلوقتي
          </Text>
          <Text
            style={{
              fontFamily: fonts.arabic,
              fontSize: 14,
              color: colors.inkLight,
              marginTop: 8,
              lineHeight: 22,
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            {product.name} من {shop.name} خلص دلوقتي. سيب لنا تنبيه ولما يرجع هنخبرك على طول.
          </Text>
        </View>

        {/* Info box */}
        <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
          <View
            style={{
              backgroundColor: 'rgba(197,59,44,0.08)',
              borderRadius: 12,
              padding: 14,
              gap: 4,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: 14,
                color: colors.statusIssueText,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              لو محتاجه ضروري
            </Text>
            <Text
              style={{
                fontFamily: fonts.arabic,
                fontSize: 12.5,
                color: colors.inkLight,
                lineHeight: 20,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              ممكن تتفرّج على البدائل المتاحة تحت، أو نبهنا لما المنتج يرجع للمحل.
            </Text>
          </View>
        </View>

        {/* CTA */}
        <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
          <Button
            variant="primary"
            size="lg"
            full
            onPress={onToggleNotify}
            leading={
              subscribed ? (
                <Icon.check size={18} color={colors.canvas} />
              ) : (
                <Icon.bell size={18} color={colors.canvas} />
              )
            }
          >
            {subscribed ? 'هتخبرنا أول ما يرجع' : 'خبّرني أول ما يرجع'}
          </Button>
        </View>

        {/* Alternatives */}
        {alternatives.length > 0 ? (
          <View style={{ paddingTop: 26 }}>
            <Text
              style={{
                fontFamily: fonts.arabicSemiBold,
                fontSize: 12,
                color: colors.inkMute,
                letterSpacing: 0.4,
                paddingHorizontal: 18,
                marginBottom: 10,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              اختيارات شبيهة متاحة دلوقتي
            </Text>
            <View
              style={{
                paddingHorizontal: 18,
                flexDirection,
                flexWrap: 'wrap',
                gap: 10,
                justifyContent: 'space-between',
              }}
            >
              {alternatives.map((p, i) => (
                <Rise key={p.id} delay={i * 40} style={{ width: '48.5%' }}>
                  <ProductTile
                    product={p}
                    qty={qtyOf(p.id)}
                    onTap={() =>
                      router.push({
                        pathname: '/product',
                        params: { id: p.id, shopId: shop.id },
                      })
                    }
                    onAdd={() => {
                      setQty(p.id, 1);
                      showToast('اتضاف للسلة', <Icon.check size={16} color={colors.gold} />);
                    }}
                    onChange={(n) => setQty(p.id, n)}
                  />
                </Rise>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const StyleSheetAbsoluteFill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
