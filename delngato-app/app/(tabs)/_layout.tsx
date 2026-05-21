import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { BottomTabBar, Icon } from '@/shared/ui';
import { colors } from '@/shared/theme';

/**
 * Bottom tab navigator. Uses a custom tabbar component (brand-spec blur on
 * iOS, opaque canvas on Android). The native tabbar from React Navigation is
 * hidden via `tabBar={() => ...}`.
 */
export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.canvas } }}
      tabBar={(props) => {
        const active = (props.state.routes[props.state.index]?.name ?? 'home') as
          | 'home'
          | 'search'
          | 'cart'
          | 'profile';
        return (
          <BottomTabBar
            active={active}
            tabs={[
              { key: 'home', label: t('tabs.home'), Icon: Icon.home },
              { key: 'search', label: t('tabs.search'), Icon: Icon.search },
              { key: 'cart', label: t('tabs.cart'), Icon: Icon.cart },
              { key: 'profile', label: t('tabs.profile'), Icon: Icon.user },
            ]}
            onTabPress={(k) => props.navigation.navigate(k)}
          />
        );
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="cart" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
