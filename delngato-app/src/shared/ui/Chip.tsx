import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors, fonts } from '@/shared/theme';

type Props = {
  active?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onPress?: () => void;
};

export function Chip({ active, icon, children, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 100,
        backgroundColor: active ? colors.olive : pressed ? colors.canvas200 : colors.canvas200,
        borderWidth: 1,
        borderColor: active ? colors.olive : colors.canvas300,
      })}
    >
      {icon ? <View>{icon}</View> : null}
      <Text
        style={{
          fontFamily: fonts.arabicSemiBold,
          fontSize: 13,
          color: active ? colors.canvas : colors.ink,
          includeFontPadding: false,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
