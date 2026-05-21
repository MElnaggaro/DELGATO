import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { Button, Card, Icon, Row, Section } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useHaptics } from '@/shared/hooks/useHaptics';
import { useAuthStore } from '@/features/auth/store';
import { formatNationalDisplay } from '@/shared/utils/phone';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';

export default function ProfilePlaceholder() {
  const { t } = useTranslation();
  const router = useRouter();
  const haptics = useHaptics();
  const arDigits = useArabicDigits();
  const user = useAuthStore((s) => s.user);
  const phone = useAuthStore((s) => s.phone);
  const signOut = useAuthStore((s) => s.signOut);

  const comingSoon = () => {
    haptics.tap();
    Alert.alert(t('profile.comingSoonTitle'), t('profile.comingSoonBody'), [
      { text: t('common.ok') },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView edges={['top']} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}>
        <FadeUp style={{ paddingHorizontal: 18 }}>
          <Text style={{ fontFamily: fonts.arabicBold, fontSize: 22, color: colors.ink }}>
            {t('profile.title')}
          </Text>
          <Text
            style={{
              fontFamily: fonts.arabic,
              fontSize: 14,
              color: colors.inkLight,
              marginTop: 6,
            }}
          >
            {user?.displayName ??
              (phone ? arDigits(formatNationalDisplay(phone)) : t('common.appName'))}
          </Text>
        </FadeUp>

        <Section label={t('profile.title')}>
          <Card padding={0}>
            <MenuRow icon={<Icon.pin size={20} color={colors.olive} />} label={t('profile.addresses')} onPress={comingSoon} />
            <MenuRow icon={<Icon.package size={20} color={colors.olive} />} label={t('profile.ordersHistory')} onPress={comingSoon} />
            <MenuRow icon={<Icon.card size={20} color={colors.olive} />} label={t('profile.paymentMethods')} onPress={comingSoon} />
            <MenuRow icon={<Icon.bell size={20} color={colors.olive} />} label={t('notifications.title')} onPress={comingSoon} />
          </Card>
        </Section>

        <Section label={t('settings.languageTitle')}>
          <Card padding={14}>
            <Row label={t('settings.languageTitle')} value={t('settings.ar')} />
          </Card>
        </Section>

        <View style={{ padding: 18, marginTop: 8 }}>
          <Button
            variant="ghost"
            full
            onPress={async () => {
              await signOut();
              router.replace('/');
            }}
          >
            {t('profile.logout')}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.canvas300 }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.canvas300,
        opacity: pressed ? 0.7 : 1,
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
      <Text
        style={{
          flex: 1,
          fontFamily: fonts.arabicSemiBold,
          fontSize: 14,
          color: colors.ink,
        }}
      >
        {label}
      </Text>
      <Icon.chevronDown size={18} color={colors.inkMute} />
    </Pressable>
  );
}
