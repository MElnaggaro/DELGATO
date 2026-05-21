import { useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button, Icon } from '@/shared/ui';
import { FadeUp, Pop } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useCartStore } from '@/features/cart/store';
import { useOrdersStore } from '@/features/orders/store';

const NEW_ORDER_ID = 'DLN-٢٠٤٧';

export default function OrderSuccess() {
  const router = useRouter();
  const { t } = useTranslation();
  const clearCart = useCartStore((s) => s.clear);
  const addOrder = useOrdersStore((s) => s.addOrder);

  useEffect(() => {
    clearCart();
    addOrder({
      id: NEW_ORDER_ID,
      shop: 'سوبر ماركت أبو حسن',
      shopLetter: 'أ',
      status: 'live',
      statusText: 'يتم التحضير',
      date: 'دلوقتي',
      total: 187,
      items: 3,
      step: 1,
    });
  }, [addOrder, clearCart]);

  const orderId = useMemo(() => NEW_ORDER_ID, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, padding: 28 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22 }}>
          <Pop duration={420}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: colors.olive,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: colors.olive,
                shadowOpacity: 0.28,
                shadowOffset: { width: 0, height: 12 },
                shadowRadius: 24,
                elevation: 8,
              }}
            >
              <Icon.check size={48} color={colors.canvas} strokeWidth={3} />
            </View>
          </Pop>
          <FadeUp delay={300} style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: 26,
                color: colors.ink,
                textAlign: 'center',
              }}
            >
              {t('success.title')}
            </Text>
            <Text
              style={{
                fontFamily: fonts.arabic,
                fontSize: 14,
                color: colors.inkLight,
                textAlign: 'center',
                lineHeight: 24,
                marginTop: 8,
                maxWidth: 320,
              }}
            >
              {t('success.sub')}
            </Text>
          </FadeUp>
          <FadeUp
            delay={460}
            style={{
              backgroundColor: colors.canvas200,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Icon.receipt size={18} color={colors.ink} />
            <Text style={{ fontFamily: fonts.arabic, fontSize: 13, color: colors.ink }}>
              {t('success.orderId')}
            </Text>
            <Text style={{ fontFamily: fonts.arabicBold, fontSize: 14, color: colors.olive }}>
              {orderId}
            </Text>
          </FadeUp>
          <FadeUp
            delay={620}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <Icon.clock size={16} color={colors.inkLight} />
            <Text style={{ fontFamily: fonts.arabic, fontSize: 13, color: colors.inkLight }}>
              {t('success.etaPrefix')}{' '}
              <Text style={{ fontFamily: fonts.arabicSemiBold, color: colors.ink }}>
                {t('success.etaSuffix')}
              </Text>
            </Text>
          </FadeUp>
        </View>

        <View style={{ gap: 10 }}>
          <Button
            variant="primary"
            size="lg"
            full
            onPress={() => router.replace({ pathname: '/tracking', params: { orderId } })}
          >
            {t('success.trackOrder')}
          </Button>
          <Button variant="ghost" full onPress={() => router.replace('/(tabs)/home')}>
            {t('success.backHome')}
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}
