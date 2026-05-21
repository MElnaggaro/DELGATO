import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppBar, Button, Card, Icon, OrderProgress } from '@/shared/ui';
import { colors, fonts } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';

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
  const params = useLocalSearchParams<{ orderId?: string }>();
  const orderId = params.orderId ?? 'DLN-٢٠٤٧';
  const [step, setStep] = useState<Step>(1);

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
          <Pressable hitSlop={6} style={{ padding: 6 }}>
            <Icon.share size={22} color={colors.ink} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Map placeholder */}
        <View style={{ marginHorizontal: 18, paddingTop: 0 }}>
          <View
            style={{
              height: 240,
              borderRadius: 14,
              backgroundColor: colors.canvas300,
              borderWidth: 1,
              borderColor: colors.canvas300,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon.navigation size={36} color={colors.olive} />
            <View
              style={{
                position: 'absolute',
                top: 10,
                insetInlineStart: 10,
                backgroundColor: 'rgba(250,248,243,0.92)',
                borderRadius: 100,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.olive,
                }}
              />
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
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 14,
              }}
            >
              <View>
                <Text
                  style={{ fontFamily: fonts.arabicMedium, fontSize: 12, color: colors.inkLight }}
                >
                  {t(`tracking.status.${STATUS_HEAD[step]}`)}
                </Text>
                <Text
                  style={{ fontFamily: fonts.arabicBold, fontSize: 22, color: colors.olive, marginTop: 2 }}
                >
                  {t(`tracking.eta.${ETA[step]}`)}
                </Text>
              </View>
              <Text style={{ fontFamily: fonts.arabicMedium, fontSize: 11, color: colors.inkMute }}>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
                    style={{ fontFamily: fonts.arabicMedium, fontSize: 11, color: colors.inkLight }}
                  >
                    {t('tracking.captain')}
                  </Text>
                  <Text
                    style={{ fontFamily: fonts.arabicSemiBold, fontSize: 15, color: colors.ink }}
                  >
                    محمود السيد
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.arabic,
                      fontSize: 12,
                      color: colors.inkLight,
                      marginTop: 2,
                    }}
                  >
                    موتوسيكل · لوحة ٢١٣٤ د ل
                  </Text>
                </View>
                <CircleButton variant="secondary">
                  <Icon.phone size={20} color={colors.olive} />
                </CircleButton>
                <CircleButton variant="primary">
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
            }}
          >
            {t('tracking.orderDetails')}
          </Text>
          <Card padding={14}>
            {ORDER_ITEMS.map((it, i) => (
              <View
                key={it.name}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  borderBottomWidth: i < ORDER_ITEMS.length - 1 ? 1 : 0,
                  borderBottomColor: colors.canvas300,
                }}
              >
                <Text style={{ fontFamily: fonts.arabic, fontSize: 14, color: colors.ink }}>
                  <Text style={{ fontFamily: fonts.arabicBold, color: colors.olive }}>
                    {it.qty.toLocaleString('ar-EG')}×{' '}
                  </Text>
                  {it.name}
                </Text>
                <Text
                  style={{ fontFamily: fonts.arabicSemiBold, fontSize: 13, color: colors.ink }}
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
}: {
  children: React.ReactNode;
  variant: 'primary' | 'secondary';
}) {
  return (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 100,
        backgroundColor: variant === 'primary' ? colors.olive : colors.bgElevated,
        borderWidth: 1.5,
        borderColor: colors.olive,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );
}
