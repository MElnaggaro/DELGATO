import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppBar, Button, Icon } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { safeBack } from '@/shared/utils/nav';
import { useAuthStore } from '@/features/auth/store';
import { formatNationalDisplay } from '@/shared/utils/phone';

export default function EditProfile() {
  const router = useRouter();
  const arDigits = useArabicDigits();
  const phone = useAuthStore((s) => s.phone);
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState(user?.displayName ?? 'أحمد محمد');
  const [email, setEmail] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="تعديل البيانات" onBack={() => safeBack('/(tabs)/profile')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24 }}>
        <View style={{ alignItems: 'center', marginVertical: 28 }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 100,
              backgroundColor: colors.olive,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: fonts.arabicBold, fontSize: 40, color: colors.canvas }}>
              {name[0] ?? 'أ'}
            </Text>
            <Pressable
              style={{
                position: 'absolute',
                insetInlineEnd: -4,
                bottom: -4,
                width: 30,
                height: 30,
                borderRadius: 100,
                backgroundColor: colors.canvas,
                borderWidth: 2,
                borderColor: colors.canvas,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.edit size={14} color={colors.olive} />
            </Pressable>
          </View>
        </View>

        <View style={{ gap: 14 }}>
          <Field label="الاسم">
            <CInput value={name} onChangeText={setName} />
          </Field>
          <Field label="رقم التليفون">
            <CInput
              value={`+20 ${arDigits(phone ? formatNationalDisplay(phone) : '10 234 5678')}`}
              editable={false}
              ltr
              style={{
                backgroundColor: colors.canvas200,
                color: colors.inkLight,
              }}
            />
          </Field>
          <Field label="الإيميل (اختياري)">
            <CInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              keyboardType="email-address"
              ltr
              autoCapitalize="none"
            />
          </Field>
        </View>
      </ScrollView>

      <SafeAreaView
        edges={['bottom']}
        style={{
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 12,
          backgroundColor: colors.canvas,
          borderTopWidth: 1,
          borderTopColor: colors.canvas300,
        }}
      >
        <Button variant="primary" size="lg" full onPress={() => router.back()}>
          حفظ
        </Button>
      </SafeAreaView>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text
        style={{
          fontFamily: fonts.arabicSemiBold,
          fontSize: 12,
          color: colors.inkMute,
          marginBottom: 6,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

function CInput({
  ltr,
  style,
  ...rest
}: React.ComponentProps<typeof TextInput> & { ltr?: boolean }) {
  return (
    <TextInput
      {...rest}
      placeholderTextColor={colors.inkMute}
      style={[
        {
          height: 48,
          backgroundColor: colors.bgElevated,
          borderRadius: 8,
          borderWidth: 1.5,
          borderColor: colors.canvas300,
          paddingHorizontal: 14,
          fontFamily: fonts.arabic,
          fontSize: 16,
          color: colors.ink,
          textAlign: ltr ? 'left' : 'right',
          ...(ltr ? { writingDirection: 'ltr' as const } : {}),
        },
        style,
      ]}
    />
  );
}
