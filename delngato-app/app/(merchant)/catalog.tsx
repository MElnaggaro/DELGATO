/**
 * Merchant catalog management — full product listing with search, stock
 * toggle, and navigation to product edit.
 *
 * Phase 9: reads products from platform store via selectors. Merchant can
 * toggle stock availability and navigate to edit or add screens.
 */

import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppBar, Card, Icon, ToggleSwitch } from '@/shared/ui';
import { FadeUp } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { usePlatformStore } from '@/domain/stores/platform';

export default function MerchantCatalog() {
  const router = useRouter();
  const arDigits = useArabicDigits();
  const { isRtl, flexDirection } = useRtl();
  const [search, setSearch] = useState('');

  const products = usePlatformStore((s) => Object.values(s.products));

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q),
    );
  }, [products, search]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="إدارة الكتالوج" onBack={() => safeBack('/(merchant)/(tabs)/products')} />

      <View style={{ paddingHorizontal: 18, paddingVertical: 10 }}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="ابحث عن منتج…"
          placeholderTextColor={colors.inkMute}
          style={{
            height: 44,
            paddingHorizontal: 14,
            backgroundColor: colors.bgElevated,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.canvas300,
            fontFamily: fonts.arabic,
            fontSize: 14,
            color: colors.ink,
            textAlign: isRtl ? 'right' : 'left',
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ fontFamily: fonts.arabic, fontSize: 14, color: colors.inkLight }}>
              لا توجد منتجات
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <FadeUp distance={4}>
            <Card padding={14}>
              <View style={{ flexDirection, alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    backgroundColor: 'rgba(31,74,61,0.08)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon.store size={22} color={colors.olive} />
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
                    {item.name}
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
                    {arDigits(item.price)} ج.م
                  </Text>
                </View>
                <ToggleSwitch
                  value={item.availability === 'available'}
                  onChange={() => {
                    usePlatformStore.getState().applyProduct({
                      ...item,
                      availability: item.availability === 'available' ? 'out' : 'available',
                    });
                    import('@/infrastructure/container').then(({ getContainer }) => {
                      void getContainer().productRepo.setStock(
                        item.id,
                        item.availability === 'available' ? 0 : 10
                      );
                    });
                  }}
                />
              </View>
            </Card>
          </FadeUp>
        )}
      />
    </View>
  );
}
