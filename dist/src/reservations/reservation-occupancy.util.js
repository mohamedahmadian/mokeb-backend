"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CHECK_OUT_TIME = exports.DEFAULT_CHECK_IN_TIME = void 0;
exports.isValidTimeString = isValidTimeString;
exports.normalizeTimeString = normalizeTimeString;
exports.resolvePlannedTimes = resolvePlannedTimes;
exports.lastPlannedOccupiedDay = lastPlannedOccupiedDay;
exports.reservationOccupiesDay = reservationOccupiesDay;
exports.reservationOccupiedDays = reservationOccupiedDays;
exports.occupancyDaysDeltaOnEndDateChange = occupancyDaysDeltaOnEndDateChange;
exports.reservationDaysReleasedOnCheckout = reservationDaysReleasedOnCheckout;
exports.reservationOverlapsDateRange = reservationOverlapsDateRange;
const date_util_1 = require("../common/utils/date.util");
exports.DEFAULT_CHECK_IN_TIME = '14:00';
exports.DEFAULT_CHECK_OUT_TIME = '11:00';
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
function isValidTimeString(value) {
    return TIME_PATTERN.test(value.trim());
}
function normalizeTimeString(value) {
    const trimmed = value?.trim();
    if (!trimmed)
        return undefined;
    if (!isValidTimeString(trimmed)) {
        throw new Error('فرمت ساعت نامعتبر است (مثال: 14:00)');
    }
    return trimmed;
}
function resolvePlannedTimes(input, mawkib) {
    return {
        plannedCheckInTime: normalizeTimeString(input.plannedCheckInTime) ??
            normalizeTimeString(mawkib.defaultCheckInTime) ??
            exports.DEFAULT_CHECK_IN_TIME,
        plannedCheckOutTime: normalizeTimeString(input.plannedCheckOutTime) ??
            normalizeTimeString(mawkib.defaultCheckOutTime) ??
            exports.DEFAULT_CHECK_OUT_TIME,
    };
}
function lastPlannedOccupiedDay(reservationDate, reservationEndDate) {
    const start = (0, date_util_1.parseDateOnly)(reservationDate);
    const end = (0, date_util_1.parseDateOnly)(reservationEndDate);
    if (end <= start) {
        if (end < start)
            return start;
        return (0, date_util_1.addDays)(start, -1);
    }
    return (0, date_util_1.addDays)(end, -1);
}
function reservationOccupiesDay(reservation, day) {
    const start = (0, date_util_1.parseDateOnly)(reservation.reservationDate);
    const end = (0, date_util_1.parseDateOnly)(reservation.reservationEndDate);
    const d = (0, date_util_1.parseDateOnly)(day);
    if (end < start)
        return false;
    if (start.getTime() === end.getTime()) {
        return false;
    }
    if (d < start || d >= end) {
        return false;
    }
    return true;
}
function reservationOccupiedDays(reservation) {
    return (0, date_util_1.eachOccupancyDayInStay)(reservation.reservationDate, reservation.reservationEndDate).map((day) => new Date(day));
}
function occupancyDaysDeltaOnEndDateChange(reservationDate, previousEndDate, newEndDate) {
    const previousDays = new Set((0, date_util_1.eachOccupancyDayInStay)(reservationDate, previousEndDate).map((day) => day.toISOString()));
    const newDays = new Set((0, date_util_1.eachOccupancyDayInStay)(reservationDate, newEndDate).map((day) => day.toISOString()));
    const released = [];
    const occupied = [];
    for (const iso of previousDays) {
        if (!newDays.has(iso)) {
            released.push(new Date(iso));
        }
    }
    for (const iso of newDays) {
        if (!previousDays.has(iso)) {
            occupied.push(new Date(iso));
        }
    }
    return { released, occupied };
}
function reservationDaysReleasedOnCheckout(reservation) {
    if (!reservation.actualCheckOutAt)
        return [];
    const checkoutDay = (0, date_util_1.parseDateOnly)(reservation.actualCheckOutAt);
    const { released } = occupancyDaysDeltaOnEndDateChange(reservation.reservationDate, reservation.reservationEndDate, checkoutDay);
    return released;
}
function reservationOverlapsDateRange(reservation, startDate, endDate) {
    const rangeStart = (0, date_util_1.parseDateOnly)(startDate);
    const rangeEnd = (0, date_util_1.parseDateOnly)(endDate);
    let cursor = rangeStart;
    while (cursor <= rangeEnd) {
        if (reservationOccupiesDay(reservation, cursor)) {
            return true;
        }
        cursor = new Date(cursor);
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return false;
}
//# sourceMappingURL=reservation-occupancy.util.js.map