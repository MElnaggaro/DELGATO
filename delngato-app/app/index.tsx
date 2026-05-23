import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { FadeUp, Pop } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useAuthStore } from '@/features/auth/store';
import { useAddressStore } from '@/features/addresses/store';

/**
 * Splash route (`/`). Brand reveal: olive surface, ivory monogram, wordmark
 * stack (Arabic over Latin), then routes onward depending on session:
 *   - no session → onboarding carousel
 *   - session but no address → location permission
 *   - fully set up → home tabs
 *
 * No tagline crowding — the brand book leads with restraint.
 * 1.4s hold matches the design reference timing.
 */
export default function Splash() {
  const router = useRouter();
  const { t } = useTranslation();
  const authed = useAuthStore((s) => s.authed);
  const hasAddresses = useAddressStore((s) => s.list.length > 0);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!authed) router.replace('/(onboarding)/intro');
      else if (!hasAddresses) router.replace('/(onboarding)/location-permission');
      else router.replace('/(tabs)/home');
    }, 1400);
    return () => clearTimeout(id);
  }, [router, authed, hasAddresses]);

  return (
    <View className="flex-1 bg-olive" style={{ backgroundColor: colors.olive }}>
      <View className="flex-1 items-center justify-center" style={{ gap: 20 }}>
        <Pop>
          <View
            className="items-center justify-center"
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              backgroundColor: colors.canvas,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: 64,
                lineHeight: 64,
                color: colors.olive,
              }}
            >
              د
            </Text>
          </View>
        </Pop>

        <FadeUp delay={420} distance={6} style={{ alignItems: 'center', gap: 4 }}>
          <Text
            style={{
              fontFamily: fonts.arabicBold,
              fontSize: 32,
              lineHeight: 36,
              color: colors.canvas,
            }}
          >
            {t('common.appName')}
          </Text>
          <Text
            style={{
              fontFamily: fonts.displayBold,
              fontSize: 13,
              letterSpacing: 3,
              color: 'rgba(250,248,243,0.6)',
            }}
          >
            DELNGATO
          </Text>
        </FadeUp>
      </View>

      <FadeUp delay={760} style={{ paddingBottom: 36, alignItems: 'center' }}>
        <Text
          style={{
            fontFamily: fonts.arabic,
            fontSize: 11,
            color: 'rgba(250,248,243,0.5)',
          }}
        >
          {t('onboarding.footer')}
        </Text>
      </FadeUp>
    </View>
  );
}
