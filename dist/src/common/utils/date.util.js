"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDateOnly = parseDateOnly;
exports.addDays = addDays;
exports.formatDateOnly = formatDateOnly;
exports.eachDateInRange = eachDateInRange;
function parseDateOnly(value) {
    if (value instanceof Date) {
        return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
    }
    const [y, m, d] = value.split('T')[0].split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
}
function addDays(date, days) {
    const result = parseDateOnly(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
}
function formatDateOnly(date) {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
function eachDateInRange(start, end) {
    const dates = [];
    const cur = parseDateOnly(start);
    const endDate = parseDateOnly(end);
    while (cur <= endDate) {
        dates.push(new Date(cur));
        cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return dates;
}
//# sourceMappingURL=date.util.js.map