import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';

export default function Welcome() {
  const router = useRouter();

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
            onPress={() => router.push('/(auth)/role?type=register')}
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
              إنشاء حساب جديد
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(auth)/role?type=login')}
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
              تسجيل الدخول
            </Text>
          </Pressable>

        </FadeUp>
      </View>
    </View>
  );
}
