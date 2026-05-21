import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppBar } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { formatNationalDisplay } from '@/shared/utils/phone';
import { useAuthStore } from '@/features/auth/store';
import { InvalidOtpError, useVerifyOtp } from '@/features/auth/hooks/useVerifyOtp';
import { OtpCells } from '@/features/auth/components/OtpCells';
import { OtpKeypad } from '@/features/auth/components/OtpKeypad';

const COUNTER_START = 30;

export default function OtpScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const phone = useAuthStore((s) => s.phone);
  const arDigits = useArabicDigits();
  const { mutateAsync, isPending } = useVerifyOtp();

  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [counter, setCounter] = useState(COUNTER_START);

  useEffect(() => {
    if (counter <= 0) return;
    const id = setTimeout(() => setCounter((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [counter]);

  const submit = async (full: string) => {
    try {
      await mutateAsync(full);
      router.replace('/(onboarding)/location-permission');
    } catch (e) {
      if (e instanceof InvalidOtpError) {
        setError(true);
        setCode('');
      }
    }
  };

  const onKey = (k: string | 'del') => {
    if (isPending) return;
    setError(false);
    if (k === 'del') {
      setCode((c) => c.slice(0, -1));
      return;
    }
    setCode((c) => {
      if (c.length >= 6) return c;
      const next = c + k;
      if (next.length === 6) {
        // submit shortly after the last digit lands so the cell visually fills
        setTimeout(() => submit(next), 220);
      }
      return next;
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar onBack={() => router.back()} />
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        <FadeUp>
          <Text
            style={{
              fontFamily: fonts.arabicBold,
              fontSize: 26,
              color: colors.ink,
              lineHeight: 32,
            }}
          >
            {t('auth.otpTitle')}
          </Text>
          <Text
            style={{
              fontFamily: fonts.arabic,
              fontSize: 14,
              color: colors.inkLight,
              marginTop: 8,
              lineHeight: 22,
            }}
          >
            {t('auth.otpSub')}{' '}
            <Text
              style={{ fontFamily: fonts.arabicSemiBold, color: colors.ink }}
              accessibilityLabel={phone}
            >
              {arDigits(formatNationalDisplay(phone))}
            </Text>
          </Text>
        </FadeUp>

        <FadeUp delay={120} style={{ marginTop: 28 }}>
          <OtpCells code={code} error={error} />
          {error ? (
            <Text
              style={{
                marginTop: 14,
                fontFamily: fonts.arabicMedium,
                fontSize: 13,
                color: colors.statusIssue,
                textAlign: 'center',
              }}
            >
              {t('auth.otpWrong')}
            </Text>
          ) : null}
          <View style={{ marginTop: 18, alignItems: 'center' }}>
            {counter > 0 ? (
              <Text
                style={{ fontFamily: fonts.arabic, fontSize: 13, color: colors.inkLight }}
              >
                {t('auth.otpResendIn')}{' '}
                <Text style={{ fontFamily: fonts.arabicSemiBold, color: colors.ink }}>
                  {arDigits(counter)} ث
                </Text>
              </Text>
            ) : (
              <Pressable onPress={() => setCounter(COUNTER_START)}>
                <Text
                  style={{
                    fontFamily: fonts.arabicSemiBold,
                    fontSize: 13,
                    color: colors.olive,
                  }}
                >
                  {t('auth.otpResendNow')}
                </Text>
              </Pressable>
            )}
          </View>
        </FadeUp>

        <View style={{ flex: 1 }} />
      </View>
      <SafeAreaView edges={['bottom']}>
        <OtpKeypad onKey={onKey} />
      </SafeAreaView>
    </View>
  );
}
