import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import * as LocalAuthentication from 'expo-local-authentication';

import { AppBar, SuccessRing } from '@/shared/ui';
import { FadeUp, Pulse } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';
import { useAuthStore } from '@/features/auth/store';
import { useSettingsStore } from '@/features/settings';

type ScanState = 'idle' | 'scanning' | 'success' | 'fail';

export default function Biometric() {
  const router = useRouter();
  const [state, setState] = useState<ScanState>('idle');
  const [supported, setSupported] = useState<boolean | null>(null);
  const hydrate = useAuthStore((s) => s.hydrateSession);
  const biometricEnabled = useSettingsStore((s) => s.biometricEnabled);
  const gateChecked = useRef(false);

  // Settings gate — bounce to phone login if user hasn't enabled biometric.
  useEffect(() => {
    if (gateChecked.current) return;
    gateChecked.current = true;
    if (!biometricEnabled) {
      router.replace('/(onboarding)/auth');
    }
  }, [biometricEnabled, router]);

  // Capability detection.
  useEffect(() => {
    (async () => {
      try {
        const hw = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setSupported(hw && enrolled);
      } catch {
        setSupported(false);
      }
    })();
  }, []);

  const onScan = async () => {
    if (state === 'scanning' || state === 'success') return;
    if (supported === false) return;
    setState('scanning');
    try {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'دخول إلى دلنجاتُو',
        cancelLabel: 'إلغاء',
        disableDeviceFallback: false,
      });
      if (res.success) {
        setState('success');
        setTimeout(async () => {
          await hydrate();
          router.replace('/(tabs)/home');
        }, 700);
      } else if (res.error === 'user_cancel' || res.error === 'system_cancel' || res.error === 'app_cancel') {
        setState('idle');
      } else {
        setState('fail');
      }
    } catch {
      setState('fail');
    }
  };

  const unsupported = supported === false;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar onBack={() => safeBack('/(onboarding)/welcome')} />

      <View style={{ flex: 1, paddingHorizontal: 28, paddingBottom: 32 }}>
        <FadeUp>
          <Text
            style={{
              fontFamily: fonts.arabicBold,
              fontSize: 26,
              color: colors.ink,
              textAlign: 'center',
            }}
          >
            دخول سريع
          </Text>
          <Text
            style={{
              fontFamily: fonts.arabic,
              fontSize: 14,
              color: colors.inkLight,
              marginTop: 8,
              lineHeight: 22,
              textAlign: 'center',
            }}
          >
            {unsupported
              ? 'الجهاز ده مش بيدعم الدخول بالبصمة. سجل برقم التليفون.'
              : 'استخدم بصمة الإصبع أو الوش لدخول حسابك في ثواني.'}
          </Text>
        </FadeUp>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Pressable
            onPress={onScan}
            disabled={state === 'scanning' || state === 'success' || unsupported}
            style={{
              width: 200,
              height: 200,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: unsupported ? 0.4 : 1,
            }}
          >
            {state === 'scanning' ? (
              <View style={{ position: 'absolute', inset: 0 }}>
                <Pulse
                  active
                  duration={1600}
                  delay={0}
                  style={{
                    position: 'absolute',
                    width: 200,
                    height: 200,
                    borderRadius: 100,
                    borderWidth: 2,
                    borderColor: colors.olive,
                  }}
                />
                <Pulse
                  active
                  duration={1600}
                  delay={200}
                  style={{
                    position: 'absolute',
                    top: -20,
                    left: -20,
                    width: 240,
                    height: 240,
                    borderRadius: 120,
                    borderWidth: 2,
                    borderColor: colors.olive,
                    opacity: 0.7,
                  }}
                />
                <Pulse
                  active
                  duration={1600}
                  delay={400}
                  style={{
                    position: 'absolute',
                    top: -40,
                    left: -40,
                    width: 280,
                    height: 280,
                    borderRadius: 140,
                    borderWidth: 2,
                    borderColor: colors.olive,
                    opacity: 0.5,
                  }}
                />
              </View>
            ) : null}
            {state === 'success' ? (
              <SuccessRing size={140} checkSize={72} />
            ) : (
              <View
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 100,
                  backgroundColor: state === 'fail' ? colors.statusIssue : colors.olive,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Svg width={60} height={60} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M2 12C2 6.5 6.5 2 12 2c5.5 0 10 4.5 10 10"
                    stroke={colors.canvas}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                  <Path
                    d="M5 12a7 7 0 0 1 14 0v3"
                    stroke={colors.canvas}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                  <Path
                    d="M8 12a4 4 0 0 1 8 0v4a2 2 0 0 1-2 2"
                    stroke={colors.canvas}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                  <Path
                    d="M12 12v5"
                    stroke={colors.canvas}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </Svg>
              </View>
            )}
          </Pressable>
        </View>

        <View style={{ alignItems: 'center', marginBottom: 14 }}>
          <Text
            style={{
              fontFamily: fonts.arabicSemiBold,
              fontSize: 16,
              color: state === 'fail' ? colors.statusIssueText : colors.ink,
              textAlign: 'center',
            }}
          >
            {unsupported
              ? 'البصمة غير متاحة'
              : state === 'idle'
                ? 'ضع إصبعك على المستشعر'
                : state === 'scanning'
                  ? 'جاري التحقق…'
                  : state === 'success'
                    ? 'أهلاً بيك تاني'
                    : 'مش هي البصمة. جرب تاني.'}
          </Text>
          <Text
            style={{
              fontFamily: fonts.arabic,
              fontSize: 13,
              color: colors.inkLight,
              marginTop: 6,
              textAlign: 'center',
            }}
          >
            {unsupported
              ? 'فعّل البصمة من إعدادات الجهاز أو سجل برقم التليفون.'
              : state === 'idle' || state === 'fail'
                ? 'اضغط على الدائرة علشان تبدأ'
                : ' '}
          </Text>
        </View>

        <Pressable onPress={() => router.push('/(onboarding)/auth')} style={{ paddingVertical: 14 }}>
          <Text
            style={{
              textAlign: 'center',
              fontFamily: fonts.arabicSemiBold,
              fontSize: 14,
              color: colors.olive,
            }}
          >
            دخول برقم التليفون بدلاً من ذلك
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
