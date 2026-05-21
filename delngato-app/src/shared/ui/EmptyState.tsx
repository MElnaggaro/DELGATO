import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { colors, fonts } from '@/shared/theme';

type Props = {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, body, action }: Props) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingVertical: 40,
        gap: 14,
      }}
    >
      {icon ? (
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 100,
            backgroundColor: colors.canvas200,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
      ) : null}
      <Text
        style={{
          fontFamily: fonts.arabicBold,
          fontSize: 17,
          color: colors.ink,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {body ? (
        <Text
          style={{
            fontFamily: fonts.arabic,
            fontSize: 14,
            lineHeight: 22,
            color: colors.inkLight,
            textAlign: 'center',
            maxWidth: 280,
          }}
        >
          {body}
        </Text>
      ) : null}
      {action}
    </View>
  );
}
