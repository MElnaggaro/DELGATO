import { ScrollView, Text, View } from 'react-native';

import { AppBar, ToggleSwitch } from '@/shared/ui';
import { colors, fonts, shadow } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useSettingsStore, type PrivacyPrefs } from '@/features/settings';

export default function Privacy() {
  const prefs = useSettingsStore((s) => s.privacy);
  const setPrivacy = useSettingsStore((s) => s.setPrivacy);
  const t = (k: keyof PrivacyPrefs) => setPrivacy(k, !prefs[k]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="الخصوصية" onBack={() => safeBack('/(tabs)/profile')} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Group title="مشاركة البيانات">
          <PrivacyRow
            label="مشاركة الموقع"
            sub="بنستخدمه علشان نوصلك أقرب محلات"
            v={prefs.shareLocation}
            onChange={() => t('shareLocation')}
          />
          <Hairline />
          <PrivacyRow
            label="رسائل تسويقية"
            sub="عروض مخصصة بناءً على طلباتك"
            v={prefs.allowMarketing}
            onChange={() => t('allowMarketing')}
          />
          <Hairline />
          <PrivacyRow
            label="مشاركة بيانات الاستخدام"
            sub="بنستخدمها لتحسين التطبيق · بدون معلومات شخصية"
            v={prefs.shareUsage}
            onChange={() => t('shareUsage')}
          />
        </Group>

        <Group title="سياسات">
          <PolicyRow label="سياسة الخصوصية" />
          <Hairline />
          <PolicyRow label="شروط الاستخدام" />
          <Hairline />
          <PolicyRow label="تحميل بياناتي" />
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

function PrivacyRow({
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
  const { isRtl, flexDirection } = useRtl();
  return (
    <View style={{ flexDirection, paddingHorizontal: 16, paddingVertical: 14, gap: 12, alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: fonts.arabicSemiBold,
            fontSize: 14,
            color: colors.ink,
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          {label}
        </Text>
        {sub ? (
          <Text
            style={{
              fontFamily: fonts.arabic,
              fontSize: 12,
              color: colors.inkLight,
              marginTop: 2,
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            {sub}
          </Text>
        ) : null}
      </View>
      <ToggleSwitch value={v} onChange={onChange} />
    </View>
  );
}

function PolicyRow({ label }: { label: string }) {
  const { isRtl } = useRtl();
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 16,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.arabicMedium,
          fontSize: 14,
          color: colors.olive,
          textAlign: isRtl ? 'right' : 'left',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
