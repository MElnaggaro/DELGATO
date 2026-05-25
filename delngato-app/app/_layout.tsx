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

import { i18n, initI18n } from '@/services/i18n';
import { applyRtlForLocale } from '@/services/i18n/rtl';
import { queryClient } from '@/services/api/queryClient';
import { colors } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { ToastHost } from '@/shared/ui/toast';

import {
  ContainerProvider,
} from '@/infrastructure';

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

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const reloaded = await applyRtlForLocale('ar');
        if (reloaded || cancelled) return;
        await initI18n('ar');
        if (!cancelled) setI18nReady(true);
      } catch (e) {
        console.warn('[RootLayout] init error, falling back to defaults:', e);
        await initI18n('ar');
        if (!cancelled) setI18nReady(true);
      }
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
            <ContainerProvider>
              <StatusBar style="light" />
              <RootStack />
            </ContainerProvider>
          </I18nextProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootStack() {
  const { isRtl } = useRtl();
  return (
    <View style={{ flex: 1, direction: isRtl ? 'rtl' : 'ltr' }}>
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
      <ToastHost />
    </View>
  );
}
