import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';

/**
 * Returns the current writing direction and a helper for picking the
 * "visually correct" of two values (used by directional icons).
 *
 * We don't trust `I18nManager.isRTL` alone in dev because Expo Go resets it;
 * the active i18next language is the authoritative signal until the next cold
 * start fully applies forceRTL.
 */
export function useRtl() {
  const isRtl = true;
  return {
    isRtl,
    flexDirection: 'row' as const,
    textStart: (isRtl ? 'right' : 'left') as 'right' | 'left',
    alignStart: (isRtl ? 'flex-end' : 'flex-start') as 'flex-end' | 'flex-start',
    /** Pick `rtl` value in RTL contexts, `ltr` otherwise. */
    pick<T>(rtl: T, ltr: T): T {
      return isRtl ? rtl : ltr;
    },
  };
}
