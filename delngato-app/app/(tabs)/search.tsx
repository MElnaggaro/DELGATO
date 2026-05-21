import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { EmptyState, Icon } from '@/shared/ui';
import { colors } from '@/shared/theme';

export default function SearchPlaceholder() {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView edges={['top']} />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState
          icon={<Icon.search size={32} color={colors.olive} />}
          title={t('tabs.search')}
          body="M3 placeholder — full search lands in the next milestone."
        />
      </View>
    </View>
  );
}
