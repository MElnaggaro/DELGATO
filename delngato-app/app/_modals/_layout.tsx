import { Stack } from 'expo-router';

/**
 * Modal route group. Screens here are presented as modals over the current
 * stack (semi-transparent backdrop, dismissable).
 */
export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'transparentModal',
        animation: 'fade',
        animationDuration: 200,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  );
}
