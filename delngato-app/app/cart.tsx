import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppBar, Badge, Button, Card, EmptyState, Icon, Row, Stepper } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { safeBack } from '@/shared/utils/nav';
import { useCartStore, useCartSubtotal } from '@/features/cart/store';

const DELIVERY_FEE = 10;

export default function Cart() {
  const { t } = useTranslation();
  const router = useRouter();
  const arDigits = useArabicDigits();
  const items = useCartStore((s) => s.items);
  const setItemQty = useCartStore((s) => s.setItemQty);
  const subtotal = useCartSubtotal();
  const [confirm, setConfirm] = useState<{ id: string; name: string } | null>(null);

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas }}>
        <AppBar title={t('cart.title')} onBack={() => safeBack('/(tabs)/home')} />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            icon={<Icon.bag size={28} color={colors.olive} />}
            title={t('cart.emptyTitle')}
            body={t('cart.emptyBody')}
            action={
              <Button variant="primary" onPress={() => router.replace('/(tabs)/home')}>
                {t('cart.emptyAction')}
              </Button>
            }
          />
        </View>
      </View>
    );
  }

  const shopName = items[0]?.shop ?? '';
  const total = subtotal + DELIVERY_FEE;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title={t('cart.title')} onBack={() => safeBack('/(tabs)/home')} />
      <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
        {/* Shop strip */}
        <View style={{ paddingHorizontal: 18, paddingBottom: 14 }}>
          <View
            style={{
              backgroundColor: colors.canvas200,
              borderRadius: 12,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 100,
                backgroundColor: colors.olive,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 18, color: colors.canvas }}>
                {shopName[0] ?? 'م'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.arabic, fontSize: 11, color: colors.inkLight }}>
                {t('cart.fromShop')}
              </Text>
              <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink }}>
                {shopName}
              </Text>
            </View>
            <Badge variant="active">{'١٥–٢٠ د'}</Badge>
          </View>
        </View>

        {/* Items */}
        <View style={{ paddingHorizontal: 18, gap: 10 }}>
          {items.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: colors.bgElevated,
                borderRadius: 12,
                padding: 10,
                borderWidth: 1,
                borderColor: colors.canvas300,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  backgroundColor: item.hue,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.arabicBold,
                    fontSize: 32,
                    color: 'rgba(15,26,23,0.18)',
                  }}
                >
                  {item.name[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink }}>
                  {item.name}
                </Text>
                <Text style={{ fontFamily: fonts.arabic, fontSize: 11, color: colors.inkLight }}>
                  {item.sub}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                  <Text style={{ fontFamily: fonts.arabicBold, fontSize: 13, color: colors.olive }}>
                    {arDigits(item.qty * item.price)}
                  </Text>
                  <Text
                    style={{ fontFamily: fonts.arabicMedium, fontSize: 11, color: colors.inkLight }}
                  >
                    ج.م
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Stepper
                  compact
                  value={item.qty}
                  min={0}
                  onChange={(n) => {
                    if (n === 0) setConfirm({ id: item.id, name: item.name });
                    else setItemQty(item.id, n);
                  }}
                />
                <Pressable
                  onPress={() => setConfirm({ id: item.id, name: item.name })}
                  hitSlop={6}
                  accessibilityLabel="حذف"
                  style={{ padding: 4 }}
                >
                  <Icon.trash size={16} color={colors.inkMute} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* Add more */}
        <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
          <Pressable
            onPress={() => safeBack('/(tabs)/home')}
            style={({ pressed }) => ({
              borderRadius: 12,
              padding: 14,
              backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
              borderWidth: 1.5,
              borderColor: colors.canvas300,
              borderStyle: 'dashed',
              flexDirection: 'row',
              gap: 8,
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <Icon.plus size={18} color={colors.olive} />
            <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.olive }}>
              {t('cart.addMore', { shop: shopName })}
            </Text>
          </Pressable>
        </View>

        {/* Promo */}
        <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
          <Card padding={14}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
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
                <Icon.tag size={18} color={colors.statusPendingText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.ink }}
                >
                  {t('cart.promoTitle')}
                </Text>
                <Text
                  style={{ fontFamily: fonts.arabic, fontSize: 11, color: colors.inkLight }}
                >
                  {t('cart.promoSub')}
                </Text>
              </View>
              <Pressable>
                <Text
                  style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.olive }}
                >
                  {t('cart.promoAdd')}
                </Text>
              </Pressable>
            </View>
          </Card>
        </View>

        {/* Totals */}
        <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 20 }}>
          <Card padding={14}>
            <Row label={t('cart.totalItems')} value={`${arDigits(subtotal)} ج.م`} />
            <Row label={t('cart.deliveryFee')} value={`${arDigits(DELIVERY_FEE)} ج.م`} />
            <View style={{ height: 1, backgroundColor: colors.canvas300, marginVertical: 10 }} />
            <Row label={t('cart.grandTotal')} value={`${arDigits(total)} ج.م`} bold />
          </Card>
        </View>
      </ScrollView>

      <SafeAreaView
        edges={['bottom']}
        style={{
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 12,
          backgroundColor: colors.canvas,
          borderTopWidth: 1,
          borderTopColor: colors.canvas300,
        }}
      >
        <Button
          variant="primary"
          size="lg"
          full
          onPress={() => router.push('/checkout')}
          trailing={
            <Text
              style={{
                fontFamily: fonts.arabicMedium,
                fontSize: 13,
                color: 'rgba(250,248,243,0.75)',
              }}
            >
              · {arDigits(total)} ج.م
            </Text>
          }
        >
          {t('cart.checkout')}
        </Button>
      </SafeAreaView>

      <Modal transparent visible={!!confirm} animationType="fade">
        <Pressable
          onPress={() => setConfirm(null)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(15,26,23,0.48)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.canvas,
              borderRadius: 16,
              padding: 20,
              width: '100%',
              maxWidth: 320,
            }}
          >
            <Text style={{ fontFamily: fonts.arabicBold, fontSize: 17, color: colors.ink }}>
              {t('cart.removeTitle')}
            </Text>
            <Text
              style={{
                fontFamily: fonts.arabic,
                fontSize: 14,
                color: colors.inkLight,
                marginTop: 8,
                lineHeight: 22,
              }}
            >
              {t('cart.removeBody', { name: confirm?.name })}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
              <View style={{ flex: 1 }}>
                <Button variant="tertiary" full onPress={() => setConfirm(null)}>
                  {t('cart.removeCancel')}
                </Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  variant="primary"
                  full
                  style={{ backgroundColor: colors.statusIssue, borderColor: colors.statusIssue }}
                  onPress={() => {
                    if (confirm) setItemQty(confirm.id, 0);
                    setConfirm(null);
                  }}
                >
                  {t('cart.removeConfirm')}
                </Button>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
