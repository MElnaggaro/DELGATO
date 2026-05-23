import { type ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, fonts, fontSize } from '@/shared/theme';

type Props = {
  label: string;
  optional?: boolean;
  children?: ReactNode;
  style?: ViewStyle;
};

/**
 * FieldLabel — micro caption ("اسم الحقل") + optional "(اختياري)" suffix,
 * with children rendered below. Mirrors design-reference `<FieldLbl>` and
 * `<Fld>` patterns used throughout forms.
 */
export function FieldLabel({ label, optional, children, style }: Props) {
  return (
    <View style={style}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        {optional ? <Text style={styles.optional}> (اختياري)</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  label: {
    color: colors.inkMute,
    fontFamily: fonts.arabicSemiBold,
    fontSize: fontSize.caption - 1,
    letterSpacing: 0.4,
  },
  optional: {
    color: colors.inkLight,
    fontFamily: fonts.arabicMedium,
    fontSize: fontSize.caption - 1,
  },
});
