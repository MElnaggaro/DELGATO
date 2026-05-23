import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppBar, Icon, IconForward } from '@/shared/ui';
import { colors, fonts, shadow } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { findShop } from '@/features/catalog/data';

const REASONS = [
  'استفسار عن منتج',
  'تعديل على الطلب',
  'مشكلة في الفاتورة',
  'سؤال عن وقت التوصيل',
];

export default function ContactMerchant() {
  const router = useRouter();
  const { isRtl, flexDirection } = useRtl();
  const params = useLocalSearchParams<{ shopId?: string }>();
  const shop = findShop(params.shopId ?? '');
  const merchantName = shop?.name ?? 'سوبر ماركت أبو حسن';

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="تواصل مع المحل" onBack={() => safeBack('/shop')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28, paddingTop: 8 }}>
        <View
          style={{
            backgroundColor: colors.bgElevated,
            borderRadius: 14,
            padding: 18,
            ...shadow.card,
            flexDirection,
            alignItems: 'center',
            gap: 14,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 100,
              backgroundColor: colors.olive,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: fonts.arabicBold, fontSize: 26, color: colors.canvas }}>
              {shop?.letter ?? 'أ'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: fonts.arabicBold,
                fontSize: 16,
                color: colors.ink,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              {merchantName}
            </Text>
            <Text
              style={{
                fontFamily: fonts.arabic,
                fontSize: 12,
                color: colors.inkLight,
                marginTop: 4,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              {shop?.cat ?? 'بقالة'} · مفتوح دلوقتي
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 22, gap: 10 }}>
          <ContactCard
            icon={<Icon.message size={20} color={colors.olive} />}
            title="شات مع المحل"
            sub="رد في دقايق · أسرع طريقة"
            onPress={() =>
              router.push({
                pathname: '/chat',
                params: { kind: 'merchant', name: merchantName, avatar: shop?.letter ?? 'م' },
              })
            }
          />
          <ContactCard
            icon={<Icon.phone size={20} color={colors.olive} />}
            title="اتصل بالمحل"
            sub="٠١٠ ٢٣٤ ٥٦٧٨"
            onPress={() => {}}
          />
        </View>

        <Text
          style={{
            fontFamily: fonts.arabicSemiBold,
            fontSize: 12,
            color: colors.inkMute,
            letterSpacing: 0.4,
            marginTop: 22,
            marginBottom: 10,
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          أسباب التواصل
        </Text>
        <View style={{ gap: 8 }}>
          {REASONS.map((r) => (
            <Pressable
              key={r}
              onPress={() =>
                router.push({
                  pathname: '/chat',
                  params: { kind: 'merchant', name: merchantName, avatar: shop?.letter ?? 'م' },
                })
              }
              style={({ pressed }) => ({
                backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.canvas300,
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection,
                alignItems: 'center',
                justifyContent: 'space-between',
              })}
            >
              <Text
                style={{ fontFamily: fonts.arabicMedium, fontSize: 14, color: colors.ink }}
              >
                {r}
              </Text>
              <IconForward size={18} color={colors.inkLight} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function ContactCard({
  icon,
  title,
  sub,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  onPress: () => void;
}) {
  const { isRtl, flexDirection } = useRtl();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
        borderRadius: 12,
        padding: 14,
        flexDirection,
        alignItems: 'center',
        gap: 12,
        ...shadow.card,
      })}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          backgroundColor: 'rgba(31,74,61,0.08)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
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
          {title}
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
          {sub}
        </Text>
      </View>
      <IconForward size={18} color={colors.inkLight} />
    </Pressable>
  );
}
