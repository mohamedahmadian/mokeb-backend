"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeLookupQuery = normalizeLookupQuery;
exports.lookupQueryVariants = lookupQueryVariants;
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
function normalizeLookupQuery(value) {
    return value.replace(/[۰-۹٠-٩]/g, (ch) => {
        const persianIndex = PERSIAN_DIGITS.indexOf(ch);
        if (persianIndex >= 0)
            return String(persianIndex);
        const arabicIndex = ARABIC_DIGITS.indexOf(ch);
        return arabicIndex >= 0 ? String(arabicIndex) : ch;
    });
}
function lookupQueryVariants(value) {
    const trimmed = value.trim();
    if (!trimmed)
        return [];
    const normalized = normalizeLookupQuery(trimmed);
    return trimmed === normalized ? [trimmed] : [trimmed, normalized];
}
//# sourceMappingURL=lookup-query.util.js.map