import { Tabs } from 'expo-router';
import { LayoutDashboard, Package, ShoppingBag, Settings as SettingsIcon } from 'lucide-react-native';

import { colors, fonts } from '@/shared/theme';

/**
 * Merchant tab shell. Phase 8 stubs the four canonical tabs from the design
 * reference; Phase 9 fills each tab with production behavior wired to the
 * existing merchant repositories.
 */
export default function MerchantTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.olive,
        tabBarInactiveTintColor: colors.inkMute,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.canvas300,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.arabicSemiBold,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'الطلبات',
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'المنتجات',
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
