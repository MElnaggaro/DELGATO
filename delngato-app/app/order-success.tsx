import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button, Icon } from '@/shared/ui';
import { FadeUp, Pop } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';

/**
 * Order success screen.
 *
 * Phase 6: this screen is now stateless. The order was committed by
 * `placeOrder()` (checkout / payment / wallet-pay), which generated the
 * `orderId`, wrote the order to the feature store, and cleared the cart.
 * Here we just render the confirmation and forward `orderId` to tracking.
 *
 * If the route is opened without an `orderId` (e.g. deep link, dev menu),
 * we surface a placeholder rather than fabricating one — the canonical
 * spec § 7.8 forbids the previous "stateless on its own, side-effects in
 * useEffect" pattern.
 */
export default function OrderSuccess() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const orderId = params.orderId ?? '—';

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
