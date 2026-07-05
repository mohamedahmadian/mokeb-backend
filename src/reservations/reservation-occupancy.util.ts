import { addDays, eachOccupancyDayInStay, parseDateOnly } from '../common/utils/date.util';

export const DEFAULT_CHECK_IN_TIME = '14:00';
export const DEFAULT_CHECK_OUT_TIME = '11:00';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidTimeString(value: string): boolean {
  return TIME_PATTERN.test(value.trim());
}

export function normalizeTimeString(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (!isValidTimeString(trimmed)) {
    throw new Error('فرمت ساعت نامعتبر است (مثال: 14:00)');
  }
  return trimmed;
}

export function resolvePlannedTimes(
  input: { plannedCheckInTime?: string; plannedCheckOutTime?: string },
  mawkib: { defaultCheckInTime: string; defaultCheckOutTime: string },
) {
  return {
    plannedCheckInTime:
      normalizeTimeString(input.plannedCheckInTime) ??
      normalizeTimeString(mawkib.defaultCheckInTime) ??
      DEFAULT_CHECK_IN_TIME,
    plannedCheckOutTime:
      normalizeTimeString(input.plannedCheckOutTime) ??
      normalizeTimeString(mawkib.defaultCheckOutTime) ??
      DEFAULT_CHECK_OUT_TIME,
  };
}

/** Last calendar day that consumes inventory for a planned stay (checkout day is exclusive). */
export function lastPlannedOccupiedDay(
  reservationDate: Date | string,
  reservationEndDate: Date | string,
): Date {
  const start = parseDateOnly(reservationDate);
  const end = parseDateOnly(reservationEndDate);
  if (end <= start) {
    if (end < start) return start;
    return addDays(start, -1);
  }
  return addDays(end, -1);
}

/** Nights from check-in through day before checkout — checkout day does not consume capacity. */
export function reservationOccupiesDay(
  reservation: {
    reservationDate: Date;
    reservationEndDate: Date;
  },
  day: Date | string,
): boolean {
  const start = parseDateOnly(reservation.reservationDate);
  const end = parseDateOnly(reservation.reservationEndDate);
  const d = parseDateOnly(day);

  if (end < start) return false;

  if (start.getTime() === end.getTime()) {
    return false;
  }

  if (d < start || d >= end) {
    return false;
  }

  return true;
}

export function reservationOccupiedDays(reservation: {
  reservationDate: Date;
  reservationEndDate: Date;
}): Date[] {
  return eachOccupancyDayInStay(
    reservation.reservationDate,
    reservation.reservationEndDate,
  ).map((day) => new Date(day));
}

/** Inventory delta when reservationEndDate changes (e.g. early checkout). */
export function occupancyDaysDeltaOnEndDateChange(
  reservationDate: Date | string,
  previousEndDate: Date | string,
  newEndDate: Date | string,
): { released: Date[]; occupied: Date[] } {
  const previousDays = new Set(
    eachOccupancyDayInStay(reservationDate, previousEndDate).map((day) =>
      day.toISOString(),
    ),
  );
  const newDays = new Set(
    eachOccupancyDayInStay(reservationDate, newEndDate).map((day) =>
      day.toISOString(),
    ),
  );

  const released: Date[] = [];
  const occupied: Date[] = [];

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

/** @deprecated Use occupancyDaysDeltaOnEndDateChange — kept for tests migration. */
export function reservationDaysReleasedOnCheckout(reservation: {
  reservationDate: Date;
  reservationEndDate: Date;
  actualCheckOutAt: Date | null;
}): Date[] {
  if (!reservation.actualCheckOutAt) return [];

  const checkoutDay = parseDateOnly(reservation.actualCheckOutAt);
  const { released } = occupancyDaysDeltaOnEndDateChange(
    reservation.reservationDate,
    reservation.reservationEndDate,
    checkoutDay,
  );
  return released;
}

export function reservationOverlapsDateRange(
  reservation: {
    reservationDate: Date;
    reservationEndDate: Date;
  },
  startDate: Date | string,
  endDate: Date | string,
): boolean {
  const rangeStart = parseDateOnly(startDate);
  const rangeEnd = parseDateOnly(endDate);
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
