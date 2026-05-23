import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppBar, Button, Icon, StickyActionBar, STICKY_CTA_HEIGHT, showToast } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { useCartStore } from '@/features/cart/store';

type Day = { k: string; l: string; sub: string };

const DAYS: Day[] = [
  { k: 'today', l: 'اليوم', sub: 'الأحد' },
  { k: 'tom', l: 'بكرة', sub: 'الاتنين' },
  { k: 'd2', l: 'بعد بكرة', sub: 'التلات' },
  { k: 'd3', l: '٣١ يناير', sub: 'الأربع' },
];

const SLOTS = ['٤–٥ م', '٥–٦ م', '٦–٧ م', '٧–٨ م', '٨–٩ م', '٩–١٠ م'];
const TAKEN_INDEX = 2;

export default function ScheduledDelivery() {
  const router = useRouter();
  const { isRtl, flexDirection } = useRtl();
  const stored = useCartStore((s) => s.scheduled);
  const setScheduled = useCartStore((s) => s.setScheduled);
  const [day, setDay] = useState(stored?.day ?? 'today');
  const [slot, setSlot] = useState(stored?.slot ?? SLOTS[1]!);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="جدول التوصيل" onBack={() => safeBack('/checkout')} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 4,
          paddingBottom: STICKY_CTA_HEIGHT + 16,
        }}
      >
        <FadeUp>
          <View
            style={{
              backgroundColor: 'rgba(232,177,79,0.10)',
              borderRadius: 12,
              padding: 12,
              flexDirection,
              gap: 10,
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(232,177,79,0.3)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.clock size={18} color={colors.statusPendingText} />
            </View>
            <Text
              style={{
                flex: 1,
                fontFamily: fonts.arabic,
                fontSize: 12.5,
                color: colors.inkLight,
                lineHeight: 20,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              اختار وقت يناسبك من ٤ م لـ ١٠ م. هنبعت طلبك في الوقت المحدد بالظبط.
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
          اليوم
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 6 }}
          style={{ marginBottom: 16 }}
        >
          {DAYS.map((d) => {
            const active = day === d.k;
            return (
              <Pressable
                key={d.k}
                onPress={() => setDay(d.k)}
                style={{
                  minWidth: 80,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: active ? colors.olive : colors.bgElevated,
                  borderWidth: active ? 0 : 1.5,
                  borderColor: colors.canvas300,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.arabic,
                    fontSize: 11,
                    color: active ? 'rgba(250,248,243,0.7)' : colors.inkLight,
                    marginBottom: 4,
                  }}
                >
                  {d.sub}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.arabicBold,
                    fontSize: 14,
                    color: active ? colors.canvas : colors.ink,
                  }}
                >
                  {d.l}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

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
          الوقت
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {SLOTS.map((s, i) => {
            const taken = i === TAKEN_INDEX;
            const active = slot === s && !taken;
            return (
              <Pressable
                key={s}
                onPress={() => !taken && setSlot(s)}
                disabled={taken}
                style={{
                  width: '31.6%',
                  paddingVertical: 14,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor: active ? colors.olive : taken ? colors.canvas200 : colors.bgElevated,
                  borderWidth: active ? 0 : 1.5,
                  borderColor: colors.canvas300,
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.arabicSemiBold,
                    fontSize: 14,
                    color: active ? colors.canvas : taken ? colors.inkMute : colors.ink,
                    textDecorationLine: taken ? 'line-through' : 'none',
                  }}
                >
                  {s}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <StickyActionBar>
        <Button
          variant="primary"
          size="lg"
          full
          onPress={() => {
            const dayObj = DAYS.find((d) => d.k === day)!;
            setScheduled({ day, daySub: dayObj.sub, slot });
            showToast(
              `اتجدول الطلب · ${dayObj.l} ${slot}`,
              <Icon.clock size={16} color={colors.gold} />,
            );
            router.back();
          }}
        >
          تأكيد الموعد
        </Button>
      </StickyActionBar>
    </View>
  );
}
