import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  AppBar,
  Button,
  CheckboxRow,
  Chip,
  Icon,
  StickyActionBar,
  STICKY_CTA_HEIGHT,
  SuccessRing,
} from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useOrdersStore } from '@/features/orders/store';

const ITEMS = [
  { name: 'لبن جهينة', qty: 2, price: 64 },
  { name: 'بيض بلدي', qty: 1, price: 145 },
  { name: 'خبز فينو', qty: 3, price: 36 },
];

const REASONS = ['منتج تالف', 'منتج ناقص', 'منتج غلط', 'منتج منتهي الصلاحية', 'تغليف ضعيف'];

export default function Refund() {
  const router = useRouter();
  const arDigits = useArabicDigits();
  const { isRtl } = useRtl();
  const params = useLocalSearchParams<{ id?: string }>();
  const requestRefund = useOrdersStore((s) => s.requestRefund);

  const [selected, setSelected] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [photos, setPhotos] = useState<number[]>([]);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const refundTotal = ITEMS.filter((it) => selected.includes(it.name)).reduce(
    (s, it) => s + it.price,
    0,
  );

  if (submittedId) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, paddingHorizontal: 28 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22 }}>
          <SuccessRing />
          <FadeUp delay={380} style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.arabicBold, fontSize: 24, color: colors.ink }}>
              وصلنا طلب الاسترجاع
            </Text>
            <Text
              style={{
                fontFamily: fonts.arabic,
                fontSize: 14,
                color: colors.inkLight,
                marginTop: 10,
                lineHeight: 22,
                textAlign: 'center',
                maxWidth: 300,
              }}
            >
              فريقنا هيراجع الطلب ويرد عليك خلال ٢٤ ساعة. لو اتقبل، الفلوس هترجع على نفس طريقة الدفع.
            </Text>
          </FadeUp>
          <FadeUp delay={520}>
            <View
              style={{
                backgroundColor: colors.canvas200,
                borderRadius: 10,
                paddingHorizontal: 16,
                paddingVertical: 12,
                flexDirection: 'row',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <Icon.receipt size={16} color={colors.olive} />
              <Text style={{ fontFamily: fonts.arabic, fontSize: 13, color: colors.ink }}>
                رقم البلاغ
              </Text>
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 14, color: colors.olive }}>
                {submittedId}
              </Text>
            </View>
          </FadeUp>
        </View>
        <View style={{ paddingBottom: 28 }}>
          <Button variant="primary" full onPress={() => router.replace('/(tabs)/orders')}>
            تم
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="طلب استرجاع" onBack={() => safeBack('/order-detail')} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: STICKY_CTA_HEIGHT + 16 }}
      >
        <SectionLabel>المنتجات اللي عايز ترجعها</SectionLabel>
        <View style={{ gap: 8 }}>
          {ITEMS.map((it) => {
            const sel = selected.includes(it.name);
            return (
              <CheckboxRow
                key={it.name}
                checked={sel}
                onToggle={() =>
                  setSelected((p) =>
                    p.includes(it.name) ? p.filter((x) => x !== it.name) : [...p, it.name],
                  )
                }
                label={`${arDigits(it.qty)}× ${it.name}`}
                trailing={
                  <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.ink }}>
                    {arDigits(it.price)} ج.م
                  </Text>
                }
              />
            );
          })}
        </View>

        <SectionLabel style={{ marginTop: 20 }}>سبب الاسترجاع</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {REASONS.map((r) => (
            <Chip key={r} active={reason === r} onPress={() => setReason(r)}>
              {r}
            </Chip>
          ))}
        </View>

        <SectionLabel style={{ marginTop: 20 }}>
          صور توضّح المشكلة{' '}
          <Text style={{ fontFamily: fonts.arabic, color: colors.inkLight }}>(اختياري)</Text>
        </SectionLabel>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[0, 1, 2].map((i) => {
            const has = photos.includes(i);
            return (
              <Pressable
                key={i}
                onPress={() => setPhotos((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]).slice(0, 3))}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 10,
                  backgroundColor: has ? colors.canvas200 : colors.bgElevated,
                  borderWidth: 1.5,
                  borderColor: colors.canvas300,
                  borderStyle: 'dashed',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {has ? (
                  <Icon.check size={20} color={colors.olive} />
                ) : (
                  <Icon.plus size={20} color={colors.inkLight} />
                )}
              </Pressable>
            );
          })}
        </View>

        {selected.length > 0 ? (
          <FadeUp delay={80} style={{ marginTop: 22 }}>
            <View
              style={{
                backgroundColor: 'rgba(31,74,61,0.06)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 13, color: colors.inkLight }}>
                مبلغ الاسترجاع المتوقع
              </Text>
              <Text style={{ fontFamily: fonts.arabicBold, fontSize: 20, color: colors.olive }}>
                {arDigits(refundTotal)}{' '}
                <Text
                  style={{
                    fontFamily: fonts.arabicMedium,
                    fontSize: 12,
                    color: colors.inkLight,
                  }}
                >
                  ج.م
                </Text>
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
          disabled={selected.length === 0 || !reason}
          onPress={() => {
            const rfd = requestRefund(params.id ?? 'DLN-٢٠٤٧', selected, reason, photos.length);
            setSubmittedId(rfd.id);
          }}
        >
          إرسال الطلب
        </Button>
      </StickyActionBar>
    </View>
  );
}

function SectionLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: { marginTop?: number };
}) {
  const { isRtl } = useRtl();
  return (
    <Text
      style={{
        fontFamily: fonts.arabicSemiBold,
        fontSize: 12,
        color: colors.inkMute,
        letterSpacing: 0.4,
        marginBottom: 10,
        textAlign: isRtl ? 'right' : 'left',
        ...style,
      }}
    >
      {children}
    </Text>
  );
}
