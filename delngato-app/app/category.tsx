import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppBar, Button, Chip, EmptyState, Icon, ShopCard } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';
import { CATEGORIES, SHOPS, type CategoryKey } from '@/features/catalog/data';

const FILTERS = ['الأقرب', 'الأعلى تقييماً', 'مفتوح دلوقتي', 'توصيل أسرع'];

export default function Category() {
  const router = useRouter();
  const params = useLocalSearchParams<{ key?: string }>();
  const key = (params.key as CategoryKey) ?? 'grocery';
  const cat = CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[1]!;
  const shops = SHOPS.filter((s) => s.catKey === key);
  const [filter, setFilter] = useState<string>(FILTERS[0]!);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar
        title={cat.label}
        onBack={() => safeBack('/(tabs)/home')}
        trailing={
          <Pressable hitSlop={6} style={{ padding: 6 }}>
            <Icon.filter size={20} color={colors.ink} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 18, gap: 8, paddingBottom: 14 }}
        >
          {FILTERS.map((f) => (
            <Chip key={f} active={filter === f} onPress={() => setFilter(f)}>
              {f}
            </Chip>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 18, gap: 10 }}>
          {shops.length === 0 ? (
            <EmptyState
              icon={<Icon.store size={28} color={colors.olive} />}
              title="مفيش محلات في القسم ده"
              body="بنشتغل علشان نضيف محلات أكتر قريباً."
              action={
                <Button variant="ghost" onPress={() => safeBack('/(tabs)/home')}>
                  ارجع للرئيسية
                </Button>
              }
            />
          ) : (
            shops.map((s) => (
              <ShopCard
                key={s.id}
                shop={s}
                onPress={() => router.push({ pathname: '/shop', params: { id: s.id } })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
