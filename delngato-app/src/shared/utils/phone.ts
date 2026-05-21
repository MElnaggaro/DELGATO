/**
 * Egyptian mobile number normalization.
 *
 * Inputs we accept:
 *   - Local: 01XXXXXXXXX (11 digits, starts with 01)
 *   - With country code: +201XXXXXXXXX or 00201XXXXXXXXX
 *   - With Arabic-Indic digits: ٠١٠١٢٣٤٥٦٧٨
 *   - With separators (spaces, dashes, dots)
 *
 * All normalize to: +201XXXXXXXXX (E.164).
 */

const AR_TO_LATIN: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

function toLatin(input: string): string {
  return input.replace(/[٠-٩]/g, (c) => AR_TO_LATIN[c] ?? c);
}

const ALLOWED_PREFIXES = ['010', '011', '012', '015'];

export function normalizeEgyptianPhone(raw: string): string | null {
  if (!raw) return null;
  let digits = toLatin(raw).replace(/[^\d]/g, '');
  if (digits.startsWith('0020')) digits = digits.slice(4);
  else if (digits.startsWith('20')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  // Now expecting 10 digits beginning with 10/11/12/15
  if (digits.length !== 10) return null;
  const prefix = '0' + digits.slice(0, 2);
  if (!ALLOWED_PREFIXES.includes(prefix)) return null;
  return `+20${digits}`;
}

/** True iff `normalizeEgyptianPhone(raw)` returns a value. */
export function isValidEgyptianPhone(raw: string): boolean {
  return normalizeEgyptianPhone(raw) !== null;
}

/** Pretty-prints the national portion: "10 1234 5678" (RTL-safe). */
export function formatNationalDisplay(e164: string): string {
  const m = e164.match(/^\+20(\d{2})(\d{4})(\d{4})$/);
  if (!m) return e164;
  return `${m[1]} ${m[2]} ${m[3]}`;
}
