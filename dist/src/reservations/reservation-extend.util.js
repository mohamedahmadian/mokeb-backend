"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeExtensionStartDate = computeExtensionStartDate;
exports.computeExtensionEndDate = computeExtensionEndDate;
exports.defaultExtensionStayDays = defaultExtensionStayDays;
exports.defaultExtensionEndDate = defaultExtensionEndDate;
const date_util_1 = require("../common/utils/date.util");
const mawkib_reservation_constants_1 = require("../mawkibs/mawkib-reservation.constants");
function computeExtensionStartDate(sourceEndDate) {
    return (0, date_util_1.formatDateOnly)((0, date_util_1.parseDateOnly)(sourceEndDate));
}
function computeExtensionEndDate(extensionStart, stayDays) {
    const span = (0, mawkib_reservation_constants_1.effectiveDefaultReservationDays)(stayDays);
    return (0, date_util_1.formatDateOnly)((0, date_util_1.addDays)(extensionStart, span));
}
function defaultExtensionStayDays(defaultReservationDays) {
    return (0, mawkib_reservation_constants_1.effectiveDefaultReservationDays)(defaultReservationDays);
}
function defaultExtensionEndDate(sourceEndDate, defaultReservationDays) {
    const start = computeExtensionStartDate(sourceEndDate);
    return computeExtensionEndDate(start, defaultExtensionStayDays(defaultReservationDays));
}
//# sourceMappingURL=reservation-extend.util.js.map