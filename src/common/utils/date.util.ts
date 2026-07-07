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

/** UTC instant for calendar YYYY-MM-DD + HH:mm in APP_TIMEZONE (e.g. 14:00 Tehran). */
export function appLocalDateTimeToUtc(
  calendarDate: string,
  timeHHmm: string,
  timeZone = APP_TIMEZONE,
): Date {
  const [year, month, day] = calendarDate.split('-').map(Number);
  const [hour, minute] = timeHHmm.split(':').map(Number);

  let utc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);

  for (let attempt = 0; attempt < 4; attempt++) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date(utc));

    const pick = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((p) => p.type === type)?.value ?? '0');

    const localYear = pick('year');
    const localMonth = pick('month');
    const localDay = pick('day');
    const localHour = pick('hour');
    const localMinute = pick('minute');

    if (
      localYear === year &&
      localMonth === month &&
      localDay === day &&
      localHour === hour &&
      localMinute === minute
    ) {
      return new Date(utc);
    }

    const desiredMinutes =
      Date.UTC(year, month - 1, day, hour, minute) / 60_000;
    const actualMinutes =
      Date.UTC(localYear, localMonth - 1, localDay, localHour, localMinute) /
      60_000;
    utc += (desiredMinutes - actualMinutes) * 60_000;
  }

  return new Date(utc);
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

/** Calendar days with meals during a stay (check-in through checkout day, inclusive). */
export function eachMealPlanDayInStay(
  startDate: Date | string,
  endDate: Date | string,
): Date[] {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (end < start) return [];
  return eachDateInRange(start, end);
}

function attendanceMinuteParts(date: Date, timeZone = APP_TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '00';

  return {
    year: Number(pick('year')),
    month: Number(pick('month')),
    day: Number(pick('day')),
    hour: Number(pick('hour')),
    minute: Number(pick('minute')),
  };
}

function attendanceSecondParts(date: Date, timeZone = APP_TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '00';

  return {
    year: Number(pick('year')),
    month: Number(pick('month')),
    day: Number(pick('day')),
    hour: Number(pick('hour')),
    minute: Number(pick('minute')),
    second: Number(pick('second')),
  };
}

/** Compare timestamps at second precision in APP_TIMEZONE (ms ignored). */
export function compareAttendanceBySecond(
  a: Date,
  b: Date,
  timeZone = APP_TIMEZONE,
): number {
  const toKey = (date: Date) => {
    const p = attendanceSecondParts(date, timeZone);
    return (
      p.year * 1_000_000_000_0 +
      p.month * 1_000_000_00 +
      p.day * 1_000_000 +
      p.hour * 10_000 +
      p.minute * 100 +
      p.second
    );
  };

  return toKey(a) - toKey(b);
}

export function isSameAttendanceSecond(
  a: Date,
  b: Date,
  timeZone = APP_TIMEZONE,
): boolean {
  return compareAttendanceBySecond(a, b, timeZone) === 0;
}

/** Compare clock times at minute precision in APP_TIMEZONE (seconds/ms ignored). */
export function compareAttendanceByMinute(
  a: Date,
  b: Date,
  timeZone = APP_TIMEZONE,
): number {
  const toKey = (date: Date) => {
    const p = attendanceMinuteParts(date, timeZone);
    return (
      p.year * 1_000_000_00 +
      p.month * 1_000_000 +
      p.day * 10_000 +
      p.hour * 100 +
      p.minute
    );
  };

  return toKey(a) - toKey(b);
}

/** True when recordedAt is strictly before check-in at minute precision. */
export function isRecordedAtBeforeCheckInMinute(
  recordedAt: Date,
  checkInAt: Date,
  timeZone = APP_TIMEZONE,
): boolean {
  return compareAttendanceByMinute(recordedAt, checkInAt, timeZone) < 0;
}
