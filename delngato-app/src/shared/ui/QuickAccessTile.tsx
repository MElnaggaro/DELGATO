import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSize } from '@/shared/theme';
import { PressableScale } from './PressableScale';

type Accent = 'olive' | 'gold';

type Props = {
  icon: ReactNode;
  label: string;
  accent?: Accent;
  onPress?: () => void;
};

/**
 * QuickAccessTile — white card with tinted icon square + label. Used in
 * the 3-column quick access grid on Home (Deals / Featured / Recommendations).
 * Mirrors design-reference quick-access tile.
 */
export function QuickAccessTile({ icon, label, accent = 'olive', onPress }: Props) {
  return (
    <View style={{ flex: 1 }}>
      <PressableScale onPress={onPress} style={styles.card}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor:
                accent === 'gold' ? 'rgba(232,177,79,0.18)' : 'rgba(31,74,61,0.08)',
            },
          ]}
        >
          {icon}
        </View>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#0F1A17',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
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
    fontSize: fontSize.caption - 1,
    textAlign: 'center',
  },
});
