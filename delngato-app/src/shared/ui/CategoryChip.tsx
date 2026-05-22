import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { PressableScale } from './PressableScale';

type Props = {
  active?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onPress?: () => void;
};

export function CategoryChip({ active, icon, children, onPress }: Props) {
  const { flexDirection } = useRtl();
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.97}
      style={{
        height: 38,
        borderRadius: 100,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? colors.olive : '#FFFFFF',
        borderWidth: 1,
        borderColor: active ? colors.olive : colors.canvas300,
        flexDirection,
        gap: 6,
      }}
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
    </PressableScale>
  );
}

