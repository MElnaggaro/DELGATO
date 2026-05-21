import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View, type ViewStyle } from 'react-native';

import { colors, fonts } from '@/shared/theme';
import { useHaptics } from '@/shared/hooks/useHaptics';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'solid-gold';
type Size = 'md' | 'lg';

type Props = {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
  onPress?: () => void;
  haptic?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

/**
 * Primary CTAs in the brand. The "signature state" — 2px inset gold ring on
 * press — is encoded by toggling border styles, since RN doesn't have a true
 * inset box-shadow. The visual effect matches the reference.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  full,
  disabled,
  loading,
  leading,
  trailing,
  children,
  onPress,
  haptic = true,
  style,
  accessibilityLabel,
}: Props) {
  const haptics = useHaptics();
  const isDisabled = disabled || loading;

  const surface = (pressed: boolean): ViewStyle => {
    if (variant === 'primary') {
      return {
        backgroundColor: pressed ? colors.olive700 : colors.olive,
        borderWidth: 2,
        borderColor: pressed ? colors.gold : colors.olive,
      };
    }
    if (variant === 'solid-gold') {
      return {
        backgroundColor: pressed ? colors.gold600 : colors.gold,
        borderWidth: 2,
        borderColor: pressed ? colors.olive : colors.gold,
      };
    }
    if (variant === 'secondary') {
      return {
        backgroundColor: pressed ? colors.canvas200 : colors.canvas,
        borderWidth: 1.5,
        borderColor: colors.olive,
      };
    }
    if (variant === 'tertiary') {
      return {
        backgroundColor: pressed ? colors.canvas200 : 'transparent',
        borderWidth: 1.5,
        borderColor: 'transparent',
      };
    }
    // ghost — legacy alias for secondary
    return {
      backgroundColor: pressed ? colors.canvas200 : 'transparent',
      borderWidth: 1.5,
      borderColor: colors.olive,
    };
  };

  const textColor =
    variant === 'primary'
      ? colors.canvas
      : variant === 'solid-gold'
        ? colors.ink
        : colors.olive;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={() => {
        if (haptic) haptics.tap();
        onPress?.();
      }}
      hitSlop={8}
      style={({ pressed }) => [
        {
          width: full ? '100%' : undefined,
          minHeight: 48,
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 24,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          opacity: isDisabled ? 0.4 : 1,
        },
        surface(pressed),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {leading ? <View>{leading}</View> : null}
          <Text
            style={{
              color: textColor,
              fontFamily: fonts.arabicSemiBold,
              fontSize: 16,
              includeFontPadding: false,
            }}
          >
            {children}
          </Text>
          {trailing ? <View>{trailing}</View> : null}
        </>
      )}
    </Pressable>
  );
}
