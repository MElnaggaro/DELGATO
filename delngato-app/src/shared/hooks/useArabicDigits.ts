import { useTranslation } from 'react-i18next';

const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;

/**
 * Converts ASCII digits to Arabic-Indic digits when the active locale is `ar`.
 * Brand rule (README): Arabic-Indic for in-product times and quantities;
 * Western for order IDs and technical codes (those use the mono font + `dir=ltr`).
 */
export function useArabicDigits() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  return (value: number | string): string => {
    const s = String(value);
    if (!isAr) return s;
    return s.replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]!);
  };
}
