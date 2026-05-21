import { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { colors, shadow } from '@/shared/theme';

type Props = {
  children: ReactNode;
  padding?: number;
  /** When true, uses shadow elevation. When false (default), uses hairline border. Mutually exclusive — brand rule. */
  elevated?: boolean;
  style?: ViewStyle;
};

export function Card({ children, padding = 14, elevated = false, style }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.bgElevated,
          borderRadius: 12,
          padding,
          ...(elevated
            ? shadow.card
            : { borderWidth: 1, borderColor: colors.canvas300 }),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
