import {
  ReservationEventType,
  ReservationPresenceState,
} from '@prisma/client';
import {
  appLocalDateTimeToUtc,
  formatDateOnlyInAppTz,
} from '../common/utils/date.util';
import {
  DEFAULT_CHECK_IN_TIME,
  normalizeTimeString,
} from './reservation-occupancy.util';

export type AbsentRegisterEventType = 'CHECK_IN' | 'TEMP_IN';

export interface AbsentRosterContext {
  referenceAt: Date | null;
  lastExitAt: Date | null;
  registerEventType: AbsentRegisterEventType;
  absenceKind: 'NOT_ARRIVED' | 'TEMPORARILY_OUT';
}

export function resolveAbsentRosterContext(
  reservation: {
    reservationDate: Date;
    plannedCheckInTime: string | null;
    createdAt: Date;
    presenceState: ReservationPresenceState;
  },
  events: { eventType: ReservationEventType; createdAt: Date }[],
): AbsentRosterContext | null {
  if (reservation.presenceState === ReservationPresenceState.PRESENT) {
    return null;
  }

  if (reservation.presenceState === ReservationPresenceState.LEFT) {
    return null;
  }

  const lastTempOut = events.find(
    (event) => event.eventType === ReservationEventType.TEMP_OUT,
  );

  if (reservation.presenceState === ReservationPresenceState.TEMPORARILY_OUT) {
    return {
      referenceAt: lastTempOut?.createdAt ?? null,
      lastExitAt: lastTempOut?.createdAt ?? null,
      registerEventType: 'TEMP_IN',
      absenceKind: 'TEMPORARILY_OUT',
    };
  }

  if (reservation.presenceState === ReservationPresenceState.NOT_ARRIVED) {
    const plannedAt = plannedCheckInReferenceAt(
      reservation.reservationDate,
      reservation.plannedCheckInTime,
    );
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

function laterInstant(a: Date, b: Date): Date {
  return a.getTime() >= b.getTime() ? a : b;
}

function plannedCheckInReferenceAt(
  reservationDate: Date,
  plannedCheckInTime: string | null,
): Date {
  const dateStr = formatDateOnlyInAppTz(reservationDate);
  const time =
    normalizeTimeString(plannedCheckInTime) ?? DEFAULT_CHECK_IN_TIME;
  return appLocalDateTimeToUtc(dateStr, time);
}
