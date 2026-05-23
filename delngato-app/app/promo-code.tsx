import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  AppBar,
  Button,
  Icon,
  StickyActionBar,
  STICKY_CTA_HEIGHT,
  showToast,
  Spinner,
} from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { DEALS } from '@/features/catalog/data';
import { useCartStore } from '@/features/cart/store';

type Status = 'idle' | 'checking' | 'ok' | 'invalid';

export default function PromoCode() {
  const router = useRouter();
  const { isRtl, flexDirection } = useRtl();
  const appliedPromo = useCartStore((s) => s.appliedPromo);
  const setAppliedPromo = useCartStore((s) => s.setAppliedPromo);
  const [code, setCode] = useState(appliedPromo?.code ?? '');
  const [status, setStatus] = useState<Status>(appliedPromo ? 'ok' : 'idle');

  const tryCode = () => {
    setStatus('checking');
    setTimeout(() => {
      const known = DEALS.find((d) => d.code.toUpperCase() === code.trim().toUpperCase());
      if (known) {
        setStatus('ok');
        setAppliedPromo({
          code: known.code,
          title: known.title,
          value: known.value,
          shopId: known.shopId,
        });
        showToast(`اتفعّل كود ${known.code}`, <Icon.tag size={16} color={colors.gold} />);
      } else {
        setStatus('invalid');
      }
    }, 700);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="كود الخصم" onBack={() => safeBack('/checkout')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: STICKY_CTA_HEIGHT + 16 }}>
        <View style={{ position: 'relative', marginTop: 8 }}>
          <TextInput
            value={code}
            onChangeText={(v) => {
              setCode(v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12));
              setStatus('idle');
            }}
            placeholder="DLN10"
            placeholderTextColor={colors.inkMute}
            autoFocus
            autoCapitalize="characters"
            style={{
              minHeight: 56,
              backgroundColor: colors.bgElevated,
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: status === 'ok' ? colors.olive : colors.canvas300,
              paddingHorizontal: 14,
              paddingEnd: 110,
              fontFamily: fonts.arabicBold,
              fontSize: 18,
              color: colors.ink,
              letterSpacing: 2.5,
              textAlign: 'left',
              writingDirection: 'ltr',
            }}
          />
          <Pressable
            onPress={tryCode}
            disabled={code.length < 3 || status === 'checking' || status === 'ok'}
            style={{
              position: 'absolute',
              insetInlineEnd: 6,
              top: 6,
              minHeight: 44,
              paddingHorizontal: 14,
              borderRadius: 8,
              backgroundColor: code.length < 3 ? colors.canvas300 : colors.olive,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: code.length < 3 ? 0.6 : 1,
            }}
          >
            {status === 'checking' ? (
              <Spinner size={16} color={colors.canvas} />
            ) : status === 'ok' ? (
              <Icon.check size={16} color={colors.canvas} />
            ) : (
              <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.canvas }}>
                تطبيق
              </Text>
            )}
          </Pressable>
        </View>

        {status === 'ok' ? (
          <FadeUp delay={80} style={{ marginTop: 14 }}>
            <View
              style={{
                backgroundColor: 'rgba(31,74,61,0.08)',
                borderRadius: 12,
                padding: 14,
                flexDirection,
                alignItems: 'center',
                gap: 10,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: colors.olive,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.check size={18} color={colors.canvas} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.arabicBold, fontSize: 14, color: colors.olive }}>
                  اتفعّل الكود
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.arabic,
                    fontSize: 12,
                    color: colors.inkLight,
                    marginTop: 2,
                  }}
                >
                  {appliedPromo?.title} · {appliedPromo?.value}
                </Text>
              </View>
            </View>
          </FadeUp>
        ) : null}

        {status === 'invalid' ? (
          <FadeUp delay={80} style={{ marginTop: 14 }}>
            <View
              style={{
                backgroundColor: 'rgba(197,59,44,0.08)',
                borderRadius: 12,
                padding: 14,
                flexDirection,
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Icon.info size={18} color={colors.statusIssueText} />
              <Text
                style={{
                  flex: 1,
                  fontFamily: fonts.arabicMedium,
                  fontSize: 13,
                  color: colors.statusIssueText,
                  lineHeight: 20,
                }}
              >
                الكود غلط أو منتهي. اتأكد من الكتابة وحاول تاني.
              </Text>
            </View>
          </FadeUp>
        ) : null}

        <Text
          style={{
            fontFamily: fonts.arabicSemiBold,
            fontSize: 12,
            color: colors.inkMute,
            letterSpacing: 0.4,
            marginTop: 24,
            marginBottom: 10,
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          أكواد متاحة ليك
        </Text>

        <View style={{ gap: 10 }}>
          {DEALS.slice(0, 4).map((d) => (
            <Pressable
              key={d.id}
              onPress={() => {
                setCode(d.code);
                setStatus('idle');
              }}
              style={({ pressed }) => ({
                backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.canvas300,
                borderStyle: 'dashed',
                flexDirection,
                alignItems: 'center',
                gap: 12,
              })}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: colors.canvas200,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.tag size={18} color={colors.olive} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.arabicBold, fontSize: 13.5, color: colors.ink }}>
                  {d.title}
                </Text>
                <Text style={{ fontFamily: fonts.arabic, fontSize: 11, color: colors.inkLight }}>
                  {d.sub}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: colors.canvas200,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.arabicBold,
                    fontSize: 12,
                    color: colors.olive,
                    letterSpacing: 1.2,
                  }}
                >
                  {d.code}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <StickyActionBar>
        <Button
          variant="primary"
          size="lg"
          full
          disabled={status !== 'ok'}
          onPress={() => router.back()}
        >
          {status === 'ok' ? 'استخدم الكود' : 'متابعة'}
        </Button>
      </StickyActionBar>
    </View>
  );
}
