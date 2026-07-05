"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MAWKIB_DEFAULT_RESERVATION_DAYS = exports.DEFAULT_MAWKIB_MAX_RESERVATION_DAYS = void 0;
exports.effectiveMaxReservationDays = effectiveMaxReservationDays;
exports.effectiveDefaultReservationDays = effectiveDefaultReservationDays;
exports.normalizeMawkibReservationDayFields = normalizeMawkibReservationDayFields;
exports.DEFAULT_MAWKIB_MAX_RESERVATION_DAYS = 7;
exports.DEFAULT_MAWKIB_DEFAULT_RESERVATION_DAYS = 1;
function effectiveMaxReservationDays(value) {
    return value != null && value >= 1
        ? value
        : exports.DEFAULT_MAWKIB_MAX_RESERVATION_DAYS;
}
function effectiveDefaultReservationDays(value) {
    return value != null && value >= 1
        ? value
        : exports.DEFAULT_MAWKIB_DEFAULT_RESERVATION_DAYS;
}
function normalizeMawkibReservationDayFields(input) {
    const maxReservationDays = effectiveMaxReservationDays(input.maxReservationDays);
    const defaultReservationDays = Math.min(effectiveDefaultReservationDays(input.defaultReservationDays), maxReservationDays);
    return { maxReservationDays, defaultReservationDays };
}
//# sourceMappingURL=mawkib-reservation.constants.js.map