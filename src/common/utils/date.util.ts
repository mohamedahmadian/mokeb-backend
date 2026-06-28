export function parseDateOnly(value: string | Date): Date {
  if (value instanceof Date) {
    return new Date(
      Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
    );
  }
  const [y, m, d] = value.split('T')[0].split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
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
