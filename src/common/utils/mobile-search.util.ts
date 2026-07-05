const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export function normalizeMobileDigits(value: string): string {
  const normalized = value.replace(/[۰-۹٠-٩]/g, (ch) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(ch);
    if (persianIndex >= 0) return String(persianIndex);
    const arabicIndex = ARABIC_DIGITS.indexOf(ch);
    return arabicIndex >= 0 ? String(arabicIndex) : ch;
  });

  return normalized.replace(/\D/g, '');
}

export function buildMobileSearchPatterns(input: string): string[] {
  const digits = normalizeMobileDigits(input);
  if (!digits) return [];

  const patterns = new Set<string>([digits]);

  for (let len = Math.min(digits.length, 11); len >= 3; len--) {
    patterns.add(digits.slice(0, len));
    patterns.add(digits.slice(-len));
  }

  const withoutLeadingZero = digits.replace(/^0+/, '');
  if (withoutLeadingZero && withoutLeadingZero !== digits) {
    patterns.add(withoutLeadingZero);
    for (let len = Math.min(withoutLeadingZero.length, 10); len >= 3; len--) {
      patterns.add(withoutLeadingZero.slice(0, len));
      patterns.add(withoutLeadingZero.slice(-len));
    }
  }

  return Array.from(patterns).filter((pattern) => pattern.length >= 3);
}

export function mobileDigitMatches(
  searchDigits: string,
  storedMobile: string,
): boolean {
  const storedDigits = normalizeMobileDigits(storedMobile);
  if (!storedDigits || !searchDigits) return false;
  if (searchDigits === storedDigits) return true;
  if (searchDigits.includes(storedDigits)) return true;
  if (storedDigits.includes(searchDigits)) return true;

  const searchTail = searchDigits.slice(-10);
  const storedTail = storedDigits.slice(-10);
  return (
    searchTail.length >= 8 &&
    storedTail.length >= 8 &&
    searchTail === storedTail
  );
}

/** تطابق دقیق شماره موبایل پس از نرمال‌سازی ارقام. */
export function mobilesAreExactlyEqual(
  searchInput: string,
  storedMobile: string,
): boolean {
  const searchDigits = normalizeMobileDigits(searchInput);
  const storedDigits = normalizeMobileDigits(storedMobile);
  if (!searchDigits || !storedDigits) return false;
  return searchDigits === storedDigits;
}

/** حداقل ۱۰ رقم برای جستجوی دقیق (شماره کامل). */
export function isCompleteMobileNumber(input: string): boolean {
  const digits = normalizeMobileDigits(input);
  return digits.length >= 10 && digits.length <= 15;
}

/** واریانت‌های رایج ذخیره‌شده برای جستجوی دقیق در پایگاه داده. */
export function buildExactMobileLookupVariants(input: string): string[] {
  const digits = normalizeMobileDigits(input);
  if (!digits) return [];

  const variants = new Set<string>([digits, input.trim()]);

  if (digits.startsWith('0') && digits.length >= 11) {
    const withoutZero = digits.slice(1);
    variants.add(withoutZero);
    variants.add(`+98${withoutZero}`);
    variants.add(`98${withoutZero}`);
  } else if (digits.startsWith('98') && digits.length >= 12) {
    const local = `0${digits.slice(2)}`;
    variants.add(local);
    variants.add(`+${digits}`);
    variants.add(digits.slice(2));
  } else if (digits.length === 10 && digits.startsWith('9')) {
    variants.add(`0${digits}`);
    variants.add(`+98${digits}`);
    variants.add(`98${digits}`);
  }

  return Array.from(variants).filter((value) => value.length > 0);
}
