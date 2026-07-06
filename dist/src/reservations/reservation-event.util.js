"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertUniqueAttendanceSecond = assertUniqueAttendanceSecond;
exports.compareMovementEvents = compareMovementEvents;
exports.buildEffectiveAttendanceEvents = buildEffectiveAttendanceEvents;
exports.resolvePresenceState = resolvePresenceState;
exports.syncReservationPresenceState = syncReservationPresenceState;
exports.resolvePresenceStateAsOf = resolvePresenceStateAsOf;
exports.assertEventAllowed = assertEventAllowed;
exports.pairReservationEvents = pairReservationEvents;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const date_util_1 = require("../common/utils/date.util");
function assertUniqueAttendanceSecond(recordedAt, reservation, existingEvents) {
    const candidates = existingEvents.map((event) => event.createdAt);
    if (reservation.actualCheckInAt) {
        candidates.push(reservation.actualCheckInAt);
    }
    if (reservation.actualCheckOutAt) {
        candidates.push(reservation.actualCheckOutAt);
    }
    for (const existing of candidates) {
        if ((0, date_util_1.isSameAttendanceSecond)(recordedAt, existing)) {
            throw new common_1.BadRequestException('ثانیه ثبت با رویداد قبلی یکسان است؛ لطفاً چند ثانیه بعد ثبت کنید یا ساعت دیگری انتخاب کنید');
        }
    }
}
const MOVEMENT_EVENT_TYPES = [
    client_1.ReservationEventType.CHECK_IN,
    client_1.ReservationEventType.TEMP_IN,
    client_1.ReservationEventType.TEMP_OUT,
    client_1.ReservationEventType.EARLY_CHECKOUT,
];
function isInMovementEvent(eventType) {
    return (eventType === client_1.ReservationEventType.CHECK_IN ||
        eventType === client_1.ReservationEventType.TEMP_IN);
}
function compareMovementEvents(a, b) {
    const secondCmp = (0, date_util_1.compareAttendanceBySecond)(new Date(a.createdAt), new Date(b.createdAt));
    if (secondCmp !== 0)
        return secondCmp;
    const rank = (event) => isInMovementEvent(event.eventType) ? 0 : 1;
    const rankCmp = rank(a) - rank(b);
    if (rankCmp !== 0)
        return rankCmp;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}
