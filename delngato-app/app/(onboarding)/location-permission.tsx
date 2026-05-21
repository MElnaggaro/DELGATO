import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button, Icon } from '@/shared/ui';
import { FadeUp, Pop } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';

export default function LocationPermission() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={{ flex: 1, padding: 28 }}>
        <FadeUp style={{ alignItems: 'center', marginTop: 24 }}>
          <Pop>
            <View
              style={{
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: '#F4EFE0',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 28,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 100,
                  backgroundColor: colors.olive,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.pin size={28} color={colors.canvas} />
              </View>
            </View>
          </Pop>

          <Text
            style={{
              fontFamily: fonts.arabicBold,
              fontSize: 24,
              color: colors.ink,
              textAlign: 'center',
            }}
          >
            {t('address.permTitle')}
          </Text>
          <Text
            style={{
              fontFamily: fonts.arabic,
              fontSize: 14,
              color: colors.inkLight,
              textAlign: 'center',
              marginTop: 8,
              lineHeight: 22,
              maxWidth: 300,
            }}
          >
            {t('address.permSub')}
          </Text>
        </FadeUp>

        <View style={{ flex: 1 }} />

        <View style={{ gap: 10 }}>
          <Button
            variant="primary"
            size="lg"
            full
            leading={<Icon.navigation size={18} color={colors.canvas} />}
            onPress={() => router.replace({ pathname: '/(onboarding)/address-setup' })}
          >
            {t('address.useCurrent')}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            full
            onPress={() =>
              router.replace({
                pathname: '/(onboarding)/address-setup',
                params: { manual: '1' },
              })
            }
          >
            {t('address.useManual')}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
