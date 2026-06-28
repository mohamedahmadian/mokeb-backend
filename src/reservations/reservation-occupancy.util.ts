import { parseDateOnly } from '../common/utils/date.util';

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

/** Calendar-day occupancy — reservation end date is the last occupied day (inclusive). */
export function reservationOccupiesDay(
  reservation: {
    reservationDate: Date;
    reservationEndDate: Date;
    actualCheckOutAt: Date | null;
  },
  day: Date | string,
): boolean {
  const start = parseDateOnly(reservation.reservationDate);
  const end = parseDateOnly(reservation.reservationEndDate);
  const d = parseDateOnly(day);

  if (d < start || d > end) return false;

  if (reservation.actualCheckOutAt) {
    const checkoutDay = parseDateOnly(reservation.actualCheckOutAt);
    if (d >= checkoutDay) return false;
  }

  return true;
}

export function reservationOccupiedDays(reservation: {
  reservationDate: Date;
  reservationEndDate: Date;
  actualCheckOutAt: Date | null;
}): Date[] {
  const start = parseDateOnly(reservation.reservationDate);
  const end = parseDateOnly(reservation.reservationEndDate);
  const days: Date[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    if (reservationOccupiesDay(reservation, cursor)) {
      days.push(new Date(cursor));
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

/** Days freed when guest checks out before planned reservation end. */
export function reservationDaysReleasedOnCheckout(reservation: {
  reservationEndDate: Date;
  actualCheckOutAt: Date | null;
}): Date[] {
  if (!reservation.actualCheckOutAt) return [];

  const checkoutDay = parseDateOnly(reservation.actualCheckOutAt);
  const end = parseDateOnly(reservation.reservationEndDate);
  const days: Date[] = [];
  const cursor = new Date(checkoutDay);

  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

export function reservationOverlapsDateRange(
  reservation: {
    reservationDate: Date;
    reservationEndDate: Date;
    actualCheckOutAt: Date | null;
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
