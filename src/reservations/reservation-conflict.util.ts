import { ReservationStatus } from '@prisma/client';
import { parseDateOnly } from '../common/utils/date.util';

/** رزروهایی که مانع ثبت رزرو جدید برای همان زائر می‌شوند */
export const BLOCKING_RESERVATION_STATUSES: ReservationStatus[] = [
  ReservationStatus.Pending,
  ReservationStatus.Confirmed,
];

export function sameDateOnly(a: Date, b: Date): boolean {
  return parseDateOnly(a).getTime() === parseDateOnly(b).getTime();
}

export function reservationRangesOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
): boolean {
  const aStart = parseDateOnly(startA);
  const aEnd = parseDateOnly(endA);
  const bStart = parseDateOnly(startB);
  const bEnd = parseDateOnly(endB);
  return aStart <= bEnd && bStart <= aEnd;
}

export function isExactReservationDuplicate(
  existing: {
    mawkibId: number;
    reservationDate: Date;
    reservationEndDate: Date;
    maleGuestCount: number;
    femaleGuestCount: number;
  },
  candidate: {
    mawkibId: number;
    reservationDate: Date;
    reservationEndDate: Date;
    maleGuestCount: number;
    femaleGuestCount: number;
  },
): boolean {
  return (
    existing.mawkibId === candidate.mawkibId &&
    sameDateOnly(existing.reservationDate, candidate.reservationDate) &&
    sameDateOnly(existing.reservationEndDate, candidate.reservationEndDate) &&
    existing.maleGuestCount === candidate.maleGuestCount &&
    existing.femaleGuestCount === candidate.femaleGuestCount
  );
}
