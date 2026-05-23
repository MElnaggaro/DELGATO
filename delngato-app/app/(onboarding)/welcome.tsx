import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';

import { Button } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useSettingsStore } from '@/features/settings';

export default function Welcome() {
  const router = useRouter();
  const biometricEnabled = useSettingsStore((s) => s.biometricEnabled);
  const markOnboardingComplete = useSettingsStore((s) => s.markOnboardingComplete);
  const [biometricSupported, setBiometricSupported] = useState(false);

  // Reaching the welcome hub means the user has cleared the intro carousel.
  // Persist that so future launches skip directly to login/biometric.
  useEffect(() => {
    markOnboardingComplete();
  }, [markOnboardingComplete]);

  useEffect(() => {
    (async () => {
      try {
        const hw = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setBiometricSupported(hw && enrolled);
      } catch {
        setBiometricSupported(false);
      }
    })();
  }, []);

  const showBiometric = biometricEnabled && biometricSupported;

  return (
    <View style={{ flex: 1, backgroundColor: colors.olive }}>
      <View
        style={{
          flex: 1,
          padding: 28,
          paddingTop: 40,
          paddingBottom: 28,
        }}
      >
        <FadeUp style={{ marginTop: 12 }}>
          <View
            style={{
              width: 68,
              height: 68,
              backgroundColor: colors.canvas,
              borderRadius: 15,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: 46,
                lineHeight: 46,
                color: colors.olive,
              }}
            >
              د
            </Text>
          </View>
        </FadeUp>

        <FadeUp delay={120} style={{ marginTop: 32 }}>
          <Text
            style={{
              fontFamily: fonts.arabicBold,
              fontSize: 34,
              lineHeight: 39,
              color: colors.canvas,
            }}
          >
            {'أهلاً بيك في\nدلنجاتُو'}
          </Text>
          <Text
            style={{
              fontFamily: fonts.arabic,
              fontSize: 15,
              lineHeight: 24,
              color: 'rgba(250,248,243,0.78)',
              marginTop: 14,
              maxWidth: 280,
            }}
          >
            محلات الدلنجات كلها في تطبيق واحد. ابدأ بحساب جديد أو ادخل لو عندك حساب قبل كده.
          </Text>
        </FadeUp>

        <View style={{ flex: 1 }} />

        <FadeUp delay={320} style={{ gap: 10 }}>
          <Pressable
            onPress={() => router.push('/(onboarding)/register')}
            style={({ pressed }) => ({
              backgroundColor: pressed ? 'rgba(250,248,243,0.92)' : colors.canvas,
              borderRadius: 12,
              minHeight: 56,
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <Text
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: 17,
                color: colors.olive,
              }}
            >
              أنشئ حساب جديد
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(onboarding)/auth')}
            style={({ pressed }) => ({
              backgroundColor: pressed ? 'rgba(250,248,243,0.06)' : 'transparent',
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: 'rgba(250,248,243,0.4)',
              minHeight: 56,
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <Text
              style={{
                fontFamily: fonts.arabicSemiBold,
                fontSize: 16,
                color: colors.canvas,
              }}
            >
              عندي حساب · تسجيل الدخول
            </Text>
          </Pressable>

          {showBiometric ? (
            <Pressable
              onPress={() => router.push('/(onboarding)/biometric')}
              style={{ marginTop: 6, paddingVertical: 8 }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontFamily: fonts.arabic,
                  fontSize: 13,
                  color: 'rgba(250,248,243,0.7)',
                }}
              >
                دخول سريع بالبصمة
              </Text>
            </Pressable>
          ) : null}
        </FadeUp>
      </View>
    </View>
  );
}
