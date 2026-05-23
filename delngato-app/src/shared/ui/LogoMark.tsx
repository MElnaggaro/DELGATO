import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, fonts } from '@/shared/theme';

type Props = {
  size?: number;
  /** When true, the mark renders inverted (canvas square + olive glyph). */
  inverted?: boolean;
  style?: ViewStyle;
};

/**
 * LogoMark — the canonical "د" glyph in an olive (or canvas, when inverted)
 * squircle (22% radius). Mirrors the design-reference LogoMark + splash mark.
 */
export function LogoMark({ size = 88, inverted = false, style }: Props) {
  const bg = inverted ? colors.canvas : colors.olive;
  const fg = inverted ? colors.olive : colors.canvas;
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          backgroundColor: bg,
          borderRadius: size * 0.22,
        },
        styles.center,
        style,
      ]}
    >
      <Text
        style={{
          color: fg,
          fontFamily: fonts.arabicBold,
          fontSize: size * 0.68,
          lineHeight: size * 0.68,
          includeFontPadding: false,
        }}
      >
        د
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
