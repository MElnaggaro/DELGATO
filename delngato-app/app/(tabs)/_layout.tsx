import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { BottomTabBar, Icon } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { useCartCount } from '@/features/cart/store';

/**
 * Bottom tab navigator. Tabs (per design): home, search, orders, profile.
 * Cart is reached from home/shop CTAs as a stack route, not a tab.
 */
export default function TabsLayout() {
  const { t } = useTranslation();
  const cartCount = useCartCount();
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.canvas } }}
      tabBar={(props) => {
        const active = (props.state.routes[props.state.index]?.name ?? 'home') as
          | 'home'
          | 'search'
          | 'orders'
          | 'profile';
        return (
          <BottomTabBar
            active={active}
            tabs={[
              { key: 'home', label: t('tabs.home'), Icon: Icon.home },
              { key: 'search', label: t('tabs.search'), Icon: Icon.search },
              {
                key: 'orders',
                label: t('orders.title'),
                Icon: Icon.receipt,
                badge: cartCount > 0 ? cartCount : undefined,
              },
              { key: 'profile', label: t('tabs.profile'), Icon: Icon.user },
            ]}
            onTabPress={(k) => props.navigation.navigate(k)}
          />
        );
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
