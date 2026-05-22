import { Text, View, type ViewStyle } from 'react-native';

import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { Icon, IconForward } from './Icon';
import { LiveDot } from './LiveDot';
import { PressableScale } from './PressableScale';

type Props = {
  order: {
    id: string;
    statusText: string;
    shop: string;
  };
  onPress?: () => void;
  style?: ViewStyle;
};

export function ActiveOrderCard({ order, onPress, style }: Props) {
  const { isRtl, flexDirection } = useRtl();

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.98}
      style={{
        backgroundColor: colors.ink,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 14,
        flexDirection,
        alignItems: 'center',
        gap: 12,
        ...style,
      }}
    >
      {/* Gold bike badge */}
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: 'rgba(232,177,79,0.18)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon.bike size={20} color={colors.gold} />
      </View>

      {/* Order info details */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View
          style={{
            flexDirection,
            alignItems: 'center',
            gap: 8,
          }}
        >
          <LiveDot size={8} color={colors.olive} />
          <Text
            style={{
              fontFamily: fonts.arabicSemiBold,
              fontSize: 13,
              color: colors.canvas,
              textAlign: isRtl ? 'right' : 'left',
              includeFontPadding: false,
            }}
          >
            طلب شغّال
          </Text>
          <Text
            style={{
              fontFamily: fonts.arabic,
              fontSize: 11,
              color: 'rgba(250,248,243,0.5)',
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            {order.id}
          </Text>
        </View>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: fonts.arabic,
            fontSize: 12,
            color: 'rgba(250,248,243,0.7)',
            marginTop: 4,
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          {order.statusText} · {order.shop}
        </Text>
      </View>

      {/* RTL correct directional chevron */}
      <IconForward size={20} color={colors.canvas} />
    </PressableScale>
  );
}
