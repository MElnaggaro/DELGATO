import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { Icon } from './Icon';

export function OfflineBanner() {
  const { t } = useTranslation();
  const { flexDirection } = useRtl();
  return (
    <View
      style={{
        flexDirection,
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: 'rgba(197,59,44,0.10)',
      }}
    >
      <Icon.wifi size={16} color={colors.statusIssue} />
      <Text
        style={{
          flex: 1,
          fontFamily: fonts.arabicMedium,
          fontSize: 13,
          color: colors.statusIssue,
        }}
      >
        {t('errors.offline')}
      </Text>
    </View>
  );
}
