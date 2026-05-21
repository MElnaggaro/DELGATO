import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppBar, Button } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { normalizeEgyptianPhone } from '@/shared/utils/phone';
import { safeBack } from '@/shared/utils/nav';
import { useHaptics } from '@/shared/hooks/useHaptics';
import { useRequestOtp } from '@/features/auth/hooks/useRequestOtp';

export default function AuthPhoneScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const haptics = useHaptics();
  const [raw, setRaw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useRequestOtp();

  const normalized = normalizeEgyptianPhone(raw);
  const valid = normalized !== null;

  const onContinue = async () => {
    if (!valid) return;
    setError(null);
    try {
      await mutateAsync(normalized);
      router.push('/(onboarding)/otp');
    } catch {
      haptics.warning();
      setError(t('auth.requestFailed'));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.canvas }}
    >
      <AppBar onBack={() => safeBack('/(onboarding)/welcome')} />
      <View style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 24 }}>
        <FadeUp>
          <Text
            style={{
              fontFamily: fonts.arabicBold,
              fontSize: 26,
              color: colors.ink,
              lineHeight: 32,
            }}
          >
            {t('auth.phoneTitle')}
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
            {t('auth.phoneSub')}
          </Text>
        </FadeUp>

        <FadeUp delay={120} style={{ marginTop: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 14,
                backgroundColor: colors.canvas200,
                borderRadius: 8,
                height: 56,
              }}
            >
              <Text style={{ fontSize: 18 }}>🇪🇬</Text>
              <Text
                style={{
                  fontFamily: fonts.arabicSemiBold,
                  fontSize: 15,
                  color: colors.ink,
                }}
                accessibilityLabel="+20"
              >
                +٢٠
              </Text>
            </View>
            <TextInput
              autoFocus
              value={raw}
              onChangeText={setRaw}
              placeholder={t('auth.phonePlaceholder')}
              placeholderTextColor={colors.inkMute}
              inputMode="numeric"
              keyboardType="number-pad"
              style={{
                flex: 1,
                height: 56,
                paddingHorizontal: 16,
                backgroundColor: colors.canvas200,
                borderRadius: 8,
                fontFamily: fonts.arabic,
                fontSize: 17,
                color: colors.ink,
                textAlign: 'left',
                writingDirection: 'ltr',
                letterSpacing: 1,
              }}
            />
          </View>
          <Text
            style={{
              fontFamily: fonts.arabic,
              fontSize: 12,
              color: colors.inkMute,
              marginTop: 10,
              lineHeight: 20,
            }}
          >
            {t('auth.phoneTerms')}{' '}
            <Text style={{ fontFamily: fonts.arabicSemiBold, color: colors.olive }}>
              {t('auth.phoneTermsLink')}
            </Text>{' '}
            {t('auth.phoneAnd')}{' '}
            <Text style={{ fontFamily: fonts.arabicSemiBold, color: colors.olive }}>
              {t('auth.phonePrivacyLink')}
            </Text>
            .
          </Text>
        </FadeUp>

        <View style={{ flex: 1 }} />

        {error ? (
          <Text
            style={{
              fontFamily: fonts.arabicMedium,
              fontSize: 13,
              color: colors.statusIssue,
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            {error}
          </Text>
        ) : null}

        <SafeAreaView edges={['bottom']}>
          <Button
            variant="primary"
            size="lg"
            full
            disabled={!valid}
            loading={isPending}
            onPress={onContinue}
          >
            {t('common.continue')}
          </Button>
          <Pressable style={{ marginTop: 14, alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: fonts.arabic,
                fontSize: 13,
                color: colors.inkLight,
              }}
            >
              {t('auth.supportPrompt')}{' '}
              <Text style={{ fontFamily: fonts.arabicSemiBold, color: colors.olive }}>
                {t('auth.supportLink')}
              </Text>
            </Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}
