import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Chip, EmptyState, Icon, SearchField, ShopCard } from '@/shared/ui';
import { colors, fonts, shadow } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import { TRENDING_SEARCHES } from '@/features/catalog/data';
import {
  useSearch,
  useCustomerCategories,
  useDiscoveryStore,
} from '@/features/discovery';

export default function Search() {
  const router = useRouter();
  const { t } = useTranslation();
  const arDigits = useArabicDigits();
  const [q, setQ] = useState('');
  const recentSearches = useDiscoveryStore((s) => s.recentSearches);
  const pushSearch = useDiscoveryStore((s) => s.pushSearch);
  const clearSearches = useDiscoveryStore((s) => s.clearSearches);
  const categories = useCustomerCategories();

  const trimmed = q.trim();
  const { stores: shopHits, products: productHits } = useSearch(trimmed);

  const submit = (text: string) => {
    setQ(text);
    if (text) pushSearch(text);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            paddingHorizontal: 18,
            paddingTop: 14,
            paddingBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <SearchField
              value={q}
              onChangeText={setQ}
              onClear={() => setQ('')}
              placeholder={t('search.placeholder')}
              autoFocus
            />
          </View>
          <Pressable onPress={() => router.replace('/(tabs)/home')}>
            <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.olive }}>
              {t('common.cancel')}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {!trimmed ? (
          <>
            {recentSearches.length > 0 ? (
              <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.arabicSemiBold,
                      fontSize: 12,
                      color: colors.inkMute,
                      letterSpacing: 0.4,
                    }}
                  >
                    {t('search.recent')}
                  </Text>
                  <Pressable onPress={() => clearSearches()}>
                    <Text
                      style={{ fontFamily: fonts.arabicMedium, fontSize: 12, color: colors.inkLight }}
                    >
                      {t('search.clearAll')}
                    </Text>
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {recentSearches.map((r) => (
                    <Chip key={r} onPress={() => submit(r)}>
                      {r}
                    </Chip>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Icon.flame size={14} color={colors.inkMute} />
                <Text
                  style={{
                    fontFamily: fonts.arabicSemiBold,
                    fontSize: 12,
                    color: colors.inkMute,
                    letterSpacing: 0.4,
                  }}
                >
                  {t('search.trending')}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {TRENDING_SEARCHES.map((trend) => (
                  <Chip key={trend} onPress={() => submit(trend)} icon={<Icon.search size={14} color={colors.ink} />}>
                    {trend}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
              <Text
                style={{
                  fontFamily: fonts.arabicSemiBold,
                  fontSize: 12,
                  color: colors.inkMute,
                  letterSpacing: 0.4,
                  marginBottom: 10,
                }}
              >
                {t('search.browseCategory')}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {categories.filter((c) => c.key !== 'all').map((c) => (
                  <Pressable
                    key={c.key}
                    onPress={() => router.push({ pathname: '/category', params: { key: c.key } })}
                    style={{ flexBasis: '48%', flexGrow: 1 }}
                  >
                    {({ pressed }) => (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                          padding: 14,
                          borderRadius: 12,
                          backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
                          borderWidth: 1,
                          borderColor: colors.canvas300,
                        }}
                      >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: colors.canvas200,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {c.icon === 'store' ? (
                        <Icon.store size={20} color={colors.olive} />
                      ) : c.icon === 'pill' ? (
                        <Icon.pill size={20} color={colors.olive} />
                      ) : c.icon === 'utensils' ? (
                        <Icon.utensils size={20} color={colors.olive} />
                      ) : c.icon === 'cookie' ? (
                        <Icon.cookie size={20} color={colors.olive} />
                      ) : (
                        <Icon.leaf size={20} color={colors.olive} />
                      )}
                    </View>
                    <Text style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink }}>
                      {c.label}
                    </Text>
                    </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        ) : productHits.length === 0 && shopHits.length === 0 ? (
          <EmptyState
            icon={<Icon.search size={28} color={colors.olive} />}
            title={t('search.noResultsTitle')}
            body={t('search.noResultsBody', { q })}
          />
        ) : (
          <>
            {shopHits.length > 0 ? (
              <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
                <Text
                  style={{
                    fontFamily: fonts.arabicSemiBold,
                    fontSize: 12,
                    color: colors.inkMute,
                    letterSpacing: 0.4,
                    marginBottom: 10,
                  }}
                >
                  {`محلات · ${arDigits(shopHits.length)} نتيجة`}
                </Text>
                <View style={{ gap: 8 }}>
                  {shopHits.map((s) => (
                    <ShopCard
                      key={s.id}
                      shop={s}
                      compact
                      onPress={() => {
                        submit(q);
                        router.push({ pathname: '/shop', params: { id: s.id } });
                      }}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {productHits.length > 0 ? (
              <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
                <Text
                  style={{
                    fontFamily: fonts.arabicSemiBold,
                    fontSize: 12,
                    color: colors.inkMute,
                    letterSpacing: 0.4,
                    marginBottom: 10,
                  }}
                >
                  {`منتجات · ${arDigits(productHits.length)} نتيجة`}
                </Text>
                <View style={{ gap: 8 }}>
                  {productHits.map((p) => (
                    <Pressable
                      key={p.id}
                      onPress={() => {
                        submit(q);
                        router.push({
                          pathname: '/product',
                          params: { id: p.id, shopId: p.storeId },
                        });
                      }}
                    >
                      {({ pressed }) => (
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 12,
                            alignItems: 'center',
                            padding: 10,
                            borderRadius: 12,
                            backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
                            ...shadow.card,
                          }}
                        >
                      <View
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 10,
                          backgroundColor: p.hue,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: fonts.arabicBold,
                            fontSize: 28,
                            color: 'rgba(15,26,23,0.18)',
                          }}
                        >
                          {p.name[0]}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{ fontFamily: fonts.arabicSemiBold, fontSize: 14, color: colors.ink }}
                        >
                          {p.name}
                        </Text>
                        <Text
                          style={{ fontFamily: fonts.arabic, fontSize: 12, color: colors.inkLight }}
                        >
                          {p.sub} · سوبر ماركت أبو حسن
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                        <Text
                          style={{ fontFamily: fonts.arabicBold, fontSize: 14, color: colors.olive }}
                        >
                          {arDigits(p.price)}
                        </Text>
                        <Text
                          style={{ fontFamily: fonts.arabicMedium, fontSize: 11, color: colors.inkLight }}
                        >
                          ج.م
                        </Text>
                      </View>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
