import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button, FieldLabel, Icon, RadioRow, showToast } from '@/shared/ui';
import { AppBar } from '@/shared/ui/AppBar';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { normalizeEgyptianPhone } from '@/shared/utils/phone';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';

type Method = 'sms' | 'wa';

export default function ForgotPassword() {
  const router = useRouter();
  const { isRtl } = useRtl();
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<Method>('sms');
  const [loading, setLoading] = useState(false);
  const valid = normalizeEgyptianPhone(phone) !== null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.canvas }}
    >
      <AppBar onBack={() => safeBack('/(auth)/role?type=login')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <FadeUp>
          <Text style={{ fontFamily: fonts.arabicBold, fontSize: 26, color: colors.ink, lineHeight: 32 }}>
            نسيت كلمة السر؟
          </Text>
          <Text style={{ fontFamily: fonts.arabic, fontSize: 14, color: colors.inkLight, marginTop: 8, lineHeight: 22 }}>
            مفيش مشكلة — هنبعتلك كود لإعادة الضبط.
          </Text>
        </FadeUp>

        <FadeUp delay={120} style={{ marginTop: 24, gap: 20 }}>
          <FieldLabel label="رقم تليفونك">
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
                autoFocus
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
                }}
              />
            </View>
          </FieldLabel>

          <View>
            <Text
              style={{
                fontFamily: fonts.arabicSemiBold,
                fontSize: 12,
                color: colors.inkMute,
                letterSpacing: 0.4,
                marginBottom: 8,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              ابعتلي الكود على
            </Text>
            <View style={{ gap: 8 }}>
              <RadioRow
                selected={method === 'sms'}
                onPress={() => setMethod('sms')}
                label="رسالة SMS"
                sub="سريعة على رقم تليفونك"
                icon={
                  <Icon.message size={20} color={method === 'sms' ? colors.canvas : colors.olive} />
                }
              />
              <RadioRow
                selected={method === 'wa'}
                onPress={() => setMethod('wa')}
                label="واتساب"
                sub="رسالة على نفس الرقم"
                icon={
                  <Icon.phone size={20} color={method === 'wa' ? colors.canvas : colors.olive} />
                }
              />
            </View>
          </View>
        </FadeUp>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ paddingHorizontal: 24, paddingTop: 12 }}>
        <Button
          variant="primary"
          size="lg"
          full
          disabled={!valid || loading}
          loading={loading}
          onPress={() => {
            setLoading(true);
            setTimeout(() => router.push('/(onboarding)/reset-password'), 700);
          }}
        >
          ابعت الكود
        </Button>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
