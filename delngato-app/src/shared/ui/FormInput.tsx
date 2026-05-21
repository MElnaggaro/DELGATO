import { type ReactNode, useState } from 'react';
import {
  Text,
  TextInput as RNTextInput,
  View,
  type TextInputProps as RNTextInputProps,
  type ViewStyle,
} from 'react-native';

import { colors, fonts } from '@/shared/theme';

type State = 'default' | 'focus' | 'error' | 'disabled';

type Props = Omit<RNTextInputProps, 'style' | 'editable'> & {
  label?: string;
  /** Error message — when set, input enters the error state automatically. */
  error?: string;
  /** External state override. Normally derived from focus/error/disabled. */
  state?: State;
  disabled?: boolean;
  trailing?: ReactNode;
  containerStyle?: ViewStyle;
};

/**
 * Brand form input. Specs from components-inputs.html:
 *   - border-radius: 8px
 *   - min-height: 48px
 *   - border: 1.5px solid canvas-300 (default) / olive (focus) / statusIssue (error) / canvas-300 (disabled)
 *   - focus ring: 3px olive @ 10% — approximated with a wrapper view borderWidth
 *   - label: 13px, ink-light (default) / olive (focus) / statusIssue (error) / ink-mute (disabled)
 *   - text: 16px, regular, ink
 *   - disabled: canvas-200 bg, ink-mute text
 *   - text-align: right (RTL)
 */
export function FormInput({
  label,
  error,
  state: stateProp,
  disabled,
  trailing,
  containerStyle,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);

  const derivedState: State = stateProp
    ?? (disabled ? 'disabled' : error ? 'error' : focused ? 'focus' : 'default');

  const borderColor = {
    default: colors.canvas300,
    focus: colors.olive,
    error: colors.statusIssue,
    disabled: colors.canvas300,
  }[derivedState];

  const labelColor = {
    default: colors.inkLight,
    focus: colors.olive,
    error: colors.statusIssue,
    disabled: colors.inkMute,
  }[derivedState];

  const labelWeight = {
    default: fonts.arabicMedium,
    focus: fonts.arabicSemiBold,
    error: fonts.arabicSemiBold,
    disabled: fonts.arabicMedium,
  }[derivedState];

  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label ? (
        <Text
          style={{
            fontFamily: labelWeight,
            fontSize: 13,
            color: labelColor,
            includeFontPadding: false,
          }}
        >
          {label}
        </Text>
      ) : null}
      <View
        style={{
          borderRadius: 8,
          borderWidth: 1.5,
          borderColor,
          backgroundColor: disabled ? colors.canvas200 : colors.bgElevated,
          minHeight: 48,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          // Focus ring approximation: 3px olive @ 10% as an outer shadow-like effect
          ...(derivedState === 'focus'
            ? {
                shadowColor: colors.olive,
                shadowOpacity: 0.1,
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 3,
                elevation: 0,
              }
            : {}),
        }}
      >
        <RNTextInput
          editable={!disabled}
          placeholderTextColor={colors.inkMute}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={{
            flex: 1,
            fontFamily: fonts.arabic,
            fontSize: 16,
            lineHeight: 16 * 1.2,
            color: disabled ? colors.inkMute : colors.ink,
            textAlign: 'right',
            padding: 0,
            paddingVertical: 12,
            includeFontPadding: false,
          }}
          {...rest}
        />
        {trailing}
      </View>
      {error ? (
        <Text
          style={{
            fontFamily: fonts.arabic,
            fontSize: 12,
            color: colors.statusIssue,
            includeFontPadding: false,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
