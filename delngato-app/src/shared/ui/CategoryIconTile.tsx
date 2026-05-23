import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSize } from '@/shared/theme';
import { PressableScale } from './PressableScale';

type Props = {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
};

/**
 * CategoryIconTile — 56×56 canvas-200 tile with olive icon and label
 * underneath. Used on Home category strip and Search "browse by category"
 * grid. Mirrors design-reference category tile.
 */
export function CategoryIconTile({ icon, label, onPress }: Props) {
  return (
    <PressableScale onPress={onPress} style={styles.wrap}>
      <View style={styles.iconBox}>{icon}</View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 8,
    minWidth: 64,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.canvas200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.ink,
    fontFamily: fonts.arabicMedium,
    fontSize: fontSize.caption - 1,
  },
});
