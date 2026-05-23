import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppBar, Button, Chip, Icon, StickyActionBar, STICKY_CTA_HEIGHT } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useCartStore } from '@/features/cart/store';

const PRESETS = [
  'اتصل بيا قبل ما توصل',
  'سيب الطلب عند البواب',
  'العمارة بيضا، الدور التالت',
  'لو مش لاقي مدخل، خد الجراج',
  'تليفون البيت مش شغّال — كلم الموبايل',
];

const MAX = 200;

export default function DeliveryNotes() {
  const router = useRouter();
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection } = useRtl();
  const stored = useCartStore((s) => s.deliveryNote);
  const setDeliveryNote = useCartStore((s) => s.setDeliveryNote);
  const [note, setNote] = useState(stored);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="ملاحظة للكابتن" onBack={() => safeBack('/checkout')} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 8,
          paddingBottom: STICKY_CTA_HEIGHT + 16,
        }}
      >
        <View
          style={{
            backgroundColor: colors.canvas200,
            borderRadius: 10,
            padding: 12,
            flexDirection,
            gap: 10,
            alignItems: 'center',
          }}
        >
          <Icon.info size={14} color={colors.inkLight} />
          <Text
            style={{
              flex: 1,
              fontFamily: fonts.arabic,
              fontSize: 12,
              color: colors.inkLight,
              lineHeight: 20,
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            أي ملاحظة هتكتبها هتظهر للكابتن وقت التوصيل.
          </Text>
        </View>

        <View style={{ marginTop: 14 }}>
          <TextInput
            autoFocus
            multiline
            value={note}
            onChangeText={(v) => setNote(v.slice(0, MAX))}
            placeholder="مثلاً: العمارة بيضا، الدور التاني"
            placeholderTextColor={colors.inkMute}
            style={{
              minHeight: 140,
              backgroundColor: colors.bgElevated,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: colors.canvas300,
              padding: 14,
              fontFamily: fonts.arabic,
              fontSize: 15,
              color: colors.ink,
              lineHeight: 22,
              textAlign: isRtl ? 'right' : 'left',
              textAlignVertical: 'top',
            }}
          />
          <Text
            style={{
              fontFamily: fonts.arabicMedium,
              fontSize: 11,
              color: colors.inkMute,
              textAlign: 'left',
              marginTop: 4,
            }}
          >
            {arDigits(note.length)} / {arDigits(MAX)}
          </Text>
        </View>

        <Text
          style={{
            fontFamily: fonts.arabicSemiBold,
            fontSize: 12,
            color: colors.inkMute,
            letterSpacing: 0.4,
            marginTop: 18,
            marginBottom: 10,
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          ملاحظات جاهزة
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {PRESETS.map((p) => (
            <Chip key={p} onPress={() => setNote(p.slice(0, MAX))}>
              {p}
            </Chip>
          ))}
        </View>
      </ScrollView>

      <StickyActionBar>
        <Button
          variant="primary"
          size="lg"
          full
          onPress={() => {
            setDeliveryNote(note);
            router.back();
          }}
        >
          حفظ الملاحظة
        </Button>
      </StickyActionBar>
    </View>
  );
}
