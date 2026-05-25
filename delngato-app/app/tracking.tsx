import { useEffect, useMemo, useState } from 'react';
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
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { usePlatformStore } from '@/domain/stores/platform';
import { selectOrderById } from '@/domain/selectors';
import type { OrderStatus } from '@/domain/types';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const MONO_FAMILY = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

type Step = 0 | 1 | 2 | 3;

const STATUS_HEAD = ['received', 'preparing', 'onTheWay', 'delivered'] as const;
const ETA = ['0', '1', '2', '3'] as const;

/**
 * Map the canonical OrderStatus to a 0–3 UI tracking step.
 *
 * The tracking UI has four visual states:
 *  0 = received (new / payment_pending)
 *  1 = preparing (accepted / preparing)
 *  2 = on the way (ready / picked)
 *  3 = delivered
 *
 * Terminal negative states (rejected / cancelled) default to step 0 —
 * the tracking screen shouldn't normally be shown for these, but if it
 * is reached via deep link or history, it renders defensively.
 */
function statusToStep(status: OrderStatus | undefined): Step {
  switch (status) {
    case 'payment_pending':
    case 'new':
      return 0;
    case 'accepted':
    case 'preparing':
      return 1;
    case 'ready':
    case 'picked':
      return 2;
    case 'delivered':
      return 3;
    case 'rejected':
    case 'cancelled':
    default:
      return 0;
  }
}

export default function Tracking() {
  const router = useRouter();
  const { t } = useTranslation();
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection, pick } = useRtl();
  const params = useLocalSearchParams<{ orderId?: string }>();
  // Phase 6: no more hardcoded fallback. If a caller reaches tracking without
  // an orderId we show "—" rather than fabricating one. The legacy "DLN-٢٠٤٧"
  // fallback was the source of the parallel-reality bug — every customer flow
  // landed on the same fake order.
  const orderId = params.orderId ?? '—';

  // ── Realtime subscription ──────────────────────────────────────────
  // Subscribe to the platform store for this specific order. The
  // MockRealtimeClient's tick() advances timers and mutates order status in
  // the platform store. This subscription re-renders the tracking screen
  // whenever the order changes — no local setInterval needed.
  const order = usePlatformStore((s) => selectOrderById(s, orderId));

  const step = statusToStep(order?.status);

  // Derive items from the Order domain object. No more hardcoded array.
  const orderItems = useMemo(() => {
    if (!order?.items) return [];
    return order.items.map((it) => ({
      name: it.name,
      qty: it.qty,
      price: it.subtotal,
    }));
  }, [order?.items]);

  // Animate the dashed delivery route once on mount.
  const routeProgress = useSharedValue(220);
  useEffect(() => {
    routeProgress.value = withTiming(0, { duration: 1400, easing: ease.out });
  }, [routeProgress]);

  const routeAnimProps = useAnimatedProps(() => ({
    strokeDashoffset: routeProgress.value,
  }));

  // Derive courier info from Order when available (step >= 2 AND driver assigned).
  // The user requested: "Tracking courier card at `picked`".
  const hasCourier = order?.status === 'picked' && !!order?.driverName;
  
  // Stale marker / offline status
  const [isOffline, setIsOffline] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      import('@/infrastructure/container').then(({ getContainer }) => {
        setIsOffline(getContainer().realtime.status() === 'offline');
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
      {isOffline && (
        <View style={{ backgroundColor: colors.statusIssue, padding: 8, alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 12, color: colors.statusIssueText }}>
            انقطع الاتصال. جاري محاولة استعادة البيانات...
          </Text>
        </View>
      )}

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

        {/* Courier card — shown when order has a driver and is in transit */}
        {hasCourier ? (
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
                    {(order?.driverName ?? 'م').charAt(0)}
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
                    {order?.driverName ?? 'الكابتن'}
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
                      params: { kind: 'driver', name: order?.driverName ?? 'الكابتن', avatar: (order?.driverName ?? 'م').charAt(0), orderId },
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

        {/* Order details — read from the domain Order, not hardcoded */}
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
            {orderItems.length > 0 ? (
              orderItems.map((it, i) => (
                <View
                  key={`${it.name}-${i}`}
                  style={{
                    flexDirection,
                    justifyContent: 'space-between',
                    paddingVertical: 8,
                    borderBottomWidth: i < orderItems.length - 1 ? 1 : 0,
                    borderBottomColor: colors.canvas300,
                  }}
                >
                  <Text style={{ fontFamily: fonts.arabic, fontSize: 14, color: colors.ink, textAlign: isRtl ? 'right' : 'left' }}>
                    <Text style={{ fontFamily: fonts.arabicBold, color: colors.olive }}>
                      {arDigits(it.qty)}×{' '}
                    </Text>
                    {it.name}
                  </Text>
                  <Text
                    style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.ink, textAlign: isRtl ? 'right' : 'left' }}
                  >
                    {arDigits(it.price)} ج.م
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ fontFamily: fonts.arabic, fontSize: 13, color: colors.inkLight, textAlign: 'center', paddingVertical: 16 }}>
                لا توجد تفاصيل للطلب
              </Text>
            )}
            {order ? (
              <View
                style={{
                  marginTop: 8,
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: colors.canvas300,
                  flexDirection,
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.inkLight }}>
                  الإجمالي
                </Text>
                <Text style={{ fontFamily: fonts.arabicBold, fontSize: 14, color: colors.ink }}>
                  {arDigits(order.total)} ج.م
                </Text>
              </View>
            ) : null}
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
