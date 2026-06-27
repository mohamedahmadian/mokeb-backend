"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeMobileDigits = normalizeMobileDigits;
exports.buildMobileSearchPatterns = buildMobileSearchPatterns;
exports.mobileDigitMatches = mobileDigitMatches;
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
function normalizeMobileDigits(value) {
    const normalized = value.replace(/[۰-۹٠-٩]/g, (ch) => {
        const persianIndex = PERSIAN_DIGITS.indexOf(ch);
        if (persianIndex >= 0)
            return String(persianIndex);
        const arabicIndex = ARABIC_DIGITS.indexOf(ch);
        return arabicIndex >= 0 ? String(arabicIndex) : ch;
    });
    return normalized.replace(/\D/g, '');
}
function buildMobileSearchPatterns(input) {
    const digits = normalizeMobileDigits(input);
    if (!digits)
        return [];
    const patterns = new Set([digits]);
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
function mobileDigitMatches(searchDigits, storedMobile) {
    const storedDigits = normalizeMobileDigits(storedMobile);
    if (!storedDigits || !searchDigits)
        return false;
    if (searchDigits === storedDigits)
        return true;
    if (searchDigits.includes(storedDigits))
        return true;
    if (storedDigits.includes(searchDigits))
        return true;
    const searchTail = searchDigits.slice(-10);
    const storedTail = storedDigits.slice(-10);
    return (searchTail.length >= 8 &&
        storedTail.length >= 8 &&
        searchTail === storedTail);
}
//# sourceMappingURL=mobile-search.util.js.map