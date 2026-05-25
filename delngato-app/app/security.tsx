import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { AppBar, Button, Icon, IconForward, ToggleSwitch } from '@/shared/ui';
import { colors, fonts, shadow } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { showToast } from '@/shared/ui/toast';

export default function Security() {
  const router = useRouter();
  const { textStart, flexDirection } = useRtl();

  // Mock state for the other two switches
  const [twoFactor, setTwoFactor] = useState(false);
  const [alerts, setAlerts] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="الأمان" onBack={() => safeBack('/(tabs)/profile')} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Group title="حماية الحساب">
          <ActionRow
            icon={<Icon.shieldCheck size={18} color={colors.olive} />}
            label="تغيير كلمة السر"
            onPress={() => router.push('/change-password')}
          />
          <Hairline />
          <SwitchRow
            label="التحقق بخطوتين"
            sub="كود إضافي على واتساب لكل دخول جديد"
            v={twoFactor}
            onChange={setTwoFactor}
          />
          <Hairline />
          <SwitchRow
            label="تنبيهات الدخول"
            sub="نبّهني لما حد يدخل من جهاز جديد"
            v={alerts}
            onChange={setAlerts}
          />
        </Group>

        <Group title="الأجهزة المسجلة">
          <DeviceRow
            name="iPhone 14 · iOS 17"
            sub="الدلنجات · الجلسة الحالية"
            isCurrent
          />
          <Hairline />
          <DeviceRow
            name="Chrome · ويندوز"
            sub="الإسكندرية · إمبارح · ١:٢٠ م"
          />
          <Hairline />
          <DeviceRow
            name="Safari · iPad"
            sub="الدلنجات · الأسبوع اللي فات"
          />
        </Group>

        <View style={{ paddingHorizontal: 18, paddingTop: 4 }}>
          <Button
            variant="ghost"
            full
            onPress={() => {}}
          >
            <View style={{ flexDirection, alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <Icon.logout size={16} color={colors.statusIssueText} />
              <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 15, color: colors.statusIssueText }}>
                تسجيل خروج من كل الأجهزة
              </Text>
            </View>
          </Button>
        </View>
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

function SwitchRow({
  label,
  sub,
  v,
  onChange,
}: {
  label: string;
  sub?: string;
  v: boolean;
  onChange: (v: boolean) => void;
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
      <ToggleSwitch value={v} onChange={() => onChange(!v)} />
    </View>
  );
}

function ActionRow({ label, icon, onPress }: { label: string; icon: React.ReactNode; onPress: () => void }) {
  const { flexDirection, textStart } = useRtl();
  return (
    <Pressable
      onPress={onPress}
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
      </View>
      <IconForward size={18} color={colors.inkMute} />
    </Pressable>
  );
}

function DeviceRow({ name, sub, isCurrent }: { name: string; sub: string; isCurrent?: boolean }) {
  const { flexDirection, textStart, isRtl } = useRtl();
  return (
    <View style={{ flexDirection, alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: isCurrent ? colors.olive : colors.canvas200,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon.shieldCheck size={18} color={isCurrent ? colors.canvas : colors.olive} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection, alignItems: 'center', gap: 6 }}>
          <Text
            style={{
              fontFamily: fonts.arabicSemiBold,
              fontSize: 13.5,
              color: colors.ink,
              textAlign: textStart,
            }}
          >
            {name}
          </Text>
          {isCurrent ? (
            <View
              style={{
                backgroundColor: 'rgba(31,74,61,0.08)',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 100,
              }}
            >
              <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 11, color: colors.olive }}>
                حالي
              </Text>
            </View>
          ) : null}
        </View>
        <Text
          style={{
            fontFamily: fonts.arabic,
            fontSize: 11,
            color: colors.inkLight,
            marginTop: 2,
            textAlign: textStart,
          }}
        >
          {sub}
        </Text>
      </View>
      {!isCurrent && (
        <Pressable onPress={() => {}}>
          <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 12, color: colors.statusIssueText }}>
            تسجيل خروج
          </Text>
        </Pressable>
      )}
    </View>
  );
}
