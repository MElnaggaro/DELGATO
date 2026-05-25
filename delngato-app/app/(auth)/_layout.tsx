import { Stack } from 'expo-router';

import { colors } from '@/shared/theme';

/**
 * Auth route group — contains screens that can be reached from multiple
 * onboarding/login flows (role selection, lock cooldown, merchant login).
 * Kept separate from `(onboarding)` so merchant auth can live here without
 * the customer-shaped header animations.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.canvas },
        animation: 'slide_from_right',
        animationDuration: 280,
      }}
    />
  );
}
