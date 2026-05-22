import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppBar, Button, Chip, EmptyState, Icon, ShopCard } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { safeBack } from '@/shared/utils/nav';
import { CATEGORIES, SHOPS, type CategoryKey, type Shop } from '@/features/catalog/data';

type Filter = 'الأقرب' | 'الأعلى تقييماً' | 'مفتوح دلوقتي' | 'توصيل أسرع';
const FILTERS: Filter[] = ['الأقرب', 'الأعلى تقييماً', 'مفتوح دلوقتي', 'توصيل أسرع'];

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const parseLeadingNumber = (s: string): number => {
  const m = s.match(/[٠-٩0-9]+/);
  if (!m) return Number.POSITIVE_INFINITY;
  const western = m[0]
    .split('')
    .map((c) => {
      const idx = AR_DIGITS.indexOf(c);
      return idx >= 0 ? String(idx) : c;
    })
    .join('');
  const n = parseInt(western, 10);
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
};

function applyFilter(shops: Shop[], filter: Filter): Shop[] {
  if (filter === 'مفتوح دلوقتي') return shops.filter((s) => s.open);
  if (filter === 'الأقرب') {
    return [...shops].sort((a, b) => parseLeadingNumber(a.distance) - parseLeadingNumber(b.distance));
  }
  if (filter === 'الأعلى تقييماً') {
    return [...shops].sort((a, b) => parseLeadingNumber(b.rating) - parseLeadingNumber(a.rating));
  }
  return [...shops].sort((a, b) => parseLeadingNumber(a.eta) - parseLeadingNumber(b.eta));
}

export default function Category() {
  const router = useRouter();
  const params = useLocalSearchParams<{ key?: string }>();
  const key = (params.key as CategoryKey) ?? 'grocery';
  const cat = CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[1]!;
  const [filter, setFilter] = useState<Filter>(FILTERS[0]!);

  const shops = useMemo(() => {
    const inCat = SHOPS.filter((s) => s.catKey === key);
    return applyFilter(inCat, filter);
  }, [key, filter]);

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 18, gap: 8, paddingTop: 6, paddingBottom: 14 }}
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
