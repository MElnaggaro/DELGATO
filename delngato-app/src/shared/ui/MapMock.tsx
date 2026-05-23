import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { G, Path, Circle, Text as SvgText } from 'react-native-svg';

import { colors } from '@/shared/theme';

type Marker = {
  x: number;
  y: number;
  letter?: string;
  color?: string;
  onPress?: () => void;
};

type Props = {
  height?: number;
  /** Markers to scatter on the map (positions in 0–360 × 0–height). */
  markers?: Marker[];
  /** Whether to draw the dashed delivery route (origin → destination). */
  showRoute?: boolean;
  /** Optional overlay (e.g. center pin, "live" pill) on top of the map. */
  overlay?: ReactNode;
  style?: ViewStyle;
};

/**
 * MapMock — the reusable SVG-streets background used wherever the design
 * shows a "fake" map (tracking, address-setup confirm, map-pin, nearby).
 * Mirrors the dashed cross-hatched streets in design-reference.
 */
export function MapMock({ height = 220, markers = [], showRoute = false, overlay, style }: Props) {
  return (
    <View style={[styles.container, { height }, style]}>
      <Svg
        viewBox={`0 0 360 ${height}`}
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}
      >
        <G stroke="#FAF8F3" strokeWidth={14} fill="none" opacity={0.9}>
          <Path d={`M -10 ${height * 0.23} L 380 ${height * 0.36}`} />
          <Path d={`M -10 ${height * 0.73} L 380 ${height * 0.68}`} />
          <Path d={`M 120 -10 L 90 ${height + 10}`} />
          <Path d={`M 260 -10 L 290 ${height + 10}`} />
        </G>
        {showRoute ? (
          <G stroke="#F2EEE3" strokeWidth={4} fill="none" strokeDasharray="6 6">
            <Path d="M 60 220 C 90 160, 200 110, 300 40" />
          </G>
        ) : null}
        {markers.map((m, i) => (
          <G key={i} transform={`translate(${m.x} ${m.y})`}>
            <Circle r={14} fill={m.color ?? colors.olive} />
            <Circle r={14} fill="none" stroke={colors.canvas} strokeWidth={2.5} />
            {m.letter ? (
              <SvgText
                textAnchor="middle"
                y={4}
                fontSize={12}
                fontWeight={700}
                fill={colors.canvas}
                fontFamily="IBMPlexSansArabic-Bold"
              >
                {m.letter}
              </SvgText>
            ) : null}
          </G>
        ))}
      </Svg>
      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E8E2D2',
    borderWidth: 1,
    borderColor: colors.canvas300,
  },
});
