import { View } from 'react-native';

import { AppBar, EmptyState, Icon } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';

type Props = {
  title: string;
  emptyTitle?: string;
  emptyBody?: string;
  backTo?: string;
};

/**
 * StubScreen — temporary scaffold for routes that have been declared
 * but whose full implementation lands in Phase 4. Renders the canonical
 * AppBar + an EmptyState placeholder so router pushes succeed and the
 * screen has the correct chrome.
 */
export function StubScreen({ title, emptyTitle = 'قريباً', emptyBody, backTo }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar
        title={title}
        onBack={() => safeBack((backTo ?? '/') as Parameters<typeof safeBack>[0])}
      />
      <EmptyState
        icon={<Icon.refresh size={28} color={colors.olive} />}
        title={emptyTitle}
        body={emptyBody ?? 'الشاشة دي بنشتغل عليها دلوقتي.'}
      />
    </View>
  );
}
