import { addDays, formatDateOnly, parseDateOnly } from '../common/utils/date.util';
import { effectiveDefaultReservationDays } from '../mawkibs/mawkib-reservation.constants';

/** Current reservation end date (YYYY-MM-DD). */
export function currentReservationEndDate(
  sourceEndDate: Date | string | null | undefined,
  sourceStartDate: Date | string,
): string {
  return formatDateOnly(
    parseDateOnly(sourceEndDate ?? sourceStartDate),
  );
}

/** New end date after adding `extraDays` to the current end date. */
export function computeExtendedEndDate(
  currentEndDate: Date | string,
  extraDays: number,
): string {
  const span = effectiveDefaultReservationDays(extraDays);
  return formatDateOnly(addDays(parseDateOnly(currentEndDate), span));
}

export function defaultExtensionStayDays(
  defaultReservationDays?: number | null,
): number {
  return effectiveDefaultReservationDays(defaultReservationDays);
}

export function defaultExtendedEndDate(
  currentEndDate: Date | string,
  defaultReservationDays?: number | null,
): string {
  return computeExtendedEndDate(
    currentEndDate,
    defaultExtensionStayDays(defaultReservationDays),
  );
}

/** @deprecated Use currentReservationEndDate — kept for compatibility. */
export function computeExtensionStartDate(sourceEndDate: Date | string): string {
  return formatDateOnly(parseDateOnly(sourceEndDate));
}

/** @deprecated Use computeExtendedEndDate — kept for compatibility. */
export function computeExtensionEndDate(
  currentEndDate: string,
  extraDays: number,
): string {
  return computeExtendedEndDate(currentEndDate, extraDays);
}

/** @deprecated Use defaultExtendedEndDate — kept for compatibility. */
export function defaultExtensionEndDate(
  sourceEndDate: Date | string,
  defaultReservationDays?: number | null,
): string {
  return defaultExtendedEndDate(sourceEndDate, defaultReservationDays);
}
