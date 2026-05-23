import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  AppBar,
  Button,
  CheckboxRow,
  FieldLabel,
  Icon,
  RadioRow,
  StickyActionBar,
  STICKY_CTA_HEIGHT,
  showToast,
} from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { PRODUCT_ADDONS, PRODUCTS, SHOPS, findProduct, findShop } from '@/features/catalog/data';
import { useCartStore } from '@/features/cart/store';

export default function Customize() {
  const router = useRouter();
  const arDigits = useArabicDigits();
  const { isRtl } = useRtl();
  const params = useLocalSearchParams<{ id?: string; shopId?: string }>();
  const product = useMemo(() => findProduct(params.id ?? '') ?? PRODUCTS[0]!, [params.id]);
  const shop = useMemo(() => findShop(params.shopId ?? '') ?? SHOPS[0]!, [params.shopId]);

  const addItem = useCartStore((s) => s.addItem);

  const [size, setSize] = useState(PRODUCT_ADDONS.size.options[0]!.id);
  const [extras, setExtras] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const sizeOpt = PRODUCT_ADDONS.size.options.find((o) => o.id === size)!;
  const extrasTotal = PRODUCT_ADDONS.extras.options
    .filter((o) => extras.includes(o.id))
    .reduce((s, o) => s + o.price, 0);
  const totalPrice = product.price + sizeOpt.price + extrasTotal;

  const onConfirm = () => {
    const customized = { ...product, price: totalPrice };
    const result = addItem(customized, shop, 1);
    if (!result.ok && result.reason === 'conflict') {
      router.replace({
        pathname: '/merchant-conflict',
        params: { newShopId: shop.id, newProductId: product.id, newQty: '1' },
      });
      return;
    }
    showToast('اتضاف للسلة', <Icon.check size={16} color={colors.gold} />);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="خصّص الطلب" onBack={() => safeBack('/product')} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: STICKY_CTA_HEIGHT + 16, paddingTop: 10 }}
      >
        <Text
          style={{
            fontFamily: fonts.arabicBold,
            fontSize: 18,
            color: colors.ink,
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          {product.name}
        </Text>
        <Text
          style={{
            fontFamily: fonts.arabic,
            fontSize: 13,
            color: colors.inkLight,
            marginTop: 4,
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          {product.sub}
        </Text>

        <Text style={section(isRtl)}>
          {PRODUCT_ADDONS.size.label}
          {PRODUCT_ADDONS.size.required ? null : (
            <Text style={{ fontFamily: fonts.arabic, color: colors.inkLight }}> (اختياري)</Text>
          )}
        </Text>
        <View style={{ gap: 8 }}>
          {PRODUCT_ADDONS.size.options.map((o) => (
            <RadioRow
              key={o.id}
              selected={size === o.id}
              onPress={() => setSize(o.id)}
              label={o.name}
              sub={o.price > 0 ? `+${arDigits(o.price)} ج.م` : 'مجاناً'}
            />
          ))}
        </View>

        <Text style={section(isRtl)}>
          {PRODUCT_ADDONS.extras.label}{' '}
          <Text style={{ fontFamily: fonts.arabic, color: colors.inkLight }}>(اختياري)</Text>
        </Text>
        <View style={{ gap: 8 }}>
          {PRODUCT_ADDONS.extras.options.map((o) => (
            <CheckboxRow
              key={o.id}
              checked={extras.includes(o.id)}
              onToggle={() =>
                setExtras((p) => (p.includes(o.id) ? p.filter((x) => x !== o.id) : [...p, o.id]))
              }
              label={o.name}
              trailing={
                <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.olive }}>
                  {o.price > 0 ? `+${arDigits(o.price)} ج.م` : 'مجاناً'}
                </Text>
              }
            />
          ))}
        </View>

        <FieldLabel label={PRODUCT_ADDONS.notes.label} optional style={{ marginTop: 18 }}>
          <TextInput
            multiline
            value={notes}
            onChangeText={setNotes}
            placeholder="مثلاً: من غير ثلج"
            placeholderTextColor={colors.inkMute}
            style={{
              minHeight: 80,
              backgroundColor: colors.bgElevated,
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: colors.canvas300,
              padding: 12,
              fontFamily: fonts.arabic,
              fontSize: 14,
              color: colors.ink,
              lineHeight: 21,
              textAlign: isRtl ? 'right' : 'left',
              textAlignVertical: 'top',
            }}
          />
        </FieldLabel>
      </ScrollView>

      <StickyActionBar>
        <Button
          variant="primary"
          size="lg"
          full
          onPress={onConfirm}
          trailing={
            <Text
              style={{
                fontFamily: fonts.arabicMedium,
                fontSize: 13,
                color: 'rgba(250,248,243,0.75)',
              }}
            >
              · {arDigits(totalPrice)} ج.م
            </Text>
          }
        >
          أضف للسلة
        </Button>
      </StickyActionBar>
    </View>
  );
}

function section(isRtl: boolean) {
  return {
    fontFamily: fonts.arabicSemiBold,
    fontSize: 12,
    color: colors.inkMute,
    letterSpacing: 0.4,
    marginTop: 22,
    marginBottom: 10,
    textAlign: (isRtl ? 'right' : 'left') as 'right' | 'left',
  } as const;
}
