import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button, FieldLabel, Icon } from '@/shared/ui';
import { AppBar } from '@/shared/ui/AppBar';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';

export default function CustomerRegisterScreen() {
  const router = useRouter();
  const { isRtl } = useRtl();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agree, setAgree] = useState(true);

  const valid = name.length >= 3 && phone.length >= 5 && agree;

  const onContinue = () => {
    if (!valid) return;
    router.replace('/(tabs)/home');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.canvas }}
    >
      <AppBar onBack={() => safeBack('/(auth)/role?type=register')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <FadeUp>
          <Text style={{ fontFamily: fonts.arabicBold, fontSize: 26, color: colors.ink, lineHeight: 32 }}>
            حساب عميل جديد
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
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="رقم الهاتف"
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
                  textAlign: 'right',
                  writingDirection: 'rtl',
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
          onPress={onContinue}
        >
          متابعة
        </Button>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
