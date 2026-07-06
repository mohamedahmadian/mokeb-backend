import { BadRequestException } from '@nestjs/common';
import {
  Prisma,
  ReservationEventType,
  ReservationPresenceState,
} from '@prisma/client';
import {
  compareAttendanceBySecond,
  formatDateOnly,
  formatDateOnlyInAppTz,
  isSameAttendanceSecond,
  parseDateOnly,
} from '../common/utils/date.util';

/** Reject when the new timestamp shares the same second as an existing attendance time. */
export function assertUniqueAttendanceSecond(
  recordedAt: Date,
  reservation: {
    actualCheckInAt: Date | null;
    actualCheckOutAt?: Date | null;
  },
  existingEvents: { createdAt: Date }[],
): void {
  const candidates: Date[] = existingEvents.map((event) => event.createdAt);
  if (reservation.actualCheckInAt) {
    candidates.push(reservation.actualCheckInAt);
  }
  if (reservation.actualCheckOutAt) {
    candidates.push(reservation.actualCheckOutAt);
  }

  for (const existing of candidates) {
    if (isSameAttendanceSecond(recordedAt, existing)) {
      throw new BadRequestException(
        'ثانیه ثبت با رویداد قبلی یکسان است؛ لطفاً چند ثانیه بعد ثبت کنید یا ساعت دیگری انتخاب کنید',
      );
    }
  }
}

export type { ReservationPresenceState };

export interface ReservationEventLike {
  eventType: ReservationEventType;
  createdAt: Date | string;
}

const MOVEMENT_EVENT_TYPES: ReservationEventType[] = [
  ReservationEventType.CHECK_IN,
  ReservationEventType.TEMP_IN,
  ReservationEventType.TEMP_OUT,
  ReservationEventType.EARLY_CHECKOUT,
];

function isInMovementEvent(eventType: ReservationEventType): boolean {
  return (
    eventType === ReservationEventType.CHECK_IN ||
    eventType === ReservationEventType.TEMP_IN
  );
}

