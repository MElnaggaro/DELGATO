import { Stack } from 'expo-router';

import { colors } from '@/shared/theme';

/**
 * Merchant route group. Phase 8 ships the shell + gating screens
 * (kyc-pending, suspended). Phase 9 fills in the tabs + secondary screens
 * per `design/design-reference/app/merchant`.
 */
export default function MerchantLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.canvas },
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    />
  );
}
