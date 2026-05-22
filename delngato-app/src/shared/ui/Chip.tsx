import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';

type Props = {
  active?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onPress?: () => void;
};

export function Chip({ active, icon, children, onPress }: Props) {
  const { flexDirection } = useRtl();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => ({
        flexDirection,
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 100,
        backgroundColor: active ? colors.olive : pressed ? colors.canvas200 : colors.bgElevated,
        borderWidth: 1,
        borderColor: active ? colors.olive : colors.canvas300,
      })}
    >
      {icon ? <View>{icon}</View> : null}
      <Text
        numberOfLines={1}
        style={{
          fontFamily: active ? fonts.arabicSemiBold : fonts.arabicMedium,
          fontSize: 14,
          color: active ? colors.canvas : colors.ink,
          includeFontPadding: false,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
