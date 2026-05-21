import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

/**
 * Subtle, brand-aligned tap feedback. "Premium without pretension" — light
 * impacts only; nothing buzzy or hard. Failures are swallowed (older devices).
 */
export function useHaptics() {
  const tap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);
  const success = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);
  const warning = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }, []);
  return { tap, success, warning };
}
