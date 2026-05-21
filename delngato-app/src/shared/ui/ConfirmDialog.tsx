import { type ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { colors, fonts } from '@/shared/theme';

type Props = {
  visible: boolean;
  title: string;
  body?: ReactNode;
  /** Default 'إلغاء'. Hidden when null. */
  cancelLabel?: string | null;
  confirmLabel: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Matches design reference `.dl-dialog`:
 *   - scrim rgba(15,26,23,0.48)
 *   - surface canvas (not white), 16px radius, max 320, padding 20
 *   - title 17/700, body 14 light, 1.5 line-height
 *   - buttons row: 8px gap, flex 1 each, min-height 44, radius 10, weight 600
 *   - Cancel: bg canvas-200, color ink
 *   - Confirm: bg olive (or #C53B2C destructive), color canvas
 */
export function ConfirmDialog({
  visible,
  title,
  body,
  cancelLabel = 'إلغاء',
  confirmLabel,
  destructive,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: 'rgba(15,26,23,0.48)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 320,
            backgroundColor: colors.canvas,
            borderRadius: 16,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.arabicBold,
              fontSize: 17,
              color: colors.ink,
              includeFontPadding: false,
            }}
          >
            {title}
          </Text>
          {body ? (
            typeof body === 'string' ? (
              <Text
                style={{
                  fontFamily: fonts.arabic,
                  fontSize: 14,
                  color: colors.inkLight,
                  lineHeight: 14 * 1.5,
                  marginTop: 8,
                  includeFontPadding: false,
                }}
              >
                {body}
              </Text>
            ) : (
              <View style={{ marginTop: 8 }}>{body}</View>
            )
          ) : null}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
            {cancelLabel ? (
              <Pressable
                onPress={onCancel}
                style={({ pressed }) => ({
                  flex: 1,
                  minHeight: 44,
                  borderRadius: 10,
                  backgroundColor: pressed ? colors.canvas300 : colors.canvas200,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 12,
                })}
              >
                <Text
                  style={{
                    fontFamily: fonts.arabicSemiBold,
                    fontSize: 15,
                    color: colors.ink,
                    includeFontPadding: false,
                  }}
                >
                  {cancelLabel}
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => {
                const base = destructive ? colors.statusIssue : colors.olive;
                const pressedBg = destructive ? '#A1271C' : colors.olive700;
                return {
                  flex: 1,
                  minHeight: 44,
                  borderRadius: 10,
                  backgroundColor: pressed ? pressedBg : base,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 12,
                };
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.arabicSemiBold,
                  fontSize: 15,
                  color: colors.canvas,
                  includeFontPadding: false,
                }}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
