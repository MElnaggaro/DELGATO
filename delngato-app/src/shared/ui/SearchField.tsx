import { type Ref } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { Icon } from './Icon';

type Props = Omit<TextInputProps, 'style'> & {
  onClear?: () => void;
  readOnly?: boolean;
  onTapWhenReadOnly?: () => void;
  inputRef?: Ref<TextInput>;
};

export function SearchField({
  value,
  onChangeText,
  placeholder = 'ابحث',
  onClear,
  readOnly,
  onTapWhenReadOnly,
  inputRef,
  ...rest
}: Props) {
  const { pick } = useRtl();
  const innerInput = (
    <View
      style={{
        backgroundColor: colors.canvas200,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 48,
        gap: 8,
      }}
    >
      <Icon.search size={18} color={colors.inkMute} />
      <TextInput
        ref={inputRef}
        editable={!readOnly}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMute}
        style={{
          flex: 1,
          fontFamily: fonts.arabic,
          fontSize: 15,
          color: colors.ink,
          textAlign: pick('right', 'left'),
          padding: 0,
        }}
        {...rest}
      />
      {!!value && !readOnly && onClear ? (
        <Pressable onPress={onClear} hitSlop={6}>
          <Icon.x size={16} color={colors.inkMute} />
        </Pressable>
      ) : null}
    </View>
  );

  if (readOnly && onTapWhenReadOnly) {
    return <Pressable onPress={onTapWhenReadOnly}>{innerInput}</Pressable>;
  }
  return innerInput;
}
