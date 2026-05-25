import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { AppBar, Badge, Chip, Icon, showToast } from '@/shared/ui';
import { FadeUp, Rise } from '@/shared/motion';
import { colors, fonts } from '@/shared/theme';
import { useRtl } from '@/shared/hooks/useRtl';
import { safeBack } from '@/shared/utils/nav';
import { DEALS, type Deal, type DealKind } from '@/features/catalog/data';
import { useStoreDetail } from '@/features/discovery';
import { useCartStore } from '@/features/cart/store';

type Tab = 'all' | 'percent' | 'cashback' | 'bogo';

const TABS: { k: Tab; l: string }[] = [
  { k: 'all', l: 'الكل' },
  { k: 'percent', l: 'خصومات' },
  { k: 'cashback', l: 'كاش باك' },
  { k: 'bogo', l: 'هدايا' },
];

function matches(kind: DealKind, tab: Tab) {
  if (tab === 'all') return true;
  if (tab === 'percent') return kind === 'percent' || kind === 'flat';
  if (tab === 'cashback') return kind === 'cashback';
  if (tab === 'bogo') return kind === 'bogo' || kind === 'hero';
  return false;
}

export default function Deals() {
  const router = useRouter();
  const { isRtl } = useRtl();
  const setAppliedPromo = useCartStore((s) => s.setAppliedPromo);
  const [tab, setTab] = useState<Tab>('all');

  const filtered = DEALS.filter((d) => matches(d.kind, tab));

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppBar title="العروض والخصومات" onBack={() => safeBack('/(tabs)/home')} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 18, gap: 8, paddingBottom: 12 }}
      >
        {TABS.map((c) => (
          <Chip key={c.k} active={tab === c.k} onPress={() => setTab(c.k)}>
            {c.l}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28, gap: 12 }}>
        {filtered.map((d, i) => (
          <Rise key={d.id} delay={i * 50}>
            <DealCard
              deal={d}
              onUse={() => {
                setAppliedPromo({ code: d.code, title: d.title, value: d.value, shopId: d.shopId });
                showToast(`اتفعّل كود ${d.code}`, <Icon.tag size={16} color={colors.gold} />);
                if (d.shopId) {
                  router.push({ pathname: '/shop', params: { id: d.shopId } });
                } else {
                  router.back();
                }
              }}
              onCopy={() => showToast(`اتنسخ كود ${d.code}`, <Icon.check size={16} color={colors.gold} />)}
            />
          </Rise>
        ))}

        <FadeUp delay={150}>
          <View
            style={{
              marginTop: 16,
              padding: 14,
              backgroundColor: colors.canvas200,
              borderRadius: 12,
              flexDirection: 'row',
              gap: 10,
            }}
          >
            <Icon.info size={16} color={colors.inkLight} />
            <Text
              style={{
                flex: 1,
                fontFamily: fonts.arabic,
                fontSize: 12.5,
                color: colors.inkLight,
                lineHeight: 20,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              كل العروض سارية حتى نهاية الشهر. كود واحد بس على الطلب.
            </Text>
          </View>
        </FadeUp>
      </ScrollView>
    </View>
  );
}

function DealCard({ deal, onUse, onCopy }: { deal: Deal; onUse: () => void; onCopy: () => void }) {
  return (
    <LinearGradient
      colors={[deal.bgFrom, deal.bgTo]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 16,
        padding: 20,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: -20,
          insetInlineEnd: -10,
          width: 110,
          height: 110,
          borderRadius: 55,
          backgroundColor: 'rgba(250,248,243,0.08)',
        }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Badge variant="solid-gold">{deal.value}</Badge>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: 'rgba(250,248,243,0.14)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {deal.icon === 'bike' ? (
            <Icon.bike size={22} color={colors.canvas} />
          ) : deal.icon === 'pill' ? (
            <Icon.pill size={22} color={colors.canvas} />
          ) : deal.icon === 'wallet' ? (
            <Icon.wallet size={22} color={colors.canvas} />
          ) : deal.icon === 'utensils' ? (
            <Icon.utensils size={22} color={colors.canvas} />
          ) : (
            <Icon.tag size={22} color={colors.canvas} />
          )}
        </View>
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={{ fontFamily: fonts.arabicBold, fontSize: 22, color: colors.canvas, lineHeight: 28 }}>
          {deal.title}
        </Text>
        <Text
          style={{
            fontFamily: fonts.arabic,
            fontSize: 13,
            color: 'rgba(250,248,243,0.78)',
            marginTop: 6,
            lineHeight: 20,
          }}
        >
          {deal.sub}
        </Text>
      </View>

      <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable
          onPress={onCopy}
          style={{
            backgroundColor: 'rgba(250,248,243,0.14)',
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.arabicBold,
              fontSize: 13,
              color: colors.canvas,
              letterSpacing: 1.4,
            }}
          >
            {deal.code}
          </Text>
          <Icon.tag size={13} color={colors.canvas} />
        </Pressable>
        <Pressable
          onPress={onUse}
          style={{
            flex: 1,
            backgroundColor: colors.canvas,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontFamily: fonts.arabicBold, fontSize: 14, color: colors.olive }}>
            استخدم العرض
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}
