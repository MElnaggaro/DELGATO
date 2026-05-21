import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from './locales/ar.json';
import en from './locales/en.json';

export const SUPPORTED_LOCALES = ['ar', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'ar';

let initialized = false;

export async function initI18n(initialLocale: SupportedLocale = DEFAULT_LOCALE) {
  if (initialized) {
    if (i18n.language !== initialLocale) {
      await i18n.changeLanguage(initialLocale);
    }
    return i18n;
  }

  await i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: initialLocale,
    // Arabic is canonical brand voice — never auto-fallback to English.
    fallbackLng: false,
    interpolation: { escapeValue: false },
    returnNull: false,
    // Inline resources → init is synchronous; but guard with initImmediate
    // to prevent i18next from trying to load resources asynchronously.
    initImmediate: false,
  });

  initialized = true;
  return i18n;
}

export { i18n };
