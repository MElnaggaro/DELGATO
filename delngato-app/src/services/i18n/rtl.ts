import { I18nManager, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_LOCALE, type SupportedLocale, SUPPORTED_LOCALES } from './index';

const LOCALE_KEY = '@delngato/locale';

export function isRTL(locale: SupportedLocale): boolean {
  return locale === 'ar';
}

/**
 * Resolves which locale to boot the app with.
 * Order:
 *   1. Stored preference (set by user via Settings > Language).
 *   2. Device locale, but ONLY if it's Arabic — English speakers still get
 *      Arabic by default, per Law 01 ("Arabic First. Always.").
 *   3. Default (ar-EG).
 */
export async function resolveInitialLocale(): Promise<SupportedLocale> {
  try {
    const stored = await AsyncStorage.getItem(LOCALE_KEY);
    if (stored && (SUPPORTED_LOCALES as readonly string[]).includes(stored)) {
      return stored as SupportedLocale;
    }
  } catch {
    // AsyncStorage may fail on certain platforms; fall through to device locale
  }

  try {
    const Localization = await import('expo-localization');
    const device = Localization.getLocales()[0]?.languageCode ?? '';
    if (device.startsWith('ar')) return 'ar';
  } catch {
    // expo-localization may not be available on all platforms
  }

  return DEFAULT_LOCALE;
}

export async function persistLocale(locale: SupportedLocale): Promise<void> {
  await AsyncStorage.setItem(LOCALE_KEY, locale);
}

/**
 * Lock the native RTL direction to match the active locale.
 * Returns `true` if a reload was triggered (caller should not proceed with UI work).
 *
 * RN's I18nManager.forceRTL only takes effect after a native reload. We use
 * expo-updates.reloadAsync for that. In Expo Go this DOES work for the current
 * session but won't survive a launcher relaunch — dev clients are recommended
 * for testing the toggle.
 */
export async function applyRtlForLocale(locale: SupportedLocale): Promise<boolean> {
  const wantRtl = isRTL(locale);
  if (Platform.OS === 'web') return false;
  if (I18nManager.isRTL === wantRtl) return false;
  I18nManager.allowRTL(wantRtl);
  I18nManager.forceRTL(wantRtl);
  try {
    const Updates = await import('expo-updates');
    await Updates.reloadAsync();
    return true;
  } catch {
    // In development without expo-updates initialized, a reload via dev menu
    // is required. Swallow — caller proceeds and the next cold start lands
    // in the right direction.
    return false;
  }
}
