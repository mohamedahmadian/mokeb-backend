"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESERVATION_TRACKING_SEQUENCE_MAX = exports.RESERVATION_TRACKING_SEQUENCE_MIN = void 0;
exports.getJalaliDatePartsInAppTz = getJalaliDatePartsInAppTz;
exports.formatJalaliYearPrefix = formatJalaliYearPrefix;
exports.resolveJalaliYearFromTail = resolveJalaliYearFromTail;
exports.buildReservationTrackingDatePrefixFromParts = buildReservationTrackingDatePrefixFromParts;
exports.buildReservationTrackingDatePrefix = buildReservationTrackingDatePrefix;
exports.formatReservationTrackingCode = formatReservationTrackingCode;
exports.parseReservationTrackingCode = parseReservationTrackingCode;
exports.allocateNextReservationTrackingCode = allocateNextReservationTrackingCode;
const common_1 = require("@nestjs/common");
const date_util_1 = require("./date.util");
exports.RESERVATION_TRACKING_SEQUENCE_MIN = 1;
exports.RESERVATION_TRACKING_SEQUENCE_MAX = 9_999_999;
function getJalaliDatePartsInAppTz(date = new Date(), timeZone = date_util_1.APP_TIMEZONE) {
    const parts = new Intl.DateTimeFormat('en-u-ca-persian', {
        timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    }).formatToParts(date);
    const year = Number(parts.find((part) => part.type === 'year')?.value);
    const month = Number(parts.find((part) => part.type === 'month')?.value);
    const day = Number(parts.find((part) => part.type === 'day')?.value);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
        throw new common_1.BadRequestException('خطا در محاسبه تاریخ شمسی برای شناسه رزرو');
    }
    return { year, month, day };
}
function formatJalaliYearPrefix(jalaliYear) {
    const tail = jalaliYear % 100;
    return tail < 10 ? String(tail) : String(tail).padStart(2, '0');
}
function resolveJalaliYearFromTail(yearTail, referenceYear) {
    const century = Math.floor(referenceYear / 100) * 100;
    return century + yearTail;
}
function buildReservationTrackingDatePrefixFromParts(jalali) {
    return `${formatJalaliYearPrefix(jalali.year)}${String(jalali.month).padStart(2, '0')}${String(jalali.day).padStart(2, '0')}`;
}
function buildReservationTrackingDatePrefix(date = new Date(), timeZone = date_util_1.APP_TIMEZONE) {
    return buildReservationTrackingDatePrefixFromParts(getJalaliDatePartsInAppTz(date, timeZone));
}
function formatReservationTrackingCode(jalali, sequence) {
    if (sequence < exports.RESERVATION_TRACKING_SEQUENCE_MIN ||
        sequence > exports.RESERVATION_TRACKING_SEQUENCE_MAX) {
        throw new common_1.BadRequestException('شماره ترتیب شناسه رزرو نامعتبر است');
    }
    const prefix = buildReservationTrackingDatePrefixFromParts(jalali);
    return `${prefix}-${sequence}`;
}
function parseReservationTrackingCode(trackingCode, referenceYear) {
    const dashIndex = trackingCode.indexOf('-');
    if (dashIndex <= 0)
        return null;
    const sequencePart = trackingCode.slice(dashIndex + 1);
    if (!/^\d+$/.test(sequencePart))
        return null;
    const sequence = Number.parseInt(sequencePart, 10);
    if (!Number.isFinite(sequence) || sequence < 1)
        return null;
    const body = trackingCode.slice(0, dashIndex);
    const refYear = referenceYear ?? getJalaliDatePartsInAppTz().year;
    for (const yearLen of [2, 1]) {
        if (body.length !== yearLen + 4)
            continue;
        const yearTail = Number.parseInt(body.slice(0, yearLen), 10);
        const month = Number.parseInt(body.slice(yearLen, yearLen + 2), 10);
        const day = Number.parseInt(body.slice(yearLen + 2, yearLen + 4), 10);
        if (month < 1 || month > 12 || day < 1 || day > 31)
            continue;
        const jalaliYear = resolveJalaliYearFromTail(yearTail, refYear);
        if (formatJalaliYearPrefix(jalaliYear) !== body.slice(0, yearLen))
            continue;
        return { jalaliYear, month, day, sequence };
    }
    return null;
}
function maxSequenceForJalaliYear(trackingCodes, jalaliYear) {
    let max = 0;
    for (const trackingCode of trackingCodes) {
        const parsed = parseReservationTrackingCode(trackingCode, jalaliYear);
        if (!parsed || parsed.jalaliYear !== jalaliYear)
            continue;
        max = Math.max(max, parsed.sequence);
    }
    return max;
}
async function allocateNextReservationTrackingCode(prisma, at = new Date()) {
    const jalali = getJalaliDatePartsInAppTz(at);
    const datePrefix = buildReservationTrackingDatePrefixFromParts(jalali);
    const yearPrefix = formatJalaliYearPrefix(jalali.year);
    const candidates = await prisma.reservation.findMany({
        where: { trackingCode: { startsWith: yearPrefix } },
        select: { trackingCode: true },
    });
    const nextSequence = maxSequenceForJalaliYear(candidates.map((row) => row.trackingCode), jalali.year) + 1;
    if (nextSequence > exports.RESERVATION_TRACKING_SEQUENCE_MAX) {
        throw new common_1.BadRequestException('ظرفیت تولید شناسه رزرو برای این سال تکمیل شده است');
    }
    return `${datePrefix}-${nextSequence}`;
}
//# sourceMappingURL=reservation-code.util.js.map