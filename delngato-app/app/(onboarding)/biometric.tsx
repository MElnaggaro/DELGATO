import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { AppBar, SuccessRing } from '@/shared/ui';
import { FadeUp, Pulse } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';
import { useAuthStore } from '@/features/auth/store';

type ScanState = 'idle' | 'scanning' | 'success' | 'fail';

export default function Biometric() {
  const router = useRouter();
  const [state, setState] = useState<ScanState>('idle');
  const hydrate = useAuthStore((s) => s.hydrateSession);

  const onScan = () => {
    setState('scanning');
    setTimeout(() => {
      setState('success');
      setTimeout(async () => {
        await hydrate();
        router.replace('/(tabs)/home');
      }, 700);
    }, 1400);
  };

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
            استخدم بصمة الإصبع أو الوش لدخول حسابك في ثواني.
          </Text>
        </FadeUp>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Pressable
            onPress={onScan}
            disabled={state === 'scanning' || state === 'success'}
            style={{
              width: 200,
              height: 200,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {state === 'scanning' ? (
              <>
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
              </>
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
            {state === 'idle' && 'ضع إصبعك على المستشعر'}
            {state === 'scanning' && 'جاري التحقق…'}
            {state === 'success' && 'أهلاً بيك تاني'}
            {state === 'fail' && 'مش هي البصمة. جرب تاني.'}
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
            {state === 'idle' || state === 'fail' ? 'اضغط على الدائرة علشان تبدأ' : ' '}
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
