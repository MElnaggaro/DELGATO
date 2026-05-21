import { type ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { colors, fonts } from '@/shared/theme';
import { Button } from './Button';

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
 * Brand confirm dialog matching design reference's .ConfirmDialog:
 *   - white surface, 16px radius, max-width 320, scrim 48% ink
 *   - title 17/700, body 14 light, 1.5 line-height
 *   - Cancel + Confirm row, flex 1 each, 44 min-height
 *   - destructive=true → red confirm
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
            backgroundColor: colors.bgElevated,
            borderRadius: 16,
            padding: 20,
            gap: 8,
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
                  includeFontPadding: false,
                }}
              >
                {body}
              </Text>
            ) : (
              body
            )
          ) : null}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            {cancelLabel ? (
              <View style={{ flex: 1 }}>
                <Button variant="secondary" full onPress={onCancel}>
                  {cancelLabel}
                </Button>
              </View>
            ) : null}
            <View style={{ flex: 1 }}>
              <Button
                variant={destructive ? 'primary' : 'primary'}
                full
                onPress={onConfirm}
                style={
                  destructive
                    ? { backgroundColor: colors.statusIssue, borderColor: colors.statusIssue }
                    : undefined
                }
              >
                {confirmLabel}
              </Button>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
