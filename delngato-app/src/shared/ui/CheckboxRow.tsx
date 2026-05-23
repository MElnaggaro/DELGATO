import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSize } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { Icon } from './Icon';

type Props = {
  checked: boolean;
  onToggle: () => void;
  label: string;
  sub?: string;
  trailing?: ReactNode;
  disabled?: boolean;
};

/** Olive-square check used in refund items, register terms, similar pickers. */
export function CheckboxRow({ checked, onToggle, label, sub, trailing, disabled }: Props) {
  const { flexDirection } = useRtl();
  return (
    <Pressable
      onPress={disabled ? undefined : onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      style={[
        styles.row,
        {
          flexDirection,
          borderColor: checked ? colors.olive : colors.canvas300,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: checked ? colors.olive : colors.bgElevated,
            borderColor: checked ? colors.olive : colors.canvas300,
          },
        ]}
      >
        {checked ? <Icon.check size={14} color={colors.canvas} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 12,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.ink,
    fontFamily: fonts.arabicSemiBold,
    fontSize: fontSize.body - 2,
  },
  sub: {
    color: colors.inkLight,
    fontFamily: fonts.arabic,
    fontSize: fontSize.caption - 1,
    marginTop: 2,
  },
});
