import { type ReactNode } from 'react';
import { ScrollView } from 'react-native';

import { useRtl } from '@/shared/hooks/useRtl';

type Props = {
  children: ReactNode;
};

export function CategoryChipRow({ children }: Props) {
  const { isRtl, flexDirection } = useRtl();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 18,
        paddingVertical: 4,
        flexDirection,
        gap: 8,
      }}
    >
      {children}
    </ScrollView>
  );
}
