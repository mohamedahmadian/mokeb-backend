"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP_TIMEZONE = void 0;
exports.parseDateOnly = parseDateOnly;
exports.formatDateOnlyInAppTz = formatDateOnlyInAppTz;
exports.startOfAppDay = startOfAppDay;
exports.todayDateStringInAppTz = todayDateStringInAppTz;
exports.addDays = addDays;
exports.formatDateOnly = formatDateOnly;
exports.eachDateInRange = eachDateInRange;
exports.reservationStayDayCount = reservationStayDayCount;
exports.eachOccupancyDayInStay = eachOccupancyDayInStay;
exports.eachMealPlanDayInStay = eachMealPlanDayInStay;
exports.compareAttendanceBySecond = compareAttendanceBySecond;
exports.isSameAttendanceSecond = isSameAttendanceSecond;
exports.compareAttendanceByMinute = compareAttendanceByMinute;
exports.isRecordedAtBeforeCheckInMinute = isRecordedAtBeforeCheckInMinute;
function parseDateOnly(value) {
    if (value instanceof Date) {
        return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
    }
    const [y, m, d] = value.split('T')[0].split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
}
exports.APP_TIMEZONE = 'Asia/Tehran';
function formatDateOnlyInAppTz(date, timeZone = exports.APP_TIMEZONE) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}
function startOfAppDay(date = new Date(), timeZone = exports.APP_TIMEZONE) {
    return parseDateOnly(formatDateOnlyInAppTz(date, timeZone));
}
function todayDateStringInAppTz(timeZone = exports.APP_TIMEZONE) {
    return formatDateOnlyInAppTz(new Date(), timeZone);
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
function reservationStayDayCount(startDate, endDate) {
    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);
    return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}
function eachOccupancyDayInStay(startDate, endDate) {
    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);
    if (end < start)
        return [];
    if (start.getTime() === end.getTime()) {
        return [];
    }
    return eachDateInRange(start, addDays(end, -1));
}
function eachMealPlanDayInStay(startDate, endDate) {
    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);
    if (end < start)
        return [];
    return eachDateInRange(start, end);
}
function attendanceMinuteParts(date, timeZone = exports.APP_TIMEZONE) {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(date);
    const pick = (type) => parts.find((p) => p.type === type)?.value ?? '00';
    return {
        year: Number(pick('year')),
        month: Number(pick('month')),
        day: Number(pick('day')),
        hour: Number(pick('hour')),
        minute: Number(pick('minute')),
    };
}
function attendanceSecondParts(date, timeZone = exports.APP_TIMEZONE) {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).formatToParts(date);
    const pick = (type) => parts.find((p) => p.type === type)?.value ?? '00';
    return {
        year: Number(pick('year')),
        month: Number(pick('month')),
        day: Number(pick('day')),
        hour: Number(pick('hour')),
        minute: Number(pick('minute')),
        second: Number(pick('second')),
    };
}
function compareAttendanceBySecond(a, b, timeZone = exports.APP_TIMEZONE) {
    const toKey = (date) => {
        const p = attendanceSecondParts(date, timeZone);
        return (p.year * 1_000_000_000_0 +
            p.month * 1_000_000_00 +
            p.day * 1_000_000 +
            p.hour * 10_000 +
            p.minute * 100 +
            p.second);
    };
    return toKey(a) - toKey(b);
}
function isSameAttendanceSecond(a, b, timeZone = exports.APP_TIMEZONE) {
    return compareAttendanceBySecond(a, b, timeZone) === 0;
}
function compareAttendanceByMinute(a, b, timeZone = exports.APP_TIMEZONE) {
    const toKey = (date) => {
        const p = attendanceMinuteParts(date, timeZone);
        return (p.year * 1_000_000_00 +
            p.month * 1_000_000 +
            p.day * 10_000 +
            p.hour * 100 +
            p.minute);
    };
    return toKey(a) - toKey(b);
}
function isRecordedAtBeforeCheckInMinute(recordedAt, checkInAt, timeZone = exports.APP_TIMEZONE) {
    return compareAttendanceByMinute(recordedAt, checkInAt, timeZone) < 0;
}
//# sourceMappingURL=date.util.js.map