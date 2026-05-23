import { useRef, useState } from 'react';
import { PanResponder, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { AppBar, Button, Card, Icon, MapMock, StickyActionBar, STICKY_CTA_HEIGHT } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';

export default function MapPin() {
  const router = useRouter();
  const { isRtl, flexDirection } = useRtl();
  const [pos, setPos] = useState({ x: 180, y: 110 });
  const mapH = 360;
  const mapW = useRef(340);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        setPos({
          x: Math.max(24, Math.min(mapW.current - 24, gesture.moveX - 18)),
          y: Math.max(40, Math.min(mapH - 24, gesture.moveY - 100)),
        });
      },
    }),
  ).current;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="حدد على الخريطة" onBack={() => safeBack('/(onboarding)/address-setup')} />

      <ScrollView contentContainerStyle={{ paddingBottom: STICKY_CTA_HEIGHT + 16 }}>
        <View
          {...responder.panHandlers}
          onLayout={(e) => (mapW.current = e.nativeEvent.layout.width)}
          style={{ marginHorizontal: 18, position: 'relative' }}
        >
          <MapMock height={mapH} />
          {/* Draggable pin */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: pos.x - 22,
              top: pos.y - 56,
              width: 44,
              height: 56,
            }}
          >
            <Svg width={44} height={56} viewBox="0 0 44 56">
              <Path
                d="M22 0C12.06 0 4 8.06 4 18c0 14 18 38 18 38s18-24 18-38c0-9.94-8.06-18-18-18z"
                fill={colors.olive}
              />
              <Path d="M22 11 a7 7 0 1 1 0 14 a7 7 0 1 1 0 -14" fill={colors.canvas} />
            </Svg>
          </View>
          {/* Recenter */}
          <Pressable
            onPress={() => setPos({ x: mapW.current / 2, y: mapH / 2 })}
            style={{
              position: 'absolute',
              insetInlineEnd: 12,
              bottom: 12,
              width: 44,
              height: 44,
              borderRadius: 100,
              backgroundColor: colors.bgElevated,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.14,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <Icon.navigation size={18} color={colors.olive} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
          <Text
            style={{
              fontFamily: fonts.arabicSemiBold,
              fontSize: 12,
              color: colors.inkMute,
              letterSpacing: 0.4,
              marginBottom: 8,
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            العنوان المكتشف
          </Text>
          <Card padding={14}>
            <View style={{ flexDirection, alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: 'rgba(31,74,61,0.08)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon.pin size={18} color={colors.olive} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: fonts.arabicSemiBold,
                    fontSize: 14,
                    color: colors.ink,
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  شارع الجلاء
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.arabic,
                    fontSize: 12,
                    color: colors.inkLight,
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  بجوار صيدلية مصر · الدلنجات
                </Text>
              </View>
            </View>
          </Card>

          <View style={{ flexDirection, gap: 10, marginTop: 12, alignItems: 'flex-start' }}>
            <Icon.info size={14} color={colors.inkLight} />
            <Text
              style={{
                flex: 1,
                fontFamily: fonts.arabic,
                fontSize: 12,
                color: colors.inkLight,
                lineHeight: 18,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              حرّك الدبوس على المكان بالظبط — هيساعد الكابتن يلاقيك أسرع.
            </Text>
          </View>
        </View>
      </ScrollView>

      <StickyActionBar>
        <Button variant="primary" size="lg" full onPress={() => router.back()}>
          أكّد المكان
        </Button>
      </StickyActionBar>
    </View>
  );
}
