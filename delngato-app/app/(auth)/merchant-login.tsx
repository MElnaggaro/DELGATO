import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '@/shared/ui';
import { AppBar } from '@/shared/ui/AppBar';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';

export default function MerchantLoginScreen() {
  const router = useRouter();
  const [raw, setRaw] = useState('');

  const onContinue = () => {
    router.replace('/(merchant)/(tabs)/dashboard');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.canvas }}
    >
      <AppBar onBack={() => safeBack('/(auth)/role?type=login')} />
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
            تسجيل دخول تاجر
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
            الرجاء إدخال رقم الهاتف للمتابعة
          </Text>
        </FadeUp>

        <FadeUp delay={120} style={{ marginTop: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TextInput
              autoFocus
              value={raw}
              onChangeText={setRaw}
              placeholder="رقم الهاتف"
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
                textAlign: 'right',
                writingDirection: 'rtl',
              }}
            />
          </View>
        </FadeUp>

        <View style={{ flex: 1 }} />

        <SafeAreaView edges={['bottom']}>
          <Button
            variant="primary"
            size="lg"
            full
            disabled={raw.length < 5}
            onPress={onContinue}
          >
            متابعة
          </Button>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}
