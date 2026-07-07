const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Normalize Persian/Arabic digits to ASCII (keeps other characters). */
export function normalizeLookupQuery(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (ch) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(ch);
    if (persianIndex >= 0) return String(persianIndex);
    const arabicIndex = ARABIC_DIGITS.indexOf(ch);
    return arabicIndex >= 0 ? String(arabicIndex) : ch;
  });
}

/** Distinct trimmed + digit-normalized lookup tokens. */
export function lookupQueryVariants(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) return [];

  const normalized = normalizeLookupQuery(trimmed);
  return trimmed === normalized ? [trimmed] : [trimmed, normalized];
}
