import '../global.css';

import { useEffect, useState } from 'react';
import { I18nManager, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { I18nextProvider } from 'react-i18next';
import { QueryClientProvider } from '@tanstack/react-query';

import { i18n, initI18n, type SupportedLocale } from '@/services/i18n';
import { resolveInitialLocale } from '@/services/i18n/rtl';
import { queryClient } from '@/services/api/queryClient';
import { colors } from '@/shared/theme';
import { useAuthStore, wireAuthIntoApiClient } from '@/features/auth/store';

wireAuthIntoApiClient();

// Hold the native splash until fonts AND i18n are resolved — the bridge
// between the native olive splash and the JS splash should be invisible.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'IBMPlexSansArabic-Thin': require('../assets/fonts/IBMPlexSansArabic-Thin.ttf'),
    'IBMPlexSansArabic-ExtraLight': require('../assets/fonts/IBMPlexSansArabic-ExtraLight.ttf'),
    'IBMPlexSansArabic-Light': require('../assets/fonts/IBMPlexSansArabic-Light.ttf'),
    'IBMPlexSansArabic-Regular': require('../assets/fonts/IBMPlexSansArabic-Regular.ttf'),
    'IBMPlexSansArabic-Medium': require('../assets/fonts/IBMPlexSansArabic-Medium.ttf'),
    'IBMPlexSansArabic-SemiBold': require('../assets/fonts/IBMPlexSansArabic-SemiBold.ttf'),
    'IBMPlexSansArabic-Bold': require('../assets/fonts/IBMPlexSansArabic-Bold.ttf'),
    'Tienne-Regular': require('../assets/fonts/Tienne-Regular.ttf'),
    'Tienne-Bold': require('../assets/fonts/Tienne-Bold.ttf'),
    'Tienne-Black': require('../assets/fonts/Tienne-Black.ttf'),
  });

  const [i18nReady, setI18nReady] = useState(false);
  const [, setLocale] = useState<SupportedLocale>('ar');
  const hydrateSession = useAuthStore((s) => s.hydrateSession);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const resolved = await resolveInitialLocale();
      if (cancelled) return;
      initI18n(resolved);
      await hydrateSession();
      // Note: applying RTL via I18nManager.forceRTL would trigger a reload.
      // On a cold boot, the native layer already matches the persisted locale
      // (Expo respects the OS direction). The Settings > Language screen is
      // the one place we ever call applyRtlForLocale.
      if (resolved === 'ar' && !I18nManager.isRTL) {
        // Best-effort: allow RTL for any newly-installed app; the real lock
        // happens on the next launch through native config.
        I18nManager.allowRTL(true);
      }
      setLocale(resolved);
      setI18nReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && i18nReady) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, i18nReady]);

  if ((!fontsLoaded && !fontError) || !i18nReady) {
    return <View style={{ flex: 1, backgroundColor: colors.olive }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.canvas },
                animation: 'slide_from_right',
                animationDuration: 300,
              }}
            />
          </I18nextProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
