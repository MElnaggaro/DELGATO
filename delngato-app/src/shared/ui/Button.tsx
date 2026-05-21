import { isValidElement, type ReactNode } from 'react';
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
  /** Button label. Accepts a string (most common), a number, or a custom node. */
  children?: ReactNode;
  /** Explicit label prop alternative — wins over `children` when set. Use when children would be a node accidentally. */
  label?: string;
  onPress?: () => void;
  haptic?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

/**
 * Primary CTAs in the brand. The "signature state" — 2px inset gold ring on
 * press — is encoded by toggling border styles, since RN doesn't have a true
 * inset box-shadow. The visual effect matches the reference.
 *
 * Label safety: we used to silently drop labels when callers passed a
 * `<Text>` node as children (RN crashes on nested Text in some configs and
 * renders blank in others). Now we accept either a string-like child (wrapped
 * in Text) or a custom element (rendered as-is), and a separate `label` prop
 * for clarity.
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
  label,
  onPress,
  haptic = true,
  style,
  accessibilityLabel,
}: Props) {
  const haptics = useHaptics();
  const isDisabled = disabled || loading;
  const isLarge = size === 'lg';

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
    // ghost
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

  const labelText = label ?? (typeof children === 'string' || typeof children === 'number' ? String(children) : undefined);
  const customNode = labelText === undefined && children != null && isValidElement(children) ? children : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? labelText}
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
          minHeight: isLarge ? 56 : 48,
          borderRadius: 12,
          paddingVertical: isLarge ? 16 : 14,
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
          {labelText !== undefined ? (
            <Text
              numberOfLines={1}
              style={{
                color: textColor,
                fontFamily: fonts.arabicSemiBold,
                fontSize: isLarge ? 17 : 16,
                includeFontPadding: false,
              }}
            >
              {labelText}
            </Text>
          ) : customNode}
          {trailing ? <View>{trailing}</View> : null}
        </>
      )}
    </Pressable>
  );
}
