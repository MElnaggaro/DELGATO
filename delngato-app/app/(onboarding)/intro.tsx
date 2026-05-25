import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Icon } from '@/shared/ui';
import { FadeUp, Pop } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useSettingsStore } from '@/features/settings';

const SLIDE_COUNT = 3;
const SLIDE_LETTERS = ['د', 'ل', 'ن'] as const;
const SLIDE_ICONS = ['store', 'bike', 'wallet'] as const;
// Per-slide diagonal gradients (matches design-reference Onboarding.jsx slides[].bg).
const SLIDE_GRADIENTS: [string, string][] = [
  ['#1F4A3D', '#173629'],
  ['#2C5C4B', '#1F4A3D'],
  ['#3C6B4F', '#234731'],
];

export default function Intro() {
  const router = useRouter();
  const { t } = useTranslation();
  const [i, setI] = useState(0);
  const markIntroSeen = useSettingsStore((s) => s.markIntroSeen);

  // Single completion path used by Skip + Start. Persists `hasSeenIntro`,
  // dispatches the canonical event into AppStateMachine, and (for v2-off)
  // navigates to welcome directly. When v2 is on, RouteGuard re-resolves
  // UNAUTHENTICATED → /(onboarding)/welcome and the redundant nav is a no-op
  // because the pathname already matches.
  const completeIntro = () => {
    markIntroSeen();
    router.replace('/(onboarding)/welcome');
  };

  const next = () => {
    if (i < SLIDE_COUNT - 1) setI(i + 1);
    else completeIntro();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* Hero panel — diagonal gradient that shifts per slide */}
      <LinearGradient
        key={`hero-${i}`}
        colors={SLIDE_GRADIENTS[i] ?? SLIDE_GRADIENTS[0]!}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 0.56,
          overflow: 'hidden',
          position: 'relative',
          justifyContent: 'flex-end',
          padding: 28,
        }}
      >
        {/* Skip — top-start in RTL */}
        <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, insetInlineStart: 0, padding: 24 }}>
          <Pressable onPress={completeIntro} hitSlop={8}>
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

        {/* Translucent icon chip — store/bike/wallet for slide 0/1/2 */}
        <View
          style={{
            position: 'absolute',
            insetInlineEnd: 36,
            top: 110,
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: 'rgba(250,248,243,0.12)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {SLIDE_ICONS[i] === 'store' ? (
            <Icon.store size={28} color={colors.canvas} />
          ) : SLIDE_ICONS[i] === 'bike' ? (
            <Icon.bike size={28} color={colors.canvas} />
          ) : (
            <Icon.wallet size={28} color={colors.canvas} />
          )}
        </View>
      </LinearGradient>

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

          <Pressable onPress={() => router.push('/(auth)/role?type=login')}>
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
