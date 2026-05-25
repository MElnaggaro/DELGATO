import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import {
  AppBar,
  Button,
  Card,
  Icon,
  StickyActionBar,
  STICKY_CTA_HEIGHT,
} from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useCartStore, useCartSubtotal } from '@/features/cart/store';
import { useWallet } from '@/features/wallet/hooks';
import { useAuthStore } from '@/features/auth/store';
import { placeOrderWithWallet } from '@/features/checkout/placeOrder';

const DELIVERY_FEE = 10;

export default function WalletPay() {
  const router = useRouter();
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection } = useRtl();
  const subtotal = useCartSubtotal();
  const tip = useCartStore((s) => s.tip);
  
  const userId = useAuthStore((s) => s.user?.id);
  const wallet = useWallet(userId);
  const walletBalance = wallet?.balance ?? 0;
  const [loading, setLoading] = useState(false);

  const total = subtotal + DELIVERY_FEE + tip;
  const enough = walletBalance >= total;
  const after = walletBalance - total;

  const pay = async () => {
    setLoading(true);
    try {
      // Phase 6.b: placeOrderWithWallet sequences WalletRepository.hold →
      // OrderRepository.place → legacy loyalty mirror (chargeWallet) → return.
      // On failure the hold is released so the customer's balance is intact.
      const result = await placeOrderWithWallet();
      if (!result) {
        setLoading(false);
        return;
      }
      router.replace({ pathname: '/order-success', params: { orderId: result.orderId } });
    } catch (e) {
      setLoading(false);
      if (__DEV__) console.warn('[wallet-pay] failed', e);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="الدفع من المحفظة" onBack={() => safeBack('/checkout')} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingBottom: STICKY_CTA_HEIGHT + 16,
        }}
      >
        <FadeUp>
          <LinearGradient
            colors={[colors.olive, colors.olive700]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              height: 180,
              borderRadius: 16,
              padding: 20,
              overflow: 'hidden',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: -50,
                insetInlineEnd: -30,
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: 'rgba(232,177,79,0.16)',
              }}
            />
            <View
              style={{
                flexDirection,
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.arabicMedium,
                  fontSize: 12,
                  color: 'rgba(250,248,243,0.7)',
                }}
              >
                محفظة دلنجاتُو
              </Text>
              <Icon.wallet size={22} color={colors.canvas} />
            </View>
            <View>
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 36, color: colors.canvas }}>
                {arDigits(walletBalance)}{' '}
                <Text
                  style={{
                    fontFamily: fonts.arabicMedium,
                    fontSize: 16,
                    color: 'rgba(250,248,243,0.7)',
                  }}
                >
                  ج.م
                </Text>
              </Text>
              <Text
                style={{
                  fontFamily: fonts.arabic,
                  fontSize: 11,
                  color: 'rgba(250,248,243,0.6)',
                  marginTop: 4,
                }}
              >
                الرصيد المتاح
              </Text>
            </View>
          </LinearGradient>
        </FadeUp>

        <Card padding={14} style={{ marginTop: 16 }}>
          <Row label="إجمالي الطلب" value={`${arDigits(total)} ج.م`} />
          <Row label="هيتخصم من المحفظة" value={`− ${arDigits(total)} ج.م`} valueColor={colors.olive} bold />
          <View style={{ height: 1, backgroundColor: colors.canvas300, marginVertical: 8 }} />
          <Row label="الرصيد بعد الدفع" value={`${arDigits(Math.max(0, after))} ج.م`} />
        </Card>

        {!enough ? (
          <View
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 10,
              backgroundColor: 'rgba(197,59,44,0.08)',
              flexDirection,
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <Icon.info size={16} color={colors.statusIssueText} />
            <Text
              style={{
                flex: 1,
                fontFamily: fonts.arabicMedium,
                fontSize: 13,
                color: colors.statusIssueText,
                lineHeight: 20,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              الرصيد مش كافي لتغطية الطلب. اشحن المحفظة الأول أو اختار طريقة دفع تانية.
            </Text>
          </View>
        ) : null}

        <View style={{ marginTop: 16 }}>
          <Button
            variant="secondary"
            full
            leading={<Icon.plus size={16} color={colors.olive} />}
            onPress={() => router.push('/wallet')}
          >
            اشحن المحفظة
          </Button>
        </View>
      </ScrollView>

      <StickyActionBar>
        <Button
          variant="primary"
          size="lg"
          full
          disabled={!enough || loading}
          loading={loading}
          onPress={() => {
            void pay();
          }}
        >
          {`ادفع ${arDigits(total)} ج.م`}
        </Button>
      </StickyActionBar>
    </View>
  );
}

function Row({
  label,
  value,
  bold,
  valueColor,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingVertical: 4,
      }}
    >
      <Text
        style={{
          fontFamily: bold ? fonts.arabicBold : fonts.arabicMedium,
          fontSize: bold ? 14 : 13,
          color: colors.inkLight,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: bold ? fonts.arabicBold : fonts.arabicSemiBold,
          fontSize: bold ? 16 : 14,
          color: valueColor ?? colors.ink,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
