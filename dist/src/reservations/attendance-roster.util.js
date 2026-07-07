"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAbsentRosterContext = resolveAbsentRosterContext;
const client_1 = require("@prisma/client");
const date_util_1 = require("../common/utils/date.util");
const reservation_occupancy_util_1 = require("./reservation-occupancy.util");
function resolveAbsentRosterContext(reservation, events) {
    if (reservation.presenceState === client_1.ReservationPresenceState.PRESENT) {
        return null;
    }
    if (reservation.presenceState === client_1.ReservationPresenceState.LEFT) {
        return null;
    }
    const lastTempOut = events.find((event) => event.eventType === client_1.ReservationEventType.TEMP_OUT);
    if (reservation.presenceState === client_1.ReservationPresenceState.TEMPORARILY_OUT) {
        return {
            referenceAt: lastTempOut?.createdAt ?? null,
            lastExitAt: lastTempOut?.createdAt ?? null,
            registerEventType: 'TEMP_IN',
            absenceKind: 'TEMPORARILY_OUT',
        };
    }
    if (reservation.presenceState === client_1.ReservationPresenceState.NOT_ARRIVED) {
        const plannedAt = plannedCheckInReferenceAt(reservation.reservationDate, reservation.plannedCheckInTime);
        const referenceAt = laterInstant(plannedAt, reservation.createdAt);
        return {
            referenceAt,
            lastExitAt: null,
            registerEventType: 'CHECK_IN',
            absenceKind: 'NOT_ARRIVED',
        };
    }
    return null;
}
function laterInstant(a, b) {
    return a.getTime() >= b.getTime() ? a : b;
}
function plannedCheckInReferenceAt(reservationDate, plannedCheckInTime) {
    const dateStr = (0, date_util_1.formatDateOnlyInAppTz)(reservationDate);
    const time = (0, reservation_occupancy_util_1.normalizeTimeString)(plannedCheckInTime) ?? reservation_occupancy_util_1.DEFAULT_CHECK_IN_TIME;
    return (0, date_util_1.appLocalDateTimeToUtc)(dateStr, time);
}
//# sourceMappingURL=attendance-roster.util.js.map