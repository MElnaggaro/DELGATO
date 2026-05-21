import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Button, EmptyState, Icon } from '@/shared/ui';
import { colors } from '@/shared/theme';

export default function CartPlaceholder() {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView edges={['top']} />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState
          icon={<Icon.bag size={32} color={colors.olive} />}
          title={t('cart.emptyTitle')}
          body={t('cart.emptyBody')}
          action={<Button variant="primary">{t('cart.emptyAction')}</Button>}
        />
      </View>
    </View>
  );
}
