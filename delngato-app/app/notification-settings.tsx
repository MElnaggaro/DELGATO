import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AppBar } from '@/shared/ui';
import { colors, fonts, shadow } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';

type SettingsState = {
  orders: boolean;
  promos: boolean;
  news: boolean;
  push: boolean;
  sms: boolean;
};

export default function NotificationSettings() {
  const [s, setS] = useState<SettingsState>({
    orders: true,
    promos: true,
    news: false,
    push: true,
    sms: true,
  });
  const t = (k: keyof SettingsState) => setS({ ...s, [k]: !s[k] });

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="إعدادات الإشعارات" onBack={() => safeBack('/(tabs)/profile')} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Group title="نوع الإشعار">
          <Toggle
            label="تحديثات الطلبات"
            sub="حالة الطلب، الكابتن، التوصيل"
            v={s.orders}
            onChange={() => t('orders')}
          />
          <Hairline />
          <Toggle
            label="عروض وخصومات"
            sub="آخر العروض من المحلات"
            v={s.promos}
            onChange={() => t('promos')}
          />
          <Hairline />
          <Toggle
            label="أخبار دلنجاتُو"
            sub="محلات جديدة وميزات جديدة"
            v={s.news}
            onChange={() => t('news')}
          />
        </Group>

        <Group title="القناة">
          <Toggle label="إشعارات داخل التطبيق" v={s.push} onChange={() => t('push')} />
          <Hairline />
          <Toggle label="رسائل SMS" v={s.sms} onChange={() => t('sms')} />
        </Group>
      </ScrollView>
    </View>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 4 }}>
      <Text
        style={{
          fontFamily: fonts.arabicSemiBold,
          fontSize: 12,
          color: colors.inkMute,
          letterSpacing: 0.4,
          marginBottom: 8,
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

function Toggle({
  label,
  sub,
  v,
  onChange,
}: {
  label: string;
  sub?: string;
  v: boolean;
  onChange: () => void;
}) {
  return (
    <View
      style={{
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink }}>
          {label}
        </Text>
        {sub ? (
          <Text style={{ fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight, marginTop: 2 }}>
            {sub}
          </Text>
        ) : null}
      </View>
      <Pressable
        onPress={onChange}
        accessibilityRole="switch"
        accessibilityState={{ checked: v }}
        style={{
          width: 44,
          height: 26,
          borderRadius: 100,
          backgroundColor: v ? colors.olive : colors.canvas300,
          justifyContent: 'center',
          padding: 3,
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 100,
            backgroundColor: colors.bgElevated,
            alignSelf: v ? 'flex-end' : 'flex-start',
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 2,
            elevation: 1,
          }}
        />
      </Pressable>
    </View>
  );
}
