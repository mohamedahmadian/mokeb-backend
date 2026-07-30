"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentReservationEndDate = currentReservationEndDate;
exports.computeExtendedEndDate = computeExtendedEndDate;
exports.defaultExtensionStayDays = defaultExtensionStayDays;
exports.defaultExtendedEndDate = defaultExtendedEndDate;
exports.computeExtensionStartDate = computeExtensionStartDate;
exports.computeExtensionEndDate = computeExtensionEndDate;
exports.defaultExtensionEndDate = defaultExtensionEndDate;
const date_util_1 = require("../common/utils/date.util");
const mawkib_reservation_constants_1 = require("../mawkibs/mawkib-reservation.constants");
function currentReservationEndDate(sourceEndDate, sourceStartDate) {
    return (0, date_util_1.formatDateOnly)((0, date_util_1.parseDateOnly)(sourceEndDate ?? sourceStartDate));
}
function computeExtendedEndDate(currentEndDate, extraDays) {
    const span = (0, mawkib_reservation_constants_1.effectiveDefaultReservationDays)(extraDays);
    return (0, date_util_1.formatDateOnly)((0, date_util_1.addDays)((0, date_util_1.parseDateOnly)(currentEndDate), span));
}
function defaultExtensionStayDays(defaultReservationDays) {
    return (0, mawkib_reservation_constants_1.effectiveDefaultReservationDays)(defaultReservationDays);
}
function defaultExtendedEndDate(currentEndDate, defaultReservationDays) {
    return computeExtendedEndDate(currentEndDate, defaultExtensionStayDays(defaultReservationDays));
}
function computeExtensionStartDate(sourceEndDate) {
    return (0, date_util_1.formatDateOnly)((0, date_util_1.parseDateOnly)(sourceEndDate));
}
function computeExtensionEndDate(currentEndDate, extraDays) {
    return computeExtendedEndDate(currentEndDate, extraDays);
}
function defaultExtensionEndDate(sourceEndDate, defaultReservationDays) {
    return defaultExtendedEndDate(sourceEndDate, defaultReservationDays);
}
//# sourceMappingURL=reservation-extend.util.js.map