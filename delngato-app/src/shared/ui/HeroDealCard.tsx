import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, fonts, fontSize } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { Badge } from './Badge';

type Props = {
  badge?: string;
  title: ReactNode;
  sub?: ReactNode;
  icon: ReactNode;
  bgFrom?: string;
  bgTo?: string;
  onPress?: () => void;
};

/**
 * HeroDealCard — large dark gradient card used on Home for the daily deal
 * and on Wallet/Payment hero surfaces. Mirrors design-reference hero offer
 * + wallet card structure (gold ring decoration top-right, badge + title +
 * sub on the start, tinted icon circle on the end).
 */
export function HeroDealCard({
  badge,
  title,
  sub,
  icon,
  bgFrom = colors.olive,
  bgTo = colors.olive700,
  onPress,
}: Props) {
  const { flexDirection, pick } = useRtl();
  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={[bgFrom, bgTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.surface}
      >
        <View style={[styles.goldRing, { right: pick(undefined, -30), left: pick(-30, undefined) }]} />
        <View style={[styles.row, { flexDirection }]}>
          <View style={{ flex: 1 }}>
            {badge ? (
              <View style={styles.badgeWrap}>
                <Badge variant="solid-gold">{badge}</Badge>
              </View>
            ) : null}
            {typeof title === 'string' ? (
              <Text style={styles.title}>{title}</Text>
            ) : (
              title
            )}
            {sub ? (
              typeof sub === 'string' ? (
                <Text style={styles.sub}>{sub}</Text>
              ) : (
                sub
              )
            ) : null}
          </View>
          <View style={styles.iconCircle}>{icon}</View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: 14,
    padding: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  goldRing: {
    position: 'absolute',
    top: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(232,177,79,0.18)',
  },
  row: {
    alignItems: 'center',
    gap: 14,
  },
  badgeWrap: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  title: {
    color: colors.canvas,
    fontFamily: fonts.arabicBold,
    fontSize: fontSize.h3 + 2,
    lineHeight: (fontSize.h3 + 2) * 1.25,
  },
  sub: {
    color: 'rgba(250,248,243,0.7)',
    fontFamily: fonts.arabic,
    fontSize: fontSize.caption - 1,
    marginTop: 6,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 100,
    backgroundColor: 'rgba(232,177,79,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
