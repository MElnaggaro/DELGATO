import { Pressable, Text, View } from 'react-native';

import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { Icon } from '@/shared/ui';

type Props = {
  onKey: (key: string | 'del') => void;
};

/**
 * 3×4 numeric keypad. Bottom row: empty · 0 · del.
 * Tap targets are 56pt — well above the 44pt brand minimum.
 *
 * Digits are localized via useArabicDigits.
 */
export function OtpKeypad({ onKey }: Props) {
  const arDigits = useArabicDigits();
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 8,
        paddingHorizontal: 24,
        paddingBottom: 16,
      }}
    >
      {keys.map((k) => (
        <Key key={k} label={arDigits(k)} onPress={() => onKey(k)} />
      ))}
      <Key label="" disabled />
      <Key label={arDigits('0')} onPress={() => onKey('0')} />
      <Key
        label=""
        onPress={() => onKey('del')}
        icon={<Icon.x size={20} color={colors.inkLight} />}
      />
    </View>
  );
}

function Key({
  label,
  onPress,
  disabled,
  icon,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        width: '31%',
        height: 56,
        borderRadius: 12,
        backgroundColor: pressed ? colors.canvas200 : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0 : 1,
      })}
    >
      {icon ? (
        icon
      ) : (
        <Text
          style={{
            fontFamily: fonts.arabicSemiBold,
            fontSize: 24,
            color: colors.ink,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
