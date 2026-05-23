import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppBar, Icon, ListRow, ToggleSwitch } from '@/shared/ui';
import { colors, fonts, shadow } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useSettingsStore } from '@/features/settings';

export default function Security() {
  const router = useRouter();
  const { isRtl, flexDirection } = useRtl();
  const biometricEnabled = useSettingsStore((s) => s.biometricEnabled);
  const setBiometricEnabled = useSettingsStore((s) => s.setBiometricEnabled);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="الأمان وتسجيل الدخول" onBack={() => safeBack('/(tabs)/profile')} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Group title="الدخول">
          <ListRow
            icon={<Icon.shieldCheck size={18} color={colors.olive} />}
            label="تغيير كلمة السر"
            sub="آخر تغيير من شهر"
            onPress={() => router.push('/change-password')}
          />
          <Hairline />
          <View
            style={{
              flexDirection,
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 14,
              gap: 12,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(31,74,61,0.08)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.shieldCheck size={18} color={colors.olive} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: fonts.arabicSemiBold,
                  fontSize: 14,
                  color: colors.ink,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                دخول بالبصمة
              </Text>
              <Text
                style={{
                  fontFamily: fonts.arabic,
                  fontSize: 12,
                  color: colors.inkLight,
                  marginTop: 2,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                ادخل في ثواني بدون كلمة سر
              </Text>
            </View>
            <ToggleSwitch value={biometricEnabled} onChange={setBiometricEnabled} />
          </View>
        </Group>

        <Group title="الجلسات">
          <ListRow
            icon={<Icon.phone size={18} color={colors.olive} />}
            label="iPhone 15 Pro · الدلنجات"
            sub="هذا الجهاز · دلوقتي"
          />
          <Hairline />
          <ListRow
            icon={<Icon.phone size={18} color={colors.olive} />}
            label="Samsung Galaxy S23"
            sub="من ٣ أيام · القاهرة"
            danger
            onPress={() => {}}
          />
        </Group>
      </ScrollView>
    </View>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const { isRtl } = useRtl();
  return (
    <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
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
        {title}
      </Text>
      <View
        style={{
          backgroundColor: colors.bgElevated,
          borderRadius: 12,
          overflow: 'hidden',
          ...shadow.card,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Hairline() {
  return <View style={{ height: 1, backgroundColor: colors.canvas300, marginHorizontal: 16 }} />;
}
