import '../global.css';

import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { I18nextProvider } from 'react-i18next';
import { QueryClientProvider } from '@tanstack/react-query';

import { i18n, initI18n, type SupportedLocale } from '@/services/i18n';
import { applyRtlForLocale, resolveInitialLocale } from '@/services/i18n/rtl';
import { queryClient } from '@/services/api/queryClient';
import { colors } from '@/shared/theme';
import { useAuthStore, wireAuthIntoApiClient } from '@/features/auth/store';
import { useRtl } from '@/shared/hooks/useRtl';

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
      try {
        const resolved = await resolveInitialLocale();
        if (cancelled) return;

        // Arabic-first: lock native RTL before initializing anything that
        // depends on direction (i18n, navigation, gesture handler). If the
        // native flag is wrong, applyRtlForLocale triggers a one-time reload
        // — bail out of the rest of bootstrap so we don't flash LTR layout
        // before the reload lands.
        const reloaded = await applyRtlForLocale(resolved);
        if (reloaded || cancelled) return;

        await initI18n(resolved);
        await hydrateSession();
        setLocale(resolved);
      } catch (e) {
        console.warn('[RootLayout] init error, falling back to defaults:', e);
        await initI18n('ar');
      }
      if (!cancelled) setI18nReady(true);
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
            <RootStack />
          </I18nextProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootStack() {
  const { isRtl } = useRtl();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.canvas,
        },
        animation: isRtl ? 'slide_from_left' : 'slide_from_right',
        animationDuration: 300,
      }}
    />
  );
}

