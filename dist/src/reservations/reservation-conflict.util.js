"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLOCKING_RESERVATION_STATUSES = void 0;
exports.sameDateOnly = sameDateOnly;
exports.reservationRangesOverlap = reservationRangesOverlap;
exports.isExactReservationDuplicate = isExactReservationDuplicate;
const client_1 = require("@prisma/client");
const date_util_1 = require("../common/utils/date.util");
exports.BLOCKING_RESERVATION_STATUSES = [
    client_1.ReservationStatus.Pending,
    client_1.ReservationStatus.Confirmed,
];
function sameDateOnly(a, b) {
    return (0, date_util_1.parseDateOnly)(a).getTime() === (0, date_util_1.parseDateOnly)(b).getTime();
}
function reservationRangesOverlap(startA, endA, startB, endB) {
    const aStart = (0, date_util_1.parseDateOnly)(startA);
    const aEnd = (0, date_util_1.parseDateOnly)(endA);
    const bStart = (0, date_util_1.parseDateOnly)(startB);
    const bEnd = (0, date_util_1.parseDateOnly)(endB);
    return aStart <= bEnd && bStart <= aEnd;
}
function isExactReservationDuplicate(existing, candidate) {
    return (existing.mawkibId === candidate.mawkibId &&
        sameDateOnly(existing.reservationDate, candidate.reservationDate) &&
        sameDateOnly(existing.reservationEndDate, candidate.reservationEndDate) &&
        existing.maleGuestCount === candidate.maleGuestCount &&
        existing.femaleGuestCount === candidate.femaleGuestCount);
}
//# sourceMappingURL=reservation-conflict.util.js.map