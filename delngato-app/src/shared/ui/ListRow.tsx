import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { IconForward } from './Icon';

type Props = {
  icon?: ReactNode;
  label: string;
  sub?: string;
  value?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  danger?: boolean;
};

export function ListRow({ icon, label, sub, value, trailing, onPress, danger }: Props) {
  const Container: React.ComponentType<any> = onPress ? Pressable : View;
  const { isRtl, flexDirection } = useRtl();
  return (
    <Container
      onPress={onPress}
      android_ripple={onPress ? { color: colors.canvas200 } : undefined}
      style={({ pressed }: { pressed?: boolean }) => ({
        flexDirection,
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {icon ? (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: danger ? 'rgba(197,59,44,0.10)' : 'rgba(31,74,61,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: fonts.arabicSemiBold,
            fontSize: 14,
            color: danger ? colors.statusIssueText : colors.ink,
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          {label}
        </Text>
        {sub ? (
          <Text
            style={{
              fontFamily: fonts.arabic,
              fontSize: 12,
              color: colors.inkLight,
              marginTop: 2,
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            {sub}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text
          style={{
            fontFamily: fonts.arabicMedium,
            fontSize: 13,
            color: colors.inkLight,
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          {value}
        </Text>
      ) : null}
      {trailing !== undefined ? trailing : onPress ? <IconForward size={18} color={colors.inkMute} /> : null}
    </Container>
  );
}

