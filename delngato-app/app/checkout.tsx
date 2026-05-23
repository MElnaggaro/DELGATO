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
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useCartStore, useCartSubtotal } from '@/features/cart/store';
import { useSelectedAddress } from '@/features/addresses/store';
import { useLoyaltyStore } from '@/features/loyalty/store';

type PayKind = 'cash' | 'card' | 'wallet';
type Timing = 'asap' | 'sched';

const DELIVERY_FEE = 10;

export default function Checkout() {
  const { t } = useTranslation();
  const router = useRouter();
  const { alignStart } = useRtl();
  const arDigits = useArabicDigits();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartSubtotal();
  const addr = useSelectedAddress();
  const appliedPromo = useCartStore((s) => s.appliedPromo);
  const tip = useCartStore((s) => s.tip);
  const scheduled = useCartStore((s) => s.scheduled);
  const deliveryNote = useCartStore((s) => s.deliveryNote);
  const setAppliedPromo = useCartStore((s) => s.setAppliedPromo);
  const walletBalance = useLoyaltyStore((s) => s.walletBalance);
  const [pay, setPay] = useState<PayKind>('cash');
  const [timing, setTiming] = useState<Timing>(scheduled ? 'sched' : 'asap');
  const [placing, setPlacing] = useState(false);
  const total = subtotal + DELIVERY_FEE + tip;

  const placeOrder = () => {
    if (pay === 'card') {
      router.push('/payment');
      return;
    }
    if (pay === 'wallet') {
      router.push('/wallet-pay');
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
          <Pressable onPress={() => router.push('/addresses')}>
            {({ pressed }) => (
              <View
                style={{
                  backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
                  borderRadius: 12,
                  padding: 14,
                  flexDirection: 'row',
                  gap: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.canvas300,
                }}
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
          </View>
          )}
          </Pressable>
        </Section>

        <Section label={t('checkout.timingSection')}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {([
              { k: 'asap', t: t('checkout.timingAsap'), s: '١٥–٢٠ د' },
              { k: 'sched', t: t('checkout.timingSchedule'), s: scheduled?.slot ?? t('checkout.timingChoose') },
            ] as { k: Timing; t: string; s: string }[]).map((o) => {
              const active = timing === o.k;
              return (
                <Pressable
                  key={o.k}
                  onPress={() => {
                    setTiming(o.k);
                    if (o.k === 'sched') router.push('/scheduled-delivery');
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: active ? colors.olive : colors.bgElevated,
                    borderRadius: 12,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    borderWidth: active ? 0 : 1,
                    borderColor: active ? 'transparent' : colors.canvas300,
                    alignItems: alignStart,
                    gap: 4,
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

        {/* Delivery note row */}
        <Section label="ملاحظة للكابتن">
          <LinkRow
            icon={<Icon.message size={18} color={colors.olive} />}
            title={deliveryNote || 'ضيف ملاحظة للكابتن'}
            sub={deliveryNote ? 'اضغط للتعديل' : 'مثلاً: اتصل قبل ما توصل'}
            onPress={() => router.push('/delivery-notes')}
          />
        </Section>

        {/* Promo row */}
        <Section label="كود الخصم">
          <LinkRow
            iconBg="rgba(232,177,79,0.18)"
            icon={<Icon.tag size={18} color={colors.statusPendingText} />}
            title={
              appliedPromo
                ? `${appliedPromo.title} · ${appliedPromo.value}`
                : 'عندك كود خصم؟'
            }
            titleColor={appliedPromo ? colors.olive : colors.ink}
            sub={appliedPromo ? `كود ${appliedPromo.code}` : 'اضغط للإضافة'}
            trailing={
              appliedPromo ? (
                <Pressable onPress={() => setAppliedPromo(null)} hitSlop={8}>
                  <Icon.x size={16} color={colors.inkMute} />
                </Pressable>
              ) : null
            }
            onPress={() => router.push('/promo-code')}
          />
        </Section>

        {/* Tip row */}
        <Section label="إكرامية الكابتن">
          <LinkRow
            icon={<Icon.heart size={18} color={colors.olive} />}
            title={tip > 0 ? `${arDigits(tip)} ج.م إكرامية` : 'بلاش إكرامية'}
            sub={tip > 0 ? 'هتروح للكابتن ١٠٠٪' : 'الإكرامية اختيارية وبتروح للكابتن'}
            onPress={() => router.push('/tip-driver')}
          />
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
                l: `محفظة دلنجاتُو · ${arDigits(walletBalance)} ج.م`,
                s: 'كاش باك ١٠٪',
                icon: <Icon.wallet size={20} color={pay === 'wallet' ? colors.canvas : colors.olive} />,
                disabled: false,
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
              {tip > 0 ? <Row label="إكرامية الكابتن" value={`${arDigits(tip)} ج.م`} /> : null}
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

function LinkRow({
  icon,
  iconBg,
  title,
  titleColor,
  sub,
  trailing,
  onPress,
}: {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  titleColor?: string;
  sub?: string;
  trailing?: React.ReactNode;
  onPress: () => void;
}) {
  const { textStart } = useRtl();
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderWidth: 1,
            borderColor: colors.canvas300,
          }}
        >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: iconBg ?? 'rgba(31,74,61,0.08)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: fonts.arabicSemiBold,
            fontSize: 13.5,
            color: titleColor ?? colors.ink,
            textAlign: textStart,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {sub ? (
          <Text
            style={{
              fontFamily: fonts.arabic,
              fontSize: 11,
              color: colors.inkLight,
              marginTop: 2,
              textAlign: textStart,
            }}
            numberOfLines={1}
          >
            {sub}
          </Text>
        ) : null}
      </View>
      {trailing ?? <IconForward size={18} color={colors.inkLight} />}
        </View>
      )}
    </Pressable>
  );
}