function buildEffectiveAttendanceEvents(events, actualCheckInAt) {
    const effective = [...events];
    const hasCheckInEvent = effective.some((e) => e.eventType === client_1.ReservationEventType.CHECK_IN);
    if (actualCheckInAt && !hasCheckInEvent) {
        effective.push({
            eventType: client_1.ReservationEventType.CHECK_IN,
            createdAt: actualCheckInAt,
        });
    }
    return effective
        .filter((e) => MOVEMENT_EVENT_TYPES.includes(e.eventType))
        .sort(compareMovementEvents);
}
function resolvePresenceState(events, reservation) {
    if (reservation.actualCheckOutAt ||
        reservation.status === 'Completed' ||
        events.some((e) => e.eventType === client_1.ReservationEventType.EARLY_CHECKOUT)) {
        return client_1.ReservationPresenceState.LEFT;
    }
    const sorted = buildEffectiveAttendanceEvents(events, reservation.actualCheckInAt);
    const hasArrived = !!reservation.actualCheckInAt ||
        sorted.some((e) => e.eventType === client_1.ReservationEventType.CHECK_IN);
    if (!hasArrived)
        return client_1.ReservationPresenceState.NOT_ARRIVED;
    let state = client_1.ReservationPresenceState.NOT_ARRIVED;
    for (const event of sorted) {
        switch (event.eventType) {
            case client_1.ReservationEventType.CHECK_IN:
            case client_1.ReservationEventType.TEMP_IN:
                state = client_1.ReservationPresenceState.PRESENT;
                break;
            case client_1.ReservationEventType.TEMP_OUT:
                state = client_1.ReservationPresenceState.TEMPORARILY_OUT;
                break;
            case client_1.ReservationEventType.EARLY_CHECKOUT:
                return client_1.ReservationPresenceState.LEFT;
            default:
                break;
        }
    }
    return state === client_1.ReservationPresenceState.NOT_ARRIVED
        ? client_1.ReservationPresenceState.PRESENT
        : state;
}
const reservationPresenceSelect = {
    actualCheckInAt: true,
    actualCheckOutAt: true,
    status: true,
    presenceState: true,
};
async function syncReservationPresenceState(client, reservationId) {
    const reservation = await client.reservation.findUniqueOrThrow({
        where: { id: reservationId },
        select: reservationPresenceSelect,
    });
    const events = await client.reservationEvent.findMany({
        where: { reservationId },
        select: { eventType: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
    });
    const nextPresence = resolvePresenceState(events, reservation);
    if (reservation.presenceState !== nextPresence) {
        await client.reservation.update({
            where: { id: reservationId },
            data: { presenceState: nextPresence },
        });
    }
    return nextPresence;
}
function resolvePresenceStateAsOf(events, reservation, reportDate) {
    const reportDayStr = (0, date_util_1.formatDateOnly)((0, date_util_1.parseDateOnly)(reportDate));
    const isOnOrBeforeReportDay = (at) => (0, date_util_1.formatDateOnlyInAppTz)(new Date(at)) <= reportDayStr;
    const relevantEvents = events.filter((event) => isOnOrBeforeReportDay(event.createdAt));
    if (reservation.actualCheckOutAt &&
        isOnOrBeforeReportDay(reservation.actualCheckOutAt)) {
        return client_1.ReservationPresenceState.LEFT;
    }
    if (relevantEvents.some((event) => event.eventType === client_1.ReservationEventType.EARLY_CHECKOUT)) {
        return client_1.ReservationPresenceState.LEFT;
    }
    const effectiveCheckIn = reservation.actualCheckInAt &&
        isOnOrBeforeReportDay(reservation.actualCheckInAt)
        ? reservation.actualCheckInAt
        : null;
    return resolvePresenceState(relevantEvents, {
        actualCheckInAt: effectiveCheckIn,
        actualCheckOutAt: null,
        status: 'Confirmed',
    });
}
function assertEventAllowed(eventType, presence, reservation) {
    if (reservation.status === 'Cancelled' || reservation.status === 'Pending') {
        throw new Error('ATTENDANCE_NOT_ALLOWED');
    }
    switch (eventType) {
        case client_1.ReservationEventType.CHECK_IN:
            if (reservation.actualCheckInAt ||
                presence !== client_1.ReservationPresenceState.NOT_ARRIVED) {
                throw new Error('CHECK_IN_ALREADY_RECORDED');
            }
            break;
        case client_1.ReservationEventType.TEMP_OUT:
            if (presence !== client_1.ReservationPresenceState.PRESENT) {
                throw new Error('TEMP_OUT_NOT_ALLOWED');
            }
            break;
        case client_1.ReservationEventType.TEMP_IN:
            if (presence !== client_1.ReservationPresenceState.TEMPORARILY_OUT) {
                throw new Error('TEMP_IN_NOT_ALLOWED');
            }
            break;
        case client_1.ReservationEventType.EARLY_CHECKOUT:
            if (!reservation.actualCheckInAt &&
                presence === client_1.ReservationPresenceState.NOT_ARRIVED) {
                throw new Error('CHECKOUT_REQUIRES_CHECK_IN');
            }
            if (presence === client_1.ReservationPresenceState.LEFT ||
                reservation.actualCheckOutAt) {
                throw new Error('CHECKOUT_ALREADY_RECORDED');
            }
            break;
        default:
            break;
    }
}
function pairReservationEvents(events) {
    const sorted = [...events].sort(compareMovementEvents);
    const rows = [];
    let pendingIn;
    for (const event of sorted) {
        if (event.eventType === client_1.ReservationEventType.CHECK_IN ||
            event.eventType === client_1.ReservationEventType.TEMP_IN) {
            pendingIn = event;
            continue;
        }
        if (event.eventType === client_1.ReservationEventType.TEMP_OUT ||
            event.eventType === client_1.ReservationEventType.EARLY_CHECKOUT) {
            rows.push({
                id: `session-${event.id}`,
                inEvent: pendingIn,
                outEvent: event,
                open: false,
            });
            pendingIn = undefined;
        }
    }
    if (pendingIn) {
        rows.push({
            id: `open-${pendingIn.id}`,
            inEvent: pendingIn,
            open: true,
        });
    }
    return rows;
}
//# sourceMappingURL=reservation-event.util.js.map