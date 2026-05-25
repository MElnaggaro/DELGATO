import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppBar, Button, CategoryChip, CategoryChipRow, EmptyState, Icon, ShopCard } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';
import { useStoresByCategory, useCustomerCategories } from '@/features/discovery';
import type { Store } from '@/domain/types';

type Filter = 'الأقرب' | 'الأعلى تقييماً' | 'مفتوح دلوقتي' | 'توصيل أسرع';
const FILTERS: Filter[] = ['الأقرب', 'الأعلى تقييماً', 'مفتوح دلوقتي', 'توصيل أسرع'];

function applyFilter(shops: readonly Store[], filter: Filter): readonly Store[] {
  if (filter === 'مفتوح دلوقتي') return shops.filter((s) => s.open);
  if (filter === 'الأقرب') {
    return [...shops].sort((a, b) => (a.deliveryFee ?? 0) - (b.deliveryFee ?? 0));
  }
  if (filter === 'الأعلى تقييماً') {
    return [...shops].sort((a, b) => b.rating - a.rating);
  }
  // توصيل أسرع
  return [...shops].sort((a, b) => a.prepTimeMin - b.prepTimeMin);
}

export default function Category() {
  const router = useRouter();
  const params = useLocalSearchParams<{ key?: string }>();
  const key = params.key ?? 'grocery';
  const categories = useCustomerCategories();
  const cat = categories.find((c) => c.key === key) ?? categories[1]!;
  const storesInCat = useStoresByCategory(key);
  const [filter, setFilter] = useState<Filter>(FILTERS[0]!);

  const shops = useMemo(() => applyFilter(storesInCat, filter), [storesInCat, filter]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar
        title={cat.label}
        onBack={() => safeBack('/(tabs)/home')}
        trailing={
          <Pressable accessibilityLabel="فلترة" hitSlop={8} style={{ padding: 6 }}>
            <Icon.filter size={20} color={colors.ink} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <CategoryChipRow>
          {FILTERS.map((f) => (
            <CategoryChip key={f} active={filter === f} onPress={() => setFilter(f)}>
              {f}
            </CategoryChip>
          ))}
        </CategoryChipRow>

        <View style={{ paddingHorizontal: 18, gap: 10 }}>
          {shops.length === 0 ? (
            <EmptyState
              icon={<Icon.store size={28} color={colors.olive} />}
              title="مفيش محلات بهذه الخصائص"
              body="جرب فلتر تاني أو ارجع للرئيسية."
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
