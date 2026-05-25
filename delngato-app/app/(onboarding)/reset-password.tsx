import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppBar, Button, FieldLabel, Icon, showToast } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';

export default function ResetPassword() {
  const router = useRouter();
  const { isRtl } = useRtl();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);

  const strength = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 10 ? 2 : 3;
  const strLabels = ['', 'ضعيفة', 'متوسطة', 'قوية'];
  const strColors = [colors.canvas300, colors.statusIssue, colors.gold, colors.olive] as const;
  const valid = pw.length >= 6 && pw === pw2;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.canvas }}
    >
      <AppBar onBack={() => safeBack('/(onboarding)/forgot-password')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <FadeUp>
          <Text style={{ fontFamily: fonts.arabicBold, fontSize: 26, color: colors.ink, lineHeight: 32 }}>
            كلمة سر جديدة
          </Text>
          <Text style={{ fontFamily: fonts.arabic, fontSize: 14, color: colors.inkLight, marginTop: 8, lineHeight: 22 }}>
            ٦ حروف على الأقل. اختار كلمة مفيش حد يعرفها.
          </Text>
        </FadeUp>

        <FadeUp delay={120} style={{ marginTop: 24, gap: 14 }}>
          <FieldLabel label="كلمة السر الجديدة">
            <View style={{ position: 'relative' }}>
              <TextInput
                value={pw}
                onChangeText={setPw}
                secureTextEntry={!show}
                autoFocus
                style={{
                  minHeight: 56,
                  backgroundColor: colors.bgElevated,
                  borderRadius: 8,
                  borderWidth: 1.5,
                  borderColor: colors.canvas300,
                  paddingHorizontal: 14,
                  paddingEnd: 48,
                  fontFamily: fonts.arabic,
                  fontSize: 17,
                  color: colors.ink,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              />
              <Pressable
                onPress={() => setShow(!show)}
                hitSlop={6}
                style={{
                  position: 'absolute',
                  insetInlineEnd: 8,
                  top: 0,
                  bottom: 0,
                  width: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {show ? (
                  <Icon.x size={18} color={colors.inkLight} />
                ) : (
                  <Icon.search size={18} color={colors.inkLight} />
                )}
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 100,
                    backgroundColor: strength >= i ? strColors[strength] : colors.canvas300,
                  }}
                />
              ))}
            </View>
            {strength > 0 ? (
              <Text
                style={{
                  fontFamily: fonts.arabicSemiBold,
                  fontSize: 11,
                  color: strColors[strength],
                  marginTop: 6,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                {strLabels[strength]}
              </Text>
            ) : null}
          </FieldLabel>

          <FieldLabel label="تأكيد كلمة السر">
            <TextInput
              value={pw2}
              onChangeText={setPw2}
              secureTextEntry={!show}
              style={{
                minHeight: 56,
                backgroundColor: colors.bgElevated,
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor: pw2 && pw !== pw2 ? colors.statusIssue : colors.canvas300,
                paddingHorizontal: 14,
                fontFamily: fonts.arabic,
                fontSize: 17,
                color: colors.ink,
                textAlign: isRtl ? 'right' : 'left',
              }}
            />
            {pw2 && pw !== pw2 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <Icon.info size={14} color={colors.statusIssueText} />
                <Text
                  style={{
                    fontFamily: fonts.arabicMedium,
                    fontSize: 12,
                    color: colors.statusIssueText,
                  }}
                >
                  كلمتين السر مش متطابقتين.
                </Text>
              </View>
            ) : null}
          </FieldLabel>
        </FadeUp>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ paddingHorizontal: 24, paddingTop: 12 }}>
        <Button
          variant="primary"
          size="lg"
          full
          disabled={!valid}
          onPress={() => {
            showToast('اتغيرت كلمة السر بنجاح', <Icon.check size={16} color={colors.gold} />);
            router.replace('/(auth)/role?type=login');
          }}
        >
          حفظ وتسجيل الدخول
        </Button>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
