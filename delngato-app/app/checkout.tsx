import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  AppBar,
  Button,
  Card,
  Icon,
  IconForward,
  Row,
  Section,
  StickyActionBar,
  STICKY_CTA_HEIGHT,
} from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { safeBack } from '@/shared/utils/nav';
import { useCartStore, useCartSubtotal } from '@/features/cart/store';
import { useSelectedAddress } from '@/features/addresses/store';

type PayKind = 'cash' | 'card' | 'wallet';
type Timing = 'asap' | 'sched';

const DELIVERY_FEE = 10;

export default function Checkout() {
  const { t } = useTranslation();
  const router = useRouter();
  const arDigits = useArabicDigits();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartSubtotal();
  const addr = useSelectedAddress();
  const [pay, setPay] = useState<PayKind>('cash');
  const [timing, setTiming] = useState<Timing>('asap');
  const [placing, setPlacing] = useState(false);
  const total = subtotal + DELIVERY_FEE;

  const placeOrder = () => {
    if (pay === 'card') {
      router.push('/payment');
      return;
    }
    setPlacing(true);
    setTimeout(() => {
      router.replace('/order-success');
    }, 900);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title={t('checkout.title')} onBack={() => safeBack('/cart')} />

      <ScrollView contentContainerStyle={{ paddingBottom: STICKY_CTA_HEIGHT + 16 }}>
        <Section label={t('checkout.addressSection')}>
          <Pressable
            onPress={() => router.push('/addresses')}
            style={({ pressed }) => ({
              backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
              borderRadius: 12,
              padding: 14,
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.canvas300,
            })}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(31,74,61,0.08)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.pin size={18} color={colors.olive} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink }}>
                {addr
                  ? `${addr.label === 'home' ? 'البيت' : addr.label === 'work' ? 'الشغل' : 'العنوان'} · ${addr.street}`
                  : 'اختر عنوان التوصيل'}
              </Text>
              {addr?.detail ? (
                <Text
                  style={{ fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight }}
                >
                  {addr.detail}
                </Text>
              ) : null}
            </View>
            <IconForward size={18} color={colors.inkLight} />
          </Pressable>
        </Section>

        <Section label={t('checkout.timingSection')}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {([
              { k: 'asap', t: t('checkout.timingAsap'), s: '١٥–٢٠ د' },
              { k: 'sched', t: t('checkout.timingSchedule'), s: t('checkout.timingChoose') },
            ] as { k: Timing; t: string; s: string }[]).map((o) => {
              const active = timing === o.k;
              return (
                <Pressable
                  key={o.k}
                  onPress={() => setTiming(o.k)}
                  style={{
                    flex: 1,
                    backgroundColor: active ? colors.olive : colors.bgElevated,
                    borderRadius: 12,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: active ? colors.olive : colors.canvas300,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.arabicSemiBold,
                      fontSize: 14,
                      color: active ? colors.canvas : colors.ink,
                    }}
                  >
                    {o.t}
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.arabic,
                      fontSize: 11,
                      color: active ? 'rgba(250,248,243,0.75)' : colors.inkLight,
                      marginTop: 4,
                    }}
                  >
                    {o.s}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section label={t('checkout.paymentSection')}>
          <View style={{ gap: 8 }}>
            {([
              {
                k: 'cash' as const,
                l: t('checkout.paymentCash'),
                s: t('checkout.paymentCashSub'),
                icon: <Icon.cash size={20} color={pay === 'cash' ? colors.canvas : colors.olive} />,
              },
              {
                k: 'card' as const,
                l: t('checkout.paymentCard'),
                s: t('checkout.paymentCardSub'),
                icon: <Icon.card size={20} color={pay === 'card' ? colors.canvas : colors.olive} />,
              },
              {
                k: 'wallet' as const,
                l: t('checkout.paymentWallet'),
                s: t('checkout.paymentWalletSub'),
                icon: <Icon.wallet size={20} color={colors.olive} />,
                disabled: true,
              },
            ]).map((o) => {
              const active = pay === o.k;
              return (
                <Pressable
                  key={o.k}
                  onPress={() => !o.disabled && setPay(o.k)}
                  disabled={o.disabled}
                  style={{
                    backgroundColor: colors.bgElevated,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: active ? colors.olive : colors.canvas300,
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    opacity: o.disabled ? 0.5 : 1,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: active ? colors.olive : colors.canvas200,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {o.icon}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink }}
                    >
                      {o.l}
                    </Text>
                    <Text
                      style={{ fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight }}
                    >
                      {o.s}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 100,
                      borderWidth: 2,
                      borderColor: active ? colors.olive : colors.canvas300,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {active ? (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 100,
                          backgroundColor: colors.olive,
                        }}
                      />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section label={t('checkout.summarySection')}>
          <Card padding={14}>
            {items.map((it, i) => (
              <View
                key={it.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  borderBottomWidth: i < items.length - 1 ? 1 : 0,
                  borderBottomColor: colors.canvas300,
                }}
              >
                <Text style={{ fontFamily: fonts.arabic, fontSize: 14, color: colors.ink }}>
                  <Text style={{ fontFamily: fonts.arabicBold, color: colors.olive }}>
                    {arDigits(it.qty)}×{' '}
                  </Text>
                  {it.name}
                </Text>
                <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.ink }}>
                  {arDigits(it.qty * it.price)} ج.م
                </Text>
              </View>
            ))}
            <View
              style={{
                marginTop: 8,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: colors.canvas300,
              }}
            >
              <Row label={t('cart.totalItems')} value={`${arDigits(subtotal)} ج.م`} />
              <Row label={t('cart.deliveryFee')} value={`${arDigits(DELIVERY_FEE)} ج.م`} />
              <Row label={t('cart.grandTotal')} value={`${arDigits(total)} ج.م`} bold />
            </View>
          </Card>
        </Section>

        <View
          style={{
            paddingHorizontal: 18,
            paddingTop: 14,
            paddingBottom: 24,
            flexDirection: 'row',
            gap: 10,
          }}
        >
          <Icon.shieldCheck size={16} color={colors.inkLight} />
          <Text
            style={{
              flex: 1,
              fontFamily: fonts.arabic,
              fontSize: 12,
              color: colors.inkLight,
              lineHeight: 18,
            }}
          >
            {t('checkout.secured')}
          </Text>
        </View>
      </ScrollView>

      <StickyActionBar>
        <Button
          variant="primary"
          size="lg"
          full
          disabled={placing}
          loading={placing}
          onPress={placeOrder}
          trailing={
            !placing ? (
              <Text
                style={{
                  fontFamily: fonts.arabicMedium,
                  fontSize: 13,
                  color: 'rgba(250,248,243,0.75)',
                }}
              >
                · {arDigits(total)} ج.م
              </Text>
            ) : null
          }
        >
          {pay === 'card' ? t('checkout.continuePayment') : t('checkout.confirmOrder')}
        </Button>
      </StickyActionBar>
    </View>
  );
}
