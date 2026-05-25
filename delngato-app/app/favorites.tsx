import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppBar, Button, EmptyState, Icon, ShopCard } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';
import { useAllStores } from '@/features/discovery';
import { useCartStore } from '@/features/cart/store';

export default function Favorites() {
  const router = useRouter();
  const favorites = useCartStore((s) => s.favorites);
  const allStores = useAllStores();
  const favs = allStores.filter((s) => favorites.includes(s.id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="المحلات المفضلة" onBack={() => safeBack('/(tabs)/profile')} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 24 }}>
        {favs.length === 0 ? (
          <EmptyState
            icon={<Icon.heart size={28} color={colors.olive} />}
            title="مفيش محلات مفضلة"
            body="اضغط القلب على أي محل علشان تضيفه هنا للوصول السريع."
            action={
              <Button variant="primary" onPress={() => router.replace('/(tabs)/home')}>
                تصفّح المحلات
              </Button>
            }
          />
        ) : (
          <View style={{ gap: 10 }}>
            {favs.map((s) => (
              <ShopCard
                key={s.id}
                shop={s}
                onPress={() => router.push({ pathname: '/shop', params: { id: s.id } })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
