"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeMobileDigits = normalizeMobileDigits;
exports.buildMobileSearchPatterns = buildMobileSearchPatterns;
exports.mobileDigitMatches = mobileDigitMatches;
exports.mobilesAreExactlyEqual = mobilesAreExactlyEqual;
exports.isCompleteMobileNumber = isCompleteMobileNumber;
exports.buildExactMobileLookupVariants = buildExactMobileLookupVariants;
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
function mobilesAreExactlyEqual(searchInput, storedMobile) {
    const searchDigits = normalizeMobileDigits(searchInput);
    const storedDigits = normalizeMobileDigits(storedMobile);
    if (!searchDigits || !storedDigits)
        return false;
    return searchDigits === storedDigits;
}
function isCompleteMobileNumber(input) {
    const digits = normalizeMobileDigits(input);
    return digits.length >= 10 && digits.length <= 15;
}
function buildExactMobileLookupVariants(input) {
    const digits = normalizeMobileDigits(input);
    if (!digits)
        return [];
    const variants = new Set([digits, input.trim()]);
    if (digits.startsWith('0') && digits.length >= 11) {
        const withoutZero = digits.slice(1);
        variants.add(withoutZero);
        variants.add(`+98${withoutZero}`);
        variants.add(`98${withoutZero}`);
    }
    else if (digits.startsWith('98') && digits.length >= 12) {
        const local = `0${digits.slice(2)}`;
        variants.add(local);
        variants.add(`+${digits}`);
        variants.add(digits.slice(2));
    }
    else if (digits.length === 10 && digits.startsWith('9')) {
        variants.add(`0${digits}`);
        variants.add(`+98${digits}`);
        variants.add(`98${digits}`);
    }
    return Array.from(variants).filter((value) => value.length > 0);
}
//# sourceMappingURL=mobile-search.util.js.map