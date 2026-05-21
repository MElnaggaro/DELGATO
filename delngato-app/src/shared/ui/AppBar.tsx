import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts } from '@/shared/theme';
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
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.canvas }}>
      <View
        style={{
          minHeight: 56,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="رجوع"
            onPress={onBack}
            hitSlop={12}
            style={{ padding: 6 }}
          >
            <IconBack size={24} color={colors.ink} />
          </Pressable>
        ) : (
          <View style={{ width: 36 }} />
        )}
        <View style={{ flex: 1, alignItems: 'center' }}>
          {title ? (
            <Text
              numberOfLines={1}
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: 16,
                color: colors.ink,
              }}
            >
              {title}
            </Text>
          ) : null}
        </View>
        <View style={{ minWidth: 36, alignItems: 'flex-end' }}>{trailing}</View>
      </View>
    </SafeAreaView>
  );
}
