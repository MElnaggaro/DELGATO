import { Pressable, ScrollView, Text, View } from 'react-native';

import { AppBar, Icon, IconForward, ToggleSwitch } from '@/shared/ui';
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
        <Group title="إعلانات وشركاء">
          <PrivacyRow
            label="إعلانات مخصصة"
            sub="مبنية على اهتماماتك"
            v={prefs.allowMarketing}
            onChange={() => t('allowMarketing')}
          />
          <Hairline />
          <PrivacyRow
            label="مشاركة البيانات مع المحلات"
            sub="اسم وعنوان التوصيل بس"
            v={prefs.shareUsage}
            onChange={() => t('shareUsage')}
          />
        </Group>

        <Group title="بياناتك">
          <ActionRow
            icon={<Icon.download size={18} color={colors.olive} />}
            label="حمّل نسخة من بياناتك"
            sub="هنبعتلك ملف على إيميلك خلال ٢٤ ساعة"
          />
          <Hairline />
          <ActionRow
            icon={<Icon.trash size={18} color={colors.olive} />}
            label="مسح سجل البحث"
          />
          <Hairline />
          <ActionRow
            icon={<Icon.shieldCheck size={18} color={colors.olive} />}
            label="سياسة الخصوصية الكاملة"
            sub="اقرأ كيف بنحمي بياناتك"
          />
        </Group>

        <Text
          style={{
            paddingHorizontal: 18,
            paddingTop: 14,
            paddingBottom: 8,
            fontFamily: fonts.arabic,
            fontSize: 12,
            color: colors.inkLight,
            lineHeight: 18,
            textAlign: useRtl().textStart,
          }}
        >
          تحكم في إيه اللي تشاركه مع دلنجاتُو. ساعتك تقدر تغيّر القرار في أي وقت.
        </Text>
      </ScrollView>
    </View>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const { textStart } = useRtl();
  return (
    <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 14 }}>
      <Text
        style={{
          fontFamily: fonts.arabicSemiBold,
          fontSize: 12,
          color: colors.inkMute,
          letterSpacing: 0.4,
          marginBottom: 8,
          textAlign: textStart,
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
  return <View style={{ height: 1, backgroundColor: colors.canvas300 }} />;
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
  const { flexDirection, textStart } = useRtl();
  return (
    <View style={{ flexDirection, paddingHorizontal: 16, paddingVertical: 14, gap: 12, alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: fonts.arabicSemiBold,
            fontSize: 14,
            color: colors.ink,
            textAlign: textStart,
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
              textAlign: textStart,
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

function ActionRow({ label, sub, icon }: { label: string; sub?: string; icon: React.ReactNode }) {
  const { flexDirection, textStart } = useRtl();
  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection,
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: pressed ? colors.canvas200 : 'transparent',
      })}
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
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: fonts.arabicSemiBold,
            fontSize: 14,
            color: colors.ink,
            textAlign: textStart,
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
              textAlign: textStart,
            }}
          >
            {sub}
          </Text>
        ) : null}
      </View>
      <IconForward size={18} color={colors.inkMute} />
    </Pressable>
  );
}
