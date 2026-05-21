import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Chip, EmptyState, Icon, SearchField, ShopCard } from '@/shared/ui';
import { colors, fonts, shadow } from '@/shared/theme';
import { useArabicDigits } from '@/shared/hooks/useArabicDigits';
import {
  CATEGORIES,
  PRODUCTS,
  RECENT_SEARCHES,
  SHOPS,
  TRENDING_SEARCHES,
} from '@/features/catalog/data';

export default function Search() {
  const router = useRouter();
  const { t } = useTranslation();
  const arDigits = useArabicDigits();
  const [q, setQ] = useState('');
  const [recent, setRecent] = useState<string[]>(RECENT_SEARCHES);

  const trimmed = q.trim();
  const productHits = trimmed ? PRODUCTS.filter((p) => p.name.includes(trimmed)).slice(0, 8) : [];
  const shopHits = trimmed
    ? SHOPS.filter((s) => s.name.includes(trimmed) || s.cat.includes(trimmed)).slice(0, 4)
    : [];

  const submit = (text: string) => {
    setQ(text);
    if (text && !recent.includes(text)) setRecent([text, ...recent].slice(0, 6));
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
            {recent.length > 0 ? (
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
                  <Pressable onPress={() => setRecent([])}>
                    <Text
                      style={{ fontFamily: fonts.arabicMedium, fontSize: 12, color: colors.inkLight }}
                    >
                      {t('search.clearAll')}
                    </Text>
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {recent.map((r) => (
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
                {CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
                  <Pressable
                    key={c.key}
                    onPress={() => router.push({ pathname: '/category', params: { key: c.key } })}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      padding: 14,
                      borderRadius: 12,
                      backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
                      borderWidth: 1,
                      borderColor: colors.canvas300,
                      flexBasis: '48%',
                      flexGrow: 1,
                    })}
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
                          params: { id: p.id, shopId: SHOPS[0]!.id },
                        });
                      }}
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        gap: 12,
                        alignItems: 'center',
                        padding: 10,
                        borderRadius: 12,
                        backgroundColor: pressed ? colors.canvas200 : colors.bgElevated,
                        ...shadow.card,
                      })}
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
