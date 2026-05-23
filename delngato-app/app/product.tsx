import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  AppBar,
  Badge,
  Button,
  Icon,
  Stepper,
  StickyActionBar,
  STICKY_CTA_HEIGHT,
  showToast,
} from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { PRODUCTS, SHOPS, findProduct, findShop } from '@/features/catalog/data';
import { useCartStore } from '@/features/cart/store';
import { useDiscoveryStore } from '@/features/discovery/store';

export default function Product() {
  const params = useLocalSearchParams<{ id?: string; shopId?: string }>();
  const router = useRouter();
  const product = useMemo(() => findProduct(params.id ?? '') ?? PRODUCTS[0]!, [params.id]);
  const shop = useMemo(() => findShop(params.shopId ?? '') ?? SHOPS[0]!, [params.shopId]);

  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const setItemQty = useCartStore((s) => s.setItemQty);
  const favorites = useCartStore((s) => s.favorites);
  const toggleFavorite = useCartStore((s) => s.toggleFavorite);
  const pushRecent = useDiscoveryStore((s) => s.pushRecent);
  const inCart = items.find((i) => i.id === product.id);

  const [qty, setQty] = useState(inCart?.qty ?? 1);
  const [note, setNote] = useState('');
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection, pick } = useRtl();

  const isFav = favorites.includes(product.id);

  // Track recently-viewed once per mount.
  useMemo(() => {
    if (product.id) pushRecent(product.id);
  }, [product.id, pushRecent]);

  const onAdd = () => {
    if (inCart) {
      setItemQty(product.id, qty);
      showToast(`اتحدث المنتج في السلة`, <Icon.check size={16} color={colors.gold} />);
      safeBack(`/shop?id=${shop.id}`);
      return;
    }
    const result = addItem(product, shop, qty);
    if (!result.ok && result.reason === 'conflict') {
      router.push({
        pathname: '/merchant-conflict',
        params: {
          newShopId: shop.id,
          newProductId: product.id,
          newQty: String(qty),
        },
      });
      return;
    }
    showToast(`اتضاف ${arDigits(qty)}× ${product.name}`, <Icon.check size={16} color={colors.gold} />);
    safeBack(`/shop?id=${shop.id}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar
        onBack={() => safeBack(`/shop?id=${shop.id}`)}
        trailing={
          <Pressable onPress={() => toggleFavorite(product.id)} hitSlop={6} style={{ padding: 6 }}>
            <Icon.heart
              size={22}
              color={isFav ? colors.statusIssue : colors.ink}
              fill={isFav ? colors.statusIssue : 'transparent'}
            />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: STICKY_CTA_HEIGHT + 16 }}>
        {/* Hero */}
        <View
          style={{
            marginHorizontal: 18,
            height: 260,
            borderRadius: 16,
            backgroundColor: product.hue,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Text
            style={{
              fontFamily: fonts.arabicBold,
              fontSize: 220,
              lineHeight: 220 * 0.9,
              color: 'rgba(15,26,23,0.10)',
            }}
          >
            {product.name[0]}
          </Text>
          {product.tag ? (
            <View style={{ position: 'absolute', top: 14, left: pick(14, undefined), right: pick(undefined, 14) }}>
              <Badge variant={product.tag === 'عرض' ? 'pending' : 'solid-olive'}>
                {product.tag}
              </Badge>
            </View>
          ) : null}
        </View>

        {/* Title */}
        <View style={{ paddingHorizontal: 18, paddingTop: 20 }}>
          <Text style={{ fontFamily: fonts.arabicBold, fontSize: 22, color: colors.ink, textAlign: isRtl ? 'right' : 'left' }}>
            {product.name}
          </Text>
          <Text
            style={{ fontFamily: fonts.arabic, fontSize: 13, color: colors.inkLight, marginTop: 6, textAlign: isRtl ? 'right' : 'left' }}
          >
            {product.sub}
          </Text>
          <View
            style={{
              flexDirection,
              alignItems: 'baseline',
              gap: 6,
              marginTop: 12,
            }}
          >
            <Text style={{ fontFamily: fonts.arabicBold, fontSize: 26, color: colors.olive }}>
              {arDigits(product.price)}
            </Text>
            <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 13, color: colors.inkLight }}>
              ج.م
            </Text>
          </View>
        </View>

        {/* Shop strip */}
        <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
          <View
            style={{
              backgroundColor: colors.canvas200,
              borderRadius: 10,
              padding: 12,
              flexDirection,
              alignItems: 'center',
              gap: 10,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 100,
                backgroundColor: colors.olive,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 16, color: colors.canvas }}>
                {shop.letter}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.arabic, fontSize: 11, color: colors.inkLight, textAlign: isRtl ? 'right' : 'left' }}>
                تطلبه من
              </Text>
              <Text
                style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.ink, textAlign: isRtl ? 'right' : 'left' }}
              >
                {shop.name}
              </Text>
            </View>
            <View style={{ flexDirection, alignItems: 'center', gap: 4 }}>
              <Icon.clock size={13} color={colors.inkLight} />
              <Text
                style={{ fontFamily: fonts.arabicMedium, fontSize: 12, color: colors.inkLight }}
              >
                {shop.eta}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
          <Text
            style={{
              fontFamily: fonts.arabicSemiBold,
              fontSize: 12,
              color: colors.inkMute,
              letterSpacing: 0.4,
              marginBottom: 8,
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            الوصف
          </Text>
          <Text style={{ fontFamily: fonts.arabic, fontSize: 14, lineHeight: 24, color: colors.inkLight, textAlign: isRtl ? 'right' : 'left' }}>
            منتج طازج من اختيار {shop.name}. مناسب للاستهلاك اليومي للعيلة. التواريخ والصلاحية مكتوبة على العبوة.
          </Text>
        </View>

        {/* Note */}
        <View style={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: 24 }}>
          <Text
            style={{
              fontFamily: fonts.arabicSemiBold,
              fontSize: 12,
              color: colors.inkMute,
              letterSpacing: 0.4,
              marginBottom: 8,
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            ملاحظة للمحل{' '}
            <Text style={{ fontFamily: fonts.arabic, color: colors.inkLight }}>(اختياري)</Text>
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="مثلاً: من غير ثلج"
            placeholderTextColor={colors.inkMute}
            style={{
              minHeight: 48,
              backgroundColor: colors.bgElevated,
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: colors.canvas300,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontFamily: fonts.arabic,
              fontSize: 15,
              color: colors.ink,
              textAlign: isRtl ? 'right' : 'left',
            }}
          />
        </View>

        {/* Customize / Similar quick links */}
        <View style={{ paddingHorizontal: 18, paddingBottom: 24, flexDirection, gap: 8 }}>
          <Pressable
            onPress={() =>
              router.push({ pathname: '/customize', params: { id: product.id, shopId: shop.id } })
            }
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.canvas300,
              padding: 12,
              flexDirection,
              alignItems: 'center',
              gap: 8,
            })}
          >
            <Icon.edit size={16} color={colors.olive} />
            <Text style={{ fontFamily: fonts.arabicBold, fontSize: 13, color: colors.ink }}>
              خصّص الطلب
            </Text>
          </Pressable>
          <Pressable
            onPress={() =>
              router.push({ pathname: '/similar', params: { id: product.id, shopId: shop.id } })
            }
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.canvas300,
              padding: 12,
              flexDirection,
              alignItems: 'center',
              gap: 8,
            })}
          >
            <Icon.star size={16} color={colors.olive} />
            <Text style={{ fontFamily: fonts.arabicBold, fontSize: 13, color: colors.ink }}>
              منتجات شبيهة
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <StickyActionBar style={{ flexDirection, alignItems: 'center', gap: 12 }}>
        <Stepper value={qty} min={1} onChange={setQty} />
        <View style={{ flex: 1 }}>
          <Button
            variant="primary"
            size="lg"
            full
            onPress={onAdd}
            trailing={
              <Text
                style={{
                  fontFamily: fonts.arabicMedium,
                  fontSize: 13,
                  color: 'rgba(250,248,243,0.85)',
                }}
              >
                · {arDigits(qty * product.price)} ج.م
              </Text>
            }
          >
            {inCart ? 'تحديث السلة' : 'أضف للسلة'}
          </Button>
        </View>
      </StickyActionBar>
    </View>
  );
}
