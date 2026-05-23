import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as LocalAuthentication from 'expo-local-authentication';

import { FadeUp, Pop } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useAuthStore } from '@/features/auth/store';
import { useAddressStore } from '@/features/addresses/store';
import { useSettingsStore } from '@/features/settings';

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
  const hasAuthenticatedBefore = useAuthStore((s) => s.hasAuthenticatedBefore);
  const hasAddresses = useAddressStore((s) => s.list.length > 0);
  const biometricEnabled = useSettingsStore((s) => s.biometricEnabled);
  const hasCompletedOnboarding = useSettingsStore((s) => s.hasCompletedOnboarding);

  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(async () => {
      if (cancelled) return;

      // Probe biometric capability once; used by multiple branches below.
      let biometricSupported = false;
      if (biometricEnabled) {
        try {
          const hw = await LocalAuthentication.hasHardwareAsync();
          const enrolled = await LocalAuthentication.isEnrolledAsync();
          biometricSupported = hw && enrolled;
        } catch {
          biometricSupported = false;
        }
      }
      if (cancelled) return;

      // 1) Authenticated returning user (active session).
      if (authed) {
        if (!hasAddresses) {
          router.replace('/(onboarding)/location-permission');
          return;
        }
        if (biometricEnabled && biometricSupported) {
          router.replace('/(onboarding)/biometric');
          return;
        }
        router.replace('/(tabs)/home');
        return;
      }

      // 2) Returning user with past auth history but currently signed out.
      //    Skip onboarding + welcome — go straight to biometric (if available)
      //    or phone login.
      if (hasAuthenticatedBefore || hasCompletedOnboarding) {
        if (biometricEnabled && biometricSupported) {
          router.replace('/(onboarding)/biometric');
          return;
        }
        router.replace('/(onboarding)/auth');
        return;
      }

      // 3) First-time user — full onboarding.
      router.replace('/(onboarding)/intro');
    }, 1400);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [router, authed, hasAuthenticatedBefore, hasAddresses, biometricEnabled, hasCompletedOnboarding]);

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
