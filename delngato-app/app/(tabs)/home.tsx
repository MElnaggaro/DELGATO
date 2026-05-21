import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Badge, Icon } from '@/shared/ui';
import { FadeUp, Rise } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useSelectedAddress } from '@/features/addresses/store';

/**
 * Placeholder home screen for the M2 deliverable. M3 replaces this with the
 * full catalog read path: address bar, search, categories, offer hero, shop
 * list with pull-to-refresh, active-order banner.
 */
export default function Home() {
  const { t } = useTranslation();
  const addr = useSelectedAddress();

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView edges={['top']}>
        <FadeUp
          style={{
            paddingHorizontal: 18,
            paddingTop: 14,
            paddingBottom: 6,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text
              style={{ fontFamily: fonts.arabicMedium, fontSize: 11, color: colors.inkMute }}
            >
              {t('home.deliveryTo')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon.pin size={16} color={colors.olive} />
              <Text
                style={{
                  fontFamily: fonts.arabicSemiBold,
                  fontSize: 15,
                  color: colors.ink,
                }}
              >
                {addr ? `${addr.street} · ${addr.detail}` : t('home.deliveryTo')}
              </Text>
            </View>
          </View>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 100,
              backgroundColor: colors.canvas200,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.bell size={20} color={colors.ink} />
          </View>
        </FadeUp>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Rise delay={120} style={{ paddingHorizontal: 18, paddingVertical: 14 }}>
          <View
            style={{
              backgroundColor: colors.olive,
              borderRadius: 14,
              padding: 18,
              gap: 8,
            }}
          >
            <Badge variant="solid-gold">{t('home.offerToday')}</Badge>
            <Text
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: 20,
                color: colors.canvas,
                lineHeight: 26,
              }}
            >
              {t('home.offerTitle')}
            </Text>
            <Text
              style={{
                fontFamily: fonts.arabic,
                fontSize: 12,
                color: 'rgba(250,248,243,0.7)',
              }}
            >
              {t('home.offerCode')}{' '}
              <Text style={{ fontFamily: fonts.arabicBold, color: colors.gold }}>DLN10</Text>
            </Text>
          </View>
        </Rise>

        <Rise
          delay={180}
          style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 14 }}
        >
          <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 18, color: colors.ink }}>
            {t('home.nearbyShops')}
          </Text>
          <Text
            style={{
              fontFamily: fonts.arabic,
              fontSize: 13,
              color: colors.inkLight,
              marginTop: 8,
              lineHeight: 20,
            }}
          >
            (M3 placeholder — full catalog list lands in the next milestone.)
          </Text>
        </Rise>
      </ScrollView>
    </View>
  );
}