/** Sort by second, then IN before OUT within the same second, then millisecond. */
export function compareMovementEvents(
  a: ReservationEventLike,
  b: ReservationEventLike,
): number {
  const secondCmp = compareAttendanceBySecond(
    new Date(a.createdAt),
    new Date(b.createdAt),
  );
  if (secondCmp !== 0) return secondCmp;

  const rank = (event: ReservationEventLike) =>
    isInMovementEvent(event.eventType) ? 0 : 1;
  const rankCmp = rank(a) - rank(b);
  if (rankCmp !== 0) return rankCmp;

  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

/** Include implicit check-in from reservation when confirm set actualCheckInAt without an event row. */
export function buildEffectiveAttendanceEvents(
  events: ReservationEventLike[],
  actualCheckInAt: Date | null,
): ReservationEventLike[] {
  const effective = [...events];
  const hasCheckInEvent = effective.some(
    (e) => e.eventType === ReservationEventType.CHECK_IN,
  );

  if (actualCheckInAt && !hasCheckInEvent) {
    effective.push({
      eventType: ReservationEventType.CHECK_IN,
      createdAt: actualCheckInAt,
    });
  }

  return effective
    .filter((e) => MOVEMENT_EVENT_TYPES.includes(e.eventType))
    .sort(compareMovementEvents);
}

export function resolvePresenceState(
  events: ReservationEventLike[],
  reservation: {
    actualCheckInAt: Date | null;
    actualCheckOutAt: Date | null;
    status: string;
  },
): ReservationPresenceState {
  if (
    reservation.actualCheckOutAt ||
    reservation.status === 'Completed' ||
    events.some((e) => e.eventType === ReservationEventType.EARLY_CHECKOUT)
  ) {
    return ReservationPresenceState.LEFT;
  }

  const sorted = buildEffectiveAttendanceEvents(
    events,
    reservation.actualCheckInAt,
  );

  const hasArrived =
    !!reservation.actualCheckInAt ||
    sorted.some((e) => e.eventType === ReservationEventType.CHECK_IN);

  if (!hasArrived) return ReservationPresenceState.NOT_ARRIVED;

  let state: ReservationPresenceState = ReservationPresenceState.NOT_ARRIVED;

  for (const event of sorted) {
    switch (event.eventType) {
      case ReservationEventType.CHECK_IN:
      case ReservationEventType.TEMP_IN:
        state = ReservationPresenceState.PRESENT;
        break;
      case ReservationEventType.TEMP_OUT:
        state = ReservationPresenceState.TEMPORARILY_OUT;
        break;
      case ReservationEventType.EARLY_CHECKOUT:
        return ReservationPresenceState.LEFT;
      default:
        break;
    }
  }

  return state === ReservationPresenceState.NOT_ARRIVED
    ? ReservationPresenceState.PRESENT
    : state;
}

const reservationPresenceSelect = {
  actualCheckInAt: true,
  actualCheckOutAt: true,
  status: true,
  presenceState: true,
} as const;

/** Recompute presence from events and persist on the reservation row. */
export async function syncReservationPresenceState(
  client: Prisma.TransactionClient | PrismaServiceLike,
  reservationId: number,
): Promise<ReservationPresenceState> {
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

type PrismaServiceLike = {
  reservation: Prisma.TransactionClient['reservation'];
  reservationEvent: Prisma.TransactionClient['reservationEvent'];
};

/** Presence at end of a calendar day (for meal attendance reports). */
export function resolvePresenceStateAsOf(
  events: ReservationEventLike[],
  reservation: {
    actualCheckInAt: Date | null;
    actualCheckOutAt: Date | null;
  },
  reportDate: Date | string,
): ReservationPresenceState {
  const reportDayStr = formatDateOnly(parseDateOnly(reportDate));

  const isOnOrBeforeReportDay = (at: Date | string) =>
    formatDateOnlyInAppTz(new Date(at)) <= reportDayStr;

  const relevantEvents = events.filter((event) =>
    isOnOrBeforeReportDay(event.createdAt),
  );

  if (
    reservation.actualCheckOutAt &&
    isOnOrBeforeReportDay(reservation.actualCheckOutAt)
  ) {
    return ReservationPresenceState.LEFT;
  }

  if (
    relevantEvents.some(
      (event) => event.eventType === ReservationEventType.EARLY_CHECKOUT,
    )
  ) {
    return ReservationPresenceState.LEFT;
  }

  const effectiveCheckIn =
    reservation.actualCheckInAt &&
    isOnOrBeforeReportDay(reservation.actualCheckInAt)
      ? reservation.actualCheckInAt
      : null;

  return resolvePresenceState(relevantEvents, {
    actualCheckInAt: effectiveCheckIn,
    actualCheckOutAt: null,
    status: 'Confirmed',
  });
}

export function assertEventAllowed(
  eventType: ReservationEventType,
  presence: ReservationPresenceState,
  reservation: {
    actualCheckInAt: Date | null;
    actualCheckOutAt: Date | null;
    status: string;
  },
) {
  if (reservation.status === 'Cancelled' || reservation.status === 'Pending') {
    throw new Error('ATTENDANCE_NOT_ALLOWED');
  }

  switch (eventType) {
    case ReservationEventType.CHECK_IN:
      if (
        reservation.actualCheckInAt ||
        presence !== ReservationPresenceState.NOT_ARRIVED
      ) {
        throw new Error('CHECK_IN_ALREADY_RECORDED');
      }
      break;
    case ReservationEventType.TEMP_OUT:
      if (presence !== ReservationPresenceState.PRESENT) {
        throw new Error('TEMP_OUT_NOT_ALLOWED');
      }
      break;
    case ReservationEventType.TEMP_IN:
      if (presence !== ReservationPresenceState.TEMPORARILY_OUT) {
        throw new Error('TEMP_IN_NOT_ALLOWED');
      }
      break;
    case ReservationEventType.EARLY_CHECKOUT:
      if (
        !reservation.actualCheckInAt &&
        presence === ReservationPresenceState.NOT_ARRIVED
      ) {
        throw new Error('CHECKOUT_REQUIRES_CHECK_IN');
      }
      if (
        presence === ReservationPresenceState.LEFT ||
        reservation.actualCheckOutAt
      ) {
        throw new Error('CHECKOUT_ALREADY_RECORDED');
      }
      break;
    default:
      break;
  }
}

export interface ReservationEventSessionRow {
  id: string;
  inEvent?: ReservationEventLike & { id: number };
  outEvent?: ReservationEventLike & { id: number };
  open: boolean;
}

export function pairReservationEvents<
  T extends ReservationEventLike & { id: number },
>(events: T[]): ReservationEventSessionRow[] {
  const sorted = [...events].sort(compareMovementEvents);

  const rows: ReservationEventSessionRow[] = [];
  let pendingIn: T | undefined;

  for (const event of sorted) {
    if (
      event.eventType === ReservationEventType.CHECK_IN ||
      event.eventType === ReservationEventType.TEMP_IN
    ) {
      pendingIn = event;
      continue;
    }

    if (
      event.eventType === ReservationEventType.TEMP_OUT ||
      event.eventType === ReservationEventType.EARLY_CHECKOUT
    ) {
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
