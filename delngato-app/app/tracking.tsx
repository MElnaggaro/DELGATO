import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppBar, Button, Card, Icon, LiveDot, OrderProgress } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { ease } from '@/shared/motion';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const MONO_FAMILY = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

type Step = 0 | 1 | 2 | 3;

const STATUS_HEAD = ['received', 'preparing', 'onTheWay', 'delivered'] as const;
const ETA = ['0', '1', '2', '3'] as const;

const ORDER_ITEMS = [
  { name: 'لبن جهينة', qty: 2, price: 64 },
  { name: 'بيض بلدي', qty: 1, price: 145 },
  { name: 'خبز فينو', qty: 3, price: 36 },
] as const;

export default function Tracking() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isRtl, flexDirection, pick } = useRtl();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const orderId = params.orderId ?? 'DLN-٢٠٤٧';
  const [step, setStep] = useState<Step>(1);

  // Animate the dashed delivery route once on mount.
  const routeProgress = useSharedValue(220);
  useEffect(() => {
    routeProgress.value = withTiming(0, { duration: 1400, easing: ease.out });
  }, [routeProgress]);

  const routeAnimProps = useAnimatedProps(() => ({
    strokeDashoffset: routeProgress.value,
  }));

  useEffect(() => {
    if (step >= 3) return;
    const id = setTimeout(() => setStep((s) => Math.min(3, s + 1) as Step), 5000);
    return () => clearTimeout(id);
  }, [step]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar
        title={t('tracking.title')}
        onBack={() => safeBack('/(tabs)/orders')}
        trailing={
          <Pressable
            onPress={() =>
              void Share.share({
                message: `تتبع طلبي على دلنجاتُو — ${orderId}`,
              })
            }
            accessibilityLabel="مشاركة الطلب"
            hitSlop={6}
            style={{ padding: 6 }}
          >
            <Icon.share size={22} color={colors.ink} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Map placeholder — SVG canvas mirroring design-reference Cart.jsx Tracking map.
            Roads (cream lines), dashed delivery path, origin (gold) + destination (olive) pins,
            courier marker positioned along the path by step. */}
        <View style={{ marginHorizontal: 18, paddingTop: 0 }}>
          <View
            style={{
              height: 240,
              borderRadius: 14,
              backgroundColor: '#E2DAC2',
              borderWidth: 1,
              borderColor: colors.canvas300,
              overflow: 'hidden',
            }}
          >
            <Svg viewBox="0 0 360 240" width="100%" height="100%">
              {/* Major roads */}
              <G stroke="#FAF8F3" strokeWidth={14} fill="none" opacity={0.9}>
                <Path d="M -10 50 L 380 80" />
                <Path d="M -10 180 L 380 170" />
                <Path d="M 120 -10 L 90 250" />
                <Path d="M 260 -10 L 290 250" />
              </G>
              {/* Dashed delivery route (origin → destination) — animates in on mount */}
              <G stroke="#F2EEE3" strokeWidth={4} fill="none" strokeDasharray="6 6">
                <AnimatedPath
                  d="M 60 220 C 90 160, 200 110, 300 40"
                  strokeDasharray="6 6"
                  animatedProps={routeAnimProps}
                />
              </G>
              {/* Destination pin (olive) */}
              <G x={60} y={220}>
                <Circle r={11} fill="#FAF8F3" />
                <Circle r={9} fill="#1F4A3D" />
                <Circle r={3} fill="#FAF8F3" />
              </G>
              {/* Shop origin pin (gold, with shop letter) */}
              <G x={300} y={40}>
                <Circle r={11} fill="#FAF8F3" />
                <Circle r={9} fill="#E8B14F" />
                <SvgText
                  textAnchor="middle"
                  y={3}
                  fontSize={10}
                  fontWeight="700"
                  fill="#0F1A17"
                  fontFamily="IBMPlexSansArabic-Bold"
                >
                  أ
                </SvgText>
              </G>
              {/* Courier marker — position along cubic Bezier by step. */}
              {(() => {
                const t = [0.15, 0.4, 0.7, 0.95][step] ?? 0.4;
                const x = (1 - t) ** 3 * 300 + 3 * (1 - t) ** 2 * t * 200 + 3 * (1 - t) * t * t * 90 + t ** 3 * 60;
                const y = (1 - t) ** 3 * 40 + 3 * (1 - t) ** 2 * t * 110 + 3 * (1 - t) * t * t * 160 + t ** 3 * 220;
                return (
                  <G x={x} y={y}>
                    <Circle r={22} fill="rgba(31,74,61,0.16)" />
                    <Circle r={14} fill="#1F4A3D" stroke="#FAF8F3" strokeWidth={3} />
                  </G>
                );
              })()}
            </Svg>
            <View
              style={{
                position: 'absolute',
                top: 10,
                left: pick(10, undefined),
                right: pick(undefined, 10),
                backgroundColor: 'rgba(250,248,243,0.92)',
                borderRadius: 100,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection,
                alignItems: 'center',
                gap: 6,
              }}
            >
              <LiveDot size={8} color={colors.olive} />
              <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 12, color: colors.ink }}>
                {t('tracking.live')}
              </Text>
            </View>
          </View>
        </View>

        {/* ETA + progress */}
        <View style={{ paddingHorizontal: 18, paddingTop: 16 }}>
          <Card padding={16}>
            <View
              style={{
                flexDirection,
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 14,
              }}
            >
              <View>
                <Text
                  style={{ fontFamily: fonts.arabicMedium, fontSize: 12, color: colors.inkLight, textAlign: isRtl ? 'right' : 'left' }}
                >
                  {t(`tracking.status.${STATUS_HEAD[step]}`)}
                </Text>
                <Text
                  style={{ fontFamily: fonts.arabicBold, fontSize: 22, color: colors.olive, marginTop: 2, textAlign: isRtl ? 'right' : 'left' }}
                >
                  {t(`tracking.eta.${ETA[step]}`)}
                </Text>
              </View>
              <Text style={{ fontFamily: MONO_FAMILY, fontSize: 11, color: colors.inkMute }}>
                {orderId}
              </Text>
            </View>
            <OrderProgress step={step} />
          </Card>
        </View>

        {/* Courier card */}
        {step >= 2 && step < 3 ? (
          <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
            <Card padding={14}>
              <View style={{ flexDirection, alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 100,
                    backgroundColor: colors.olive,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: fonts.arabicBold, fontSize: 22, color: colors.canvas }}>
                    م
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontFamily: fonts.arabicMedium, fontSize: 11, color: colors.inkLight, textAlign: isRtl ? 'right' : 'left' }}
                  >
                    {t('tracking.captain')}
                  </Text>
                  <Text
                    style={{ fontFamily: fonts.arabicSemiBold, fontSize: 15, color: colors.ink, textAlign: isRtl ? 'right' : 'left' }}
                  >
                    محمود السيد
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.arabic,
                      fontSize: 12,
                      color: colors.inkLight,
                      marginTop: 2,
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    موتوسيكل · لوحة ٢١٣٤ د ل
                  </Text>
                </View>
                <CircleButton
                  variant="secondary"
                  onPress={() => void Linking.openURL('tel:+201001234567')}
                  accessibilityLabel="اتصل بالكابتن"
                >
                  <Icon.phone size={20} color={colors.olive} />
                </CircleButton>
                <CircleButton
                  variant="primary"
                  onPress={() =>
                    router.push({
                      pathname: '/chat',
                      params: { kind: 'driver', name: 'محمود السيد', avatar: 'م' },
                    })
                  }
                  accessibilityLabel="شات مع الكابتن"
                >
                  <Icon.message size={20} color={colors.canvas} />
                </CircleButton>
              </View>
            </Card>
          </View>
        ) : null}

        {/* Order details */}
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
            {t('tracking.orderDetails')}
          </Text>
          <Card padding={14}>
            {ORDER_ITEMS.map((it, i) => (
              <View
                key={it.name}
                style={{
                  flexDirection,
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  borderBottomWidth: i < ORDER_ITEMS.length - 1 ? 1 : 0,
                  borderBottomColor: colors.canvas300,
                }}
              >
                <Text style={{ fontFamily: fonts.arabic, fontSize: 14, color: colors.ink, textAlign: isRtl ? 'right' : 'left' }}>
                  <Text style={{ fontFamily: fonts.arabicBold, color: colors.olive }}>
                    {it.qty.toLocaleString('ar-EG')}×{' '}
                  </Text>
                  {it.name}
                </Text>
                <Text
                  style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.ink, textAlign: isRtl ? 'right' : 'left' }}
                >
                  {it.price.toLocaleString('ar-EG')} ج.م
                </Text>
              </View>
            ))}
          </Card>
        </View>

        {step === 3 ? (
          <View style={{ paddingHorizontal: 18, paddingTop: 18, gap: 10 }}>
            <Button variant="primary" full onPress={() => router.replace('/(tabs)/home')}>
              {t('tracking.doneThanks')}
            </Button>
            <Button variant="ghost" full onPress={() => router.push('/rate')}>
              {t('tracking.rate')}
            </Button>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function CircleButton({
  children,
  variant,
  onPress,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  variant: 'primary' | 'secondary';
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
    >
      {({ pressed }) => (
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 100,
            backgroundColor:
              variant === 'primary'
                ? pressed
                  ? colors.olive700
                  : colors.olive
                : pressed
                  ? colors.canvas200
                  : colors.bgElevated,
            borderWidth: 1.5,
            borderColor: colors.olive,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </View>
      )}
    </Pressable>
  );
}
