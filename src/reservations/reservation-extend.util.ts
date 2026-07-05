import { addDays, formatDateOnly, parseDateOnly } from '../common/utils/date.util';
import { effectiveDefaultReservationDays } from '../mawkibs/mawkib-reservation.constants';

/** First day of the extension stay: same calendar day the source reservation ends. */
export function computeExtensionStartDate(sourceEndDate: Date | string): string {
  return formatDateOnly(parseDateOnly(sourceEndDate));
}

/** Checkout/end date for a stay of `stayDays` starting on `extensionStart`. */
export function computeExtensionEndDate(
  extensionStart: string,
  stayDays: number,
): string {
  const span = effectiveDefaultReservationDays(stayDays);
  return formatDateOnly(addDays(extensionStart, span));
}

export function defaultExtensionStayDays(
  defaultReservationDays?: number | null,
): number {
  return effectiveDefaultReservationDays(defaultReservationDays);
}

export function defaultExtensionEndDate(
  sourceEndDate: Date | string,
  defaultReservationDays?: number | null,
): string {
  const start = computeExtensionStartDate(sourceEndDate);
  return computeExtensionEndDate(start, defaultExtensionStayDays(defaultReservationDays));
}
