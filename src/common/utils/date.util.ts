export function parseDateOnly(value: string | Date): Date {
  if (value instanceof Date) {
    return new Date(
      Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
    );
  }
  const [y, m, d] = value.split('T')[0].split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** IANA timezone for calendar-day business logic (Iran). */
export const APP_TIMEZONE = 'Asia/Tehran';

/** YYYY-MM-DD for a calendar day in APP_TIMEZONE. */
export function formatDateOnlyInAppTz(date: Date, timeZone = APP_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Start of today in APP_TIMEZONE as a UTC-midnight Date (inventory/report shape). */
export function startOfAppDay(date = new Date(), timeZone = APP_TIMEZONE): Date {
  return parseDateOnly(formatDateOnlyInAppTz(date, timeZone));
}

export function todayDateStringInAppTz(timeZone = APP_TIMEZONE): string {
  return formatDateOnlyInAppTz(new Date(), timeZone);
}

export function addDays(date: Date | string, days: number): Date {
  const result = parseDateOnly(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function formatDateOnly(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function eachDateInRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const cur = parseDateOnly(start);
  const endDate = parseDateOnly(end);

  while (cur <= endDate) {
    dates.push(new Date(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  return dates;
}

/** Check-in to check-out span in calendar days (not inclusive night count). */
export function reservationStayDayCount(
  startDate: Date | string,
  endDate: Date | string,
): number {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

/** Calendar days to check capacity for a stay (check-in through day before checkout). */
export function eachOccupancyDayInStay(
  startDate: Date | string,
  endDate: Date | string,
): Date[] {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (end < start) return [];
  if (start.getTime() === end.getTime()) {
    return [];
  }
  return eachDateInRange(start, addDays(end, -1));
}
