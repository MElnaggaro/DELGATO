import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppBar, Button, FieldLabel, Icon } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { normalizeEgyptianPhone } from '@/shared/utils/phone';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useRequestOtp } from '@/features/auth/hooks/useRequestOtp';

export default function Register() {
  const router = useRouter();
  const { isRtl } = useRtl();
  const { mutateAsync, isPending } = useRequestOtp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agree, setAgree] = useState(true);

  const normalized = normalizeEgyptianPhone(phone);
  const valid = name.length >= 3 && normalized !== null && agree;

  const onContinue = async () => {
    if (!valid) return;
    try {
      await mutateAsync(normalized);
      router.push('/(onboarding)/otp');
    } catch {
      /* swallow */
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.canvas }}
    >
      <AppBar onBack={() => safeBack('/(onboarding)/welcome')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <FadeUp>
          <Text style={{ fontFamily: fonts.arabicBold, fontSize: 26, color: colors.ink, lineHeight: 32 }}>
            حساب جديد
          </Text>
          <Text style={{ fontFamily: fonts.arabic, fontSize: 14, color: colors.inkLight, marginTop: 8, lineHeight: 22 }}>
            خطوتين بس وحسابك جاهز.
          </Text>
        </FadeUp>

        <FadeUp delay={120} style={{ marginTop: 28, gap: 14 }}>
          <FieldLabel label="الاسم">
            <TextInput
              autoFocus
              value={name}
              onChangeText={setName}
              placeholder="مثلاً: أحمد محمد"
              placeholderTextColor={colors.inkMute}
              style={{
                minHeight: 56,
                backgroundColor: colors.bgElevated,
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor: colors.canvas300,
                paddingHorizontal: 14,
                fontFamily: fonts.arabic,
                fontSize: 17,
                color: colors.ink,
                textAlign: isRtl ? 'right' : 'left',
              }}
            />
          </FieldLabel>

          <FieldLabel label="رقم التليفون">
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
                <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 15, color: colors.ink }}>
                  +٢٠
                </Text>
              </View>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="١٠ ١٢٣ ٤٥٦ ٧٨"
                placeholderTextColor={colors.inkMute}
                inputMode="numeric"
                keyboardType="number-pad"
                style={{
                  flex: 1,
                  height: 56,
                  paddingHorizontal: 14,
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
          </FieldLabel>

          <Pressable onPress={() => setAgree(!agree)} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 4 }}>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                borderWidth: 1.5,
                borderColor: agree ? colors.olive : colors.canvas300,
                backgroundColor: agree ? colors.olive : colors.bgElevated,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {agree ? <Icon.check size={14} color={colors.canvas} /> : null}
            </View>
            <Text
              style={{
                flex: 1,
                fontFamily: fonts.arabic,
                fontSize: 12.5,
                color: colors.inkLight,
                lineHeight: 20,
              }}
            >
              موافق على{' '}
              <Text style={{ fontFamily: fonts.arabicSemiBold, color: colors.olive }}>
                شروط الاستخدام
              </Text>
              {' '}و
              <Text style={{ fontFamily: fonts.arabicSemiBold, color: colors.olive }}>
                {' '}سياسة الخصوصية
              </Text>
              .
            </Text>
          </Pressable>
        </FadeUp>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ paddingHorizontal: 24, paddingTop: 12 }}>
        <Button
          variant="primary"
          size="lg"
          full
          disabled={!valid}
          loading={isPending}
          onPress={onContinue}
        >
          تابع · ابعت كود التحقق
        </Button>
        <Pressable
          onPress={() => router.replace('/(onboarding)/auth')}
          style={{ marginTop: 14, alignItems: 'center' }}
        >
          <Text style={{ fontFamily: fonts.arabic, fontSize: 13, color: colors.inkLight }}>
            عندي حساب ·{' '}
            <Text style={{ fontFamily: fonts.arabicSemiBold, color: colors.olive }}>
              تسجيل الدخول
            </Text>
          </Text>
        </Pressable>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
