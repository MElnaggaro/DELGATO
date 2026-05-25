import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  AppBar,
  Button,
  ConfirmDialog,
  Icon,
  RadioRow,
  StickyActionBar,
  STICKY_CTA_HEIGHT,
  showToast,
} from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { getContainer } from '@/infrastructure/container';

const REASONS = [
  'غلطت في الطلب',
  'هطلب من محل تاني',
  'التوصيل بياخد وقت طويل',
  'تغيرت ظروفي',
  'سبب تاني',
] as const;

export default function CancelOrder() {
  const router = useRouter();
  const { isRtl } = useRtl();
  const params = useLocalSearchParams<{ id?: string }>();

  const [reason, setReason] = useState<string>(REASONS[0]);
  const [detail, setDetail] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!params.id) return;
    setConfirm(false);
    setLoading(true);
    try {
      const finalReason = reason === 'سبب تاني' ? detail : reason;
      await getContainer().orderRepo.cancel(params.id, finalReason || 'بدون سبب', 'customer');
      showToast('اتلغى الطلب', <Icon.x size={16} color={colors.gold} />);
      router.replace('/(tabs)/orders');
    } catch (e) {
      showToast('حدث خطأ، حاول مرة أخرى', <Icon.info size={16} color={colors.statusIssueText} />);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="إلغاء الطلب" onBack={() => safeBack('/order-detail')} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: STICKY_CTA_HEIGHT + 16 }}
      >
        <FadeUp>
          <View
            style={{
              backgroundColor: 'rgba(232,177,79,0.10)',
              borderRadius: 12,
              padding: 14,
              marginBottom: 16,
              flexDirection: 'row',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'rgba(232,177,79,0.3)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.info size={16} color={colors.statusPendingText} />
            </View>
            <Text
              style={{
                flex: 1,
                fontFamily: fonts.arabic,
                fontSize: 13,
                color: colors.ink,
                lineHeight: 21,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              <Text style={{ fontFamily: fonts.arabicBold }}>قبل ما تلغي:</Text> لو الكابتن استلم الطلب،
              ممكن نحوّل لإلغاء جزئي وتدفع رسوم بسيطة لتعويض الكابتن.
            </Text>
          </View>
        </FadeUp>

        <Text
          style={{
            fontFamily: fonts.arabicSemiBold,
            fontSize: 12,
            color: colors.inkMute,
            letterSpacing: 0.4,
            marginBottom: 10,
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          سبب الإلغاء
        </Text>

        <View style={{ gap: 8 }}>
          {REASONS.map((r) => (
            <RadioRow key={r} selected={reason === r} onPress={() => setReason(r)} label={r} />
          ))}
        </View>

        {reason === 'سبب تاني' ? (
          <FadeUp delay={80} style={{ marginTop: 14 }}>
            <TextInput
              value={detail}
              onChangeText={setDetail}
              multiline
              placeholder="اكتب السبب بالتفصيل"
              placeholderTextColor={colors.inkMute}
              style={{
                minHeight: 88,
                backgroundColor: colors.bgElevated,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: colors.canvas300,
                padding: 12,
                fontFamily: fonts.arabic,
                fontSize: 14,
                color: colors.ink,
                textAlign: isRtl ? 'right' : 'left',
                textAlignVertical: 'top',
              }}
            />
          </FadeUp>
        ) : null}
      </ScrollView>

      <StickyActionBar style={{ flexDirection: 'row', gap: 10 }}>
        <Button variant="ghost" style={{ flex: 1 }} onPress={() => router.back()} disabled={loading}>
          رجوع
        </Button>
        <Button variant="destructive" style={{ flex: 1 }} onPress={() => setConfirm(true)} disabled={loading}>
          أكّد الإلغاء
        </Button>
      </StickyActionBar>

      <ConfirmDialog
        visible={confirm}
        title="متأكد من إلغاء الطلب؟"
        body="مش هتقدر ترجع في القرار. الطلب هيتلغي على طول."
        cancelLabel="تراجع"
        confirmLabel="إلغاء الطلب"
        destructive
        onCancel={() => setConfirm(false)}
        onConfirm={handleCancel}
      />
    </View>
  );
}

