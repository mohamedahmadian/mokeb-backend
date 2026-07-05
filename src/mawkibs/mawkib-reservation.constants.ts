export const DEFAULT_MAWKIB_MAX_RESERVATION_DAYS = 7;
export const DEFAULT_MAWKIB_DEFAULT_RESERVATION_DAYS = 1;

export function effectiveMaxReservationDays(
  value?: number | null,
): number {
  return value != null && value >= 1
    ? value
    : DEFAULT_MAWKIB_MAX_RESERVATION_DAYS;
}

export function effectiveDefaultReservationDays(
  value?: number | null,
): number {
  return value != null && value >= 1
    ? value
    : DEFAULT_MAWKIB_DEFAULT_RESERVATION_DAYS;
}

export function normalizeMawkibReservationDayFields(input: {
  maxReservationDays?: number | null;
  defaultReservationDays?: number | null;
}): {
  maxReservationDays: number;
  defaultReservationDays: number;
} {
  const maxReservationDays = effectiveMaxReservationDays(input.maxReservationDays);
  const defaultReservationDays = Math.min(
    effectiveDefaultReservationDays(input.defaultReservationDays),
    maxReservationDays,
  );

  return { maxReservationDays, defaultReservationDays };
}
