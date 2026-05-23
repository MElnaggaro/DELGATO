import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSize } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';

type Props = {
  selected: boolean;
  onPress: () => void;
  label: string;
  sub?: string;
  /** Optional tinted icon box at the start of the row. */
  icon?: ReactNode;
  disabled?: boolean;
};

/**
 * RadioRow — olive-bordered card with a radio dot. Used in checkout
 * payment options, refund reason picker, cancel-reason picker.
 * Mirrors design-reference radio card pattern.
 */
export function RadioRow({ selected, onPress, label, sub, icon, disabled }: Props) {
  const { flexDirection } = useRtl();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      style={[
        styles.row,
        {
          flexDirection,
          borderColor: selected ? colors.olive : colors.canvas300,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {icon ? (
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: selected ? colors.olive : colors.canvas200,
            },
          ]}
        >
          <View style={{ opacity: selected ? 1 : 1 }}>{icon}</View>
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
      <View
        style={[
          styles.dot,
          {
            borderColor: selected ? colors.olive : colors.canvas300,
          },
        ]}
      >
        {selected ? <View style={styles.dotInner} /> : null}
      </View>
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
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
  dot: {
    width: 20,
    height: 20,
    borderRadius: 100,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: 100,
    backgroundColor: colors.olive,
  },
});
