import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppBar, MapMock, ShopCard } from '@/shared/ui';
import { FadeUp, Rise } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { SHOPS } from '@/features/catalog/data';

type View_ = 'list' | 'map';

const MARKERS = [
  { x: 95, y: 60, letter: 'أ', shopId: 'abuhassan' },
  { x: 180, y: 90, letter: 'ن', shopId: 'noor' },
  { x: 240, y: 50, letter: 'م', shopId: 'masry' },
  { x: 140, y: 150, letter: 'خ', shopId: 'khodar' },
  { x: 290, y: 125, letter: 'ح', shopId: 'halawa' },
];

export default function Nearby() {
  const router = useRouter();
  const arDigits = useArabicDigits();
  const { isRtl } = useRtl();
  const [view, setView] = useState<View_>('list');

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar
        title="محلات قريبة منك"
        onBack={() => safeBack('/(tabs)/home')}
        trailing={
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.canvas200,
              borderRadius: 100,
              padding: 3,
            }}
          >
            {(['list', 'map'] as const).map((v) => {
              const active = view === v;
              return (
                <Pressable
                  key={v}
                  onPress={() => setView(v)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 100,
                    backgroundColor: active ? colors.bgElevated : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.arabicSemiBold,
                      fontSize: 12,
                      color: active ? colors.ink : colors.inkLight,
                    }}
                  >
                    {v === 'list' ? 'قائمة' : 'خريطة'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        }
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 4, paddingBottom: 28 }}>
        {view === 'map' ? (
          <FadeUp style={{ marginBottom: 16 }}>
            <MapMock
              height={220}
              markers={MARKERS.map((m) => ({
                ...m,
                onPress: () => {
                  const sh = SHOPS.find((s) => s.id === m.shopId);
                  if (sh) router.push({ pathname: '/shop', params: { id: sh.id } });
                },
              }))}
            />
          </FadeUp>
        ) : null}

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
          {arDigits(SHOPS.length)} محل · مرتب بالأقرب
        </Text>

        <View style={{ gap: 10 }}>
          {SHOPS.map((s, i) => (
            <Rise key={s.id} delay={i * 30}>
              <ShopCard shop={s} onPress={() => router.push({ pathname: '/shop', params: { id: s.id } })} />
            </Rise>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
