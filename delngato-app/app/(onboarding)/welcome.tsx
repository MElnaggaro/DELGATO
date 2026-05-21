import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/shared/ui';
import { FadeUp, Pop } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';

const SLIDE_COUNT = 3;
const SLIDE_LETTERS = ['د', 'ل', 'ن'] as const;
const SLIDE_GRADIENT = colors.olive;

export default function Welcome() {
  const router = useRouter();
  const { t } = useTranslation();
  const [i, setI] = useState(0);

  const next = () => {
    if (i < SLIDE_COUNT - 1) setI(i + 1);
    else router.push('/(onboarding)/auth');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* Hero panel */}
      <View
        key={`hero-${i}`}
        style={{
          flex: 0.56,
          backgroundColor: SLIDE_GRADIENT,
          overflow: 'hidden',
          position: 'relative',
          justifyContent: 'flex-end',
          padding: 28,
        }}
      >
        {/* Skip — top-start in RTL */}
        <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, insetInlineStart: 0, padding: 24 }}>
          <Pressable onPress={() => router.push('/(onboarding)/auth')} hitSlop={8}>
            <Text
              style={{
                fontFamily: fonts.arabicMedium,
                color: 'rgba(250,248,243,0.8)',
                fontSize: 14,
              }}
            >
              {t('onboarding.skip')}
            </Text>
          </Pressable>
        </SafeAreaView>

        {/* Decorative letter */}
        <Pop
          key={`letter-${i}`}
          style={{ position: 'absolute', insetInlineEnd: -30, top: 60 }}
          duration={420}
        >
          <Text
            style={{
              fontFamily: fonts.arabicBold,
              fontSize: 320,
              lineHeight: 272,
              color: 'rgba(250,248,243,0.08)',
            }}
          >
            {SLIDE_LETTERS[i]}
          </Text>
        </Pop>
      </View>

      {/* Lower content */}
      <View
        style={{
          flex: 1,
          padding: 28,
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        <FadeUp key={`text-${i}`} distance={6}>
          <Text
            style={{
              fontFamily: fonts.arabicBold,
              fontSize: 28,
              lineHeight: 34,
              color: colors.ink,
            }}
          >
            {t(`onboarding.slides.${i}.title`)}
          </Text>
          <Text
            style={{
              fontFamily: fonts.arabic,
              fontSize: 15,
              lineHeight: 23,
              color: colors.inkLight,
              marginTop: 10,
            }}
          >
            {t(`onboarding.slides.${i}.sub`)}
          </Text>
        </FadeUp>

        <View style={{ gap: 18 }}>
          {/* Dots */}
          <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
            {Array.from({ length: SLIDE_COUNT }).map((_, k) => (
              <Pressable
                key={k}
                onPress={() => setI(k)}
                style={{
                  width: k === i ? 24 : 8,
                  height: 8,
                  borderRadius: 100,
                  backgroundColor: k === i ? colors.olive : colors.canvas300,
                }}
              />
            ))}
          </View>

          <Button variant="primary" size="lg" full onPress={next}>
            {i < SLIDE_COUNT - 1 ? t('onboarding.next') : t('onboarding.start')}
          </Button>

          <Pressable onPress={() => router.push('/(onboarding)/auth')}>
            <Text
              style={{
                textAlign: 'center',
                fontFamily: fonts.arabic,
                fontSize: 13,
                color: colors.inkLight,
              }}
            >
              {t('onboarding.haveAccount')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
