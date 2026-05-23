import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { IconBack } from './Icon';

type Props = {
  title?: string;
  onBack?: () => void;
  trailing?: ReactNode;
};

/**
 * Top app bar. 56pt content height + safe-area top inset. Back chevron
 * picks the visually-correct glyph for the current direction (right-pointing
 * in RTL). No bottom border by default; cards underneath provide separation.
 */
export function AppBar({ title, onBack, trailing }: Props) {
  const { isRtl, flexDirection } = useRtl();
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.canvas }}>
      <View
        style={{
          minHeight: 56,
          paddingHorizontal: 18,
          flexDirection,
          alignItems: 'center',
          gap: 12,
        }}
      >
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="رجوع"
            onPress={onBack}
            hitSlop={12}
            style={{ padding: 6, marginStart: -6 }}
          >
            <IconBack size={24} color={colors.ink} />
          </Pressable>
        ) : null}
        <View style={{ flex: 1, minWidth: 0 }}>
          {title ? (
            <Text
              numberOfLines={1}
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: 18,
                color: colors.ink,
                textAlign: 'left',
                includeFontPadding: false,
              }}
            >
              {title}
            </Text>
          ) : null}
        </View>
        {trailing ? (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {trailing}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
