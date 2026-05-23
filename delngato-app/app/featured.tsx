import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppBar, Badge, Icon, ShopCard } from '@/shared/ui';
import { FadeUp, Rise } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { FEATURED_IDS, SHOPS } from '@/features/catalog/data';

export default function Featured() {
  const router = useRouter();
  const { isRtl, flexDirection, pick } = useRtl();
  const shops = SHOPS.filter((s) => FEATURED_IDS.includes(s.id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="محلات مميزة" onBack={() => safeBack('/(tabs)/home')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28, paddingTop: 8 }}>
        <FadeUp>
          <View
            style={{
              backgroundColor: colors.canvas200,
              borderRadius: 12,
              padding: 14,
              marginBottom: 14,
              flexDirection,
              gap: 10,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: colors.olive,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.star size={18} color={colors.canvas} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: fonts.arabicBold,
                  fontSize: 14,
                  color: colors.ink,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                المحلات اللي العيلة بتثق فيها
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
                الأفضل تقييماً والأكثر طلباً في الدلنجات
              </Text>
            </View>
          </View>
        </FadeUp>

        <View style={{ gap: 10 }}>
          {shops.map((s, i) => (
            <Rise key={s.id} delay={i * 50} style={{ position: 'relative' }}>
              <View
                style={{
                  position: 'absolute',
                  top: 10,
                  left: pick(10, undefined),
                  right: pick(undefined, 10),
                  zIndex: 2,
                }}
              >
                <Badge variant="solid-gold">مميز</Badge>
              </View>
              <ShopCard shop={s} onPress={() => router.push({ pathname: '/shop', params: { id: s.id } })} />
            </Rise>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
