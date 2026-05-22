import { Children, isValidElement, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View, type ViewStyle } from 'react-native';

import { colors, fonts } from '@/shared/theme';
import { useHaptics } from '@/shared/hooks/useHaptics';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'solid-gold' | 'destructive';
type Size = 'md' | 'lg';

type Props = {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Button label. String/number wins; otherwise children render as-is. */
  children?: ReactNode;
  /** Explicit label prop — wins over `children` when set. */
  label?: string;
  onPress?: () => void;
  haptic?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

/**
 * Primary CTAs. Mirrors design-reference `.dl-btn` exactly:
 *   border: 0; min-height 48 (lg=56); radius 12; padding 0 20;
 *   font: Arabic SemiBold 16 (lg=17); line-height 1.
 *   primary: bg olive / fg canvas; press: bg olive-700 + 2px inset gold ring.
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
        borderWidth: pressed ? 2 : 0,
        borderColor: pressed ? colors.gold : 'transparent',
      };
    }
    if (variant === 'destructive') {
      return {
        backgroundColor: pressed ? '#A1271C' : colors.statusIssue,
        borderWidth: pressed ? 2 : 0,
        borderColor: pressed ? colors.gold : 'transparent',
      };
    }
    if (variant === 'solid-gold') {
      return {
        backgroundColor: pressed ? colors.gold600 : colors.gold,
        borderWidth: pressed ? 2 : 0,
        borderColor: pressed ? colors.olive : 'transparent',
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
        borderWidth: 0,
        borderColor: 'transparent',
      };
    }
    // ghost — transparent fill, olive outline
    return {
      backgroundColor: pressed ? colors.canvas200 : 'transparent',
      borderWidth: 1.5,
      borderColor: colors.olive,
    };
  };

  const textColor =
    variant === 'primary' || variant === 'destructive'
      ? colors.canvas
      : variant === 'solid-gold'
        ? colors.ink
        : colors.olive;

  // Resolve label. Explicit `label` wins. Otherwise: if children is a single
  // primitive (string/number) — render it as Text. If it's only valid React
  // element(s), pass them through unwrapped so screens can drop in nested
  // Text/icons without the button silently swallowing them.
  let labelText: string | undefined = label;
  let customNode: ReactNode = null;
  if (labelText === undefined) {
    if (typeof children === 'string' || typeof children === 'number') {
      labelText = String(children);
    } else if (children != null) {
      const arr = Children.toArray(children).filter((c) => c !== null && c !== '');
      if (arr.length === 1 && (typeof arr[0] === 'string' || typeof arr[0] === 'number')) {
        labelText = String(arr[0]);
      } else if (arr.length > 0 && arr.every(isValidElement)) {
        customNode = arr;
      } else if (arr.length > 0) {
        // Mixed: stringify primitives, keep elements. Wrap whole thing in Text
        // to satisfy RN's "text outside Text" requirement.
        labelText = arr
          .map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : ''))
          .join('');
      }
    }
  }

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
          paddingHorizontal: 20,
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
          {leading}
          {labelText !== undefined ? (
            <Text
              numberOfLines={1}
              style={{
                color: textColor,
                fontFamily: fonts.arabicSemiBold,
                fontSize: isLarge ? 17 : 16,
                lineHeight: isLarge ? 22 : 20,
                includeFontPadding: false,
                textAlignVertical: 'center',
              }}
            >
              {labelText}
            </Text>
          ) : (
            customNode
          )}
          {trailing}
        </>
      )}
    </Pressable>
  );
}
