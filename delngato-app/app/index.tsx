import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { FadeUp, Pop } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';

export default function Splash() {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(onboarding)/welcome');
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

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
