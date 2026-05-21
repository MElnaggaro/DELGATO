import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, fonts } from '@/shared/theme';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ title: '404' }} />
      <View
        style={{
          flex: 1,
          backgroundColor: colors.canvas,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          gap: 12,
        }}
      >
        <Text style={{ fontFamily: fonts.arabicBold, fontSize: 24, color: colors.ink }}>
          {t('errors.generic')}
        </Text>
        <Link href="/" style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.olive }}>
          {t('common.back')}
        </Link>
      </View>
    </>
  );
}
