import { useTranslation } from 'react-i18next';
import { useArabicDigits } from './useArabicDigits';

/**
 * Formats an EGP amount with the locale-correct unit.
 *   AR: "١٨٧ ج.م"  (Arabic-Indic + colloquial currency)
 *   EN: "187 EGP"
 *
 * Note: in AR the unit appears AFTER the number even though the script is RTL.
 * The bidi algorithm handles ordering for us as long as we keep the literal
 * order "<number> <unit>" in the string.
 */
export function useCurrency() {
  const { t } = useTranslation();
  const arDigits = useArabicDigits();
  const unit = t('common.currency');
  return (amount: number): string => `${arDigits(amount)} ${unit}`;
}
