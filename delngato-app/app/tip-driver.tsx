import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  AppBar,
  Button,
  FieldLabel,
  Icon,
  StickyActionBar,
  STICKY_CTA_HEIGHT,
  showToast,
} from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useCartStore } from '@/features/cart/store';

const PRESETS = [0, 5, 10, 15, 20] as const;

export default function TipDriver() {
  const router = useRouter();
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection } = useRtl();
  const stored = useCartStore((s) => s.tip);
  const setStoredTip = useCartStore((s) => s.setTip);
  const [tip, setTip] = useState(stored);
  const [custom, setCustom] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="إكرامية الكابتن" onBack={() => safeBack('/checkout')} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingBottom: STICKY_CTA_HEIGHT + 16,
        }}
      >
        <View style={{ alignItems: 'center', paddingTop: 14, paddingBottom: 24 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 100,
              backgroundColor: colors.olive,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            <Text style={{ fontFamily: fonts.arabicBold, fontSize: 36, color: colors.canvas }}>
              م
            </Text>
          </View>
          <Text style={{ fontFamily: fonts.arabicBold, fontSize: 18, color: colors.ink }}>
            محمود السيد
          </Text>
          <Text
            style={{
              fontFamily: fonts.arabic,
              fontSize: 13,
              color: colors.inkLight,
              marginTop: 6,
              lineHeight: 20,
              textAlign: 'center',
              maxWidth: 280,
            }}
          >
            ساب شغله علشان يوصلك طلبك في الوقت. الإكرامية بتروحله ١٠٠٪.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {PRESETS.map((o) => {
            const active = tip === o && !custom;
            return (
              <Pressable
                key={o}
                onPress={() => {
                  setTip(o);
                  setCustom('');
                }}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: active ? colors.olive : colors.bgElevated,
                  borderWidth: active ? 0 : 1.5,
                  borderColor: colors.canvas300,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.arabicBold,
                    fontSize: 16,
                    color: active ? colors.canvas : colors.ink,
                  }}
                >
                  {o === 0 ? 'بلا' : arDigits(o)}
                </Text>
                {o > 0 ? (
                  <Text
                    style={{
                      fontFamily: fonts.arabic,
                      fontSize: 10,
                      color: active ? 'rgba(250,248,243,0.7)' : colors.inkLight,
                      marginTop: 2,
                    }}
                  >
                    ج.م
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <FieldLabel label="مبلغ مخصص" style={{ marginTop: 18 }}>
          <View style={{ position: 'relative' }}>
            <TextInput
              value={custom}
              onChangeText={(v) => {
                const cleaned = v.replace(/[^0-9]/g, '');
                setCustom(cleaned);
                setTip(parseInt(cleaned, 10) || 0);
              }}
              placeholder="٢٥"
              placeholderTextColor={colors.inkMute}
              inputMode="numeric"
              keyboardType="number-pad"
              style={{
                minHeight: 56,
                backgroundColor: colors.bgElevated,
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor: colors.canvas300,
                paddingHorizontal: 14,
                paddingEnd: 48,
                fontFamily: fonts.arabicBold,
                fontSize: 17,
                color: colors.ink,
                textAlign: 'left',
                writingDirection: 'ltr',
              }}
            />
            <Text
              style={{
                position: 'absolute',
                insetInlineEnd: 14,
                top: 0,
                bottom: 0,
                textAlignVertical: 'center',
                fontFamily: fonts.arabicMedium,
                fontSize: 13,
                color: colors.inkLight,
                lineHeight: 56,
              }}
            >
              ج.م
            </Text>
          </View>
        </FieldLabel>

        {tip > 0 ? (
          <FadeUp delay={80} style={{ marginTop: 18 }}>
            <View
              style={{
                backgroundColor: 'rgba(31,74,61,0.06)',
                borderRadius: 10,
                padding: 12,
                flexDirection,
                gap: 10,
                alignItems: 'center',
              }}
            >
              <Icon.heart size={16} color={colors.olive} />
              <Text
                style={{
                  flex: 1,
                  fontFamily: fonts.arabic,
                  fontSize: 13,
                  color: colors.inkLight,
                  textAlign: isRtl ? 'right' : 'left',
                  lineHeight: 20,
                }}
              >
                هتدّي محمود{' '}
                <Text style={{ fontFamily: fonts.arabicBold, color: colors.olive }}>
                  {arDigits(tip)} ج.م
                </Text>{' '}
                إكرامية. شكراً ليك.
              </Text>
            </View>
          </FadeUp>
        ) : null}
      </ScrollView>

      <StickyActionBar>
        <Button
          variant="primary"
          size="lg"
          full
          onPress={() => {
            setStoredTip(tip);
            if (tip > 0) {
              showToast('شكراً — اتسجّلت الإكرامية', <Icon.heart size={16} color={colors.gold} />);
            }
            router.back();
          }}
        >
          {tip > 0 ? `تأكيد · ${arDigits(tip)} ج.م` : 'تخطي'}
        </Button>
      </StickyActionBar>
    </View>
  );
}
