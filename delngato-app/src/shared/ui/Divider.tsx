import { View, type ViewStyle } from 'react-native';

import { colors } from '@/shared/theme';

type Props = { style?: ViewStyle };

export function Divider({ style }: Props) {
  return (
    <View
      style={[{ height: 1, backgroundColor: colors.canvas300, marginVertical: 10 }, style]}
    />
  );
}
