import { BadRequestException } from '@nestjs/common';
import type { Prisma, PrismaClient } from '@prisma/client';
import { APP_TIMEZONE } from './date.util';

/** First sequence number each Jalali year (inclusive). */
export const RESERVATION_TRACKING_SEQUENCE_MIN = 1;

/** Upper bound guard for yearly sequence. */
export const RESERVATION_TRACKING_SEQUENCE_MAX = 9_999_999;

type DbClient = PrismaClient | Prisma.TransactionClient;

export interface JalaliDateParts {
  year: number;
  month: number;
  day: number;
}

export interface ParsedReservationTrackingCode {
  jalaliYear: number;
  month: number;
  day: number;
  sequence: number;
}

/** Jalali calendar parts for a moment in APP_TIMEZONE (Iran). */
export function getJalaliDatePartsInAppTz(
  date = new Date(),
  timeZone = APP_TIMEZONE,
): JalaliDateParts {
  const parts = new Intl.DateTimeFormat('en-u-ca-persian', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    throw new BadRequestException('خطا در محاسبه تاریخ شمسی برای شناسه رزرو');
  }

  return { year, month, day };
}

/**
 * Variable-width Jalali year prefix: 1405 → "5", 1412 → "12".
 * Uses the last two digits of the year; single digit when < 10.
 */
export function formatJalaliYearPrefix(jalaliYear: number): string {
  const tail = jalaliYear % 100;
  return tail < 10 ? String(tail) : String(tail).padStart(2, '0');
}

export function resolveJalaliYearFromTail(
  yearTail: number,
  referenceYear: number,
): number {
  const century = Math.floor(referenceYear / 100) * 100;
  return century + yearTail;
}

/** Date body: {Y|YY}{MM}{DD} e.g. 50415 or 120415 */
export function buildReservationTrackingDatePrefixFromParts(
  jalali: JalaliDateParts,
): string {
  return `${formatJalaliYearPrefix(jalali.year)}${String(jalali.month).padStart(2, '0')}${String(jalali.day).padStart(2, '0')}`;
}

export function buildReservationTrackingDatePrefix(
  date = new Date(),
  timeZone = APP_TIMEZONE,
): string {
  return buildReservationTrackingDatePrefixFromParts(
    getJalaliDatePartsInAppTz(date, timeZone),
  );
}

/** Full code: {Y|YY}{MM}{DD}-{sequence} e.g. 50415-1 */
export function formatReservationTrackingCode(
  jalali: JalaliDateParts,
  sequence: number,
): string {
  if (
    sequence < RESERVATION_TRACKING_SEQUENCE_MIN ||
    sequence > RESERVATION_TRACKING_SEQUENCE_MAX
  ) {
    throw new BadRequestException('شماره ترتیب شناسه رزرو نامعتبر است');
  }

  const prefix = buildReservationTrackingDatePrefixFromParts(jalali);
  return `${prefix}-${sequence}`;
}

/** Parses codes produced by this generator (also matches legacy daily codes when unambiguous). */
export function parseReservationTrackingCode(
  trackingCode: string,
  referenceYear?: number,
): ParsedReservationTrackingCode | null {
  const dashIndex = trackingCode.indexOf('-');
  if (dashIndex <= 0) return null;

  const sequencePart = trackingCode.slice(dashIndex + 1);
  if (!/^\d+$/.test(sequencePart)) return null;

  const sequence = Number.parseInt(sequencePart, 10);
  if (!Number.isFinite(sequence) || sequence < 1) return null;

  const body = trackingCode.slice(0, dashIndex);
  const refYear = referenceYear ?? getJalaliDatePartsInAppTz().year;

  for (const yearLen of [2, 1] as const) {
    if (body.length !== yearLen + 4) continue;

    const yearTail = Number.parseInt(body.slice(0, yearLen), 10);
    const month = Number.parseInt(body.slice(yearLen, yearLen + 2), 10);
    const day = Number.parseInt(body.slice(yearLen + 2, yearLen + 4), 10);

    if (month < 1 || month > 12 || day < 1 || day > 31) continue;

    const jalaliYear = resolveJalaliYearFromTail(yearTail, refYear);
    if (formatJalaliYearPrefix(jalaliYear) !== body.slice(0, yearLen)) continue;

    return { jalaliYear, month, day, sequence };
  }

  return null;
}

function maxSequenceForJalaliYear(
  trackingCodes: string[],
  jalaliYear: number,
): number {
  let max = 0;

  for (const trackingCode of trackingCodes) {
    const parsed = parseReservationTrackingCode(trackingCode, jalaliYear);
    if (!parsed || parsed.jalaliYear !== jalaliYear) continue;
    max = Math.max(max, parsed.sequence);
  }

  return max;
}

/** Allocates the next tracking code; sequence resets each Jalali year. */
export async function allocateNextReservationTrackingCode(
  prisma: DbClient,
  at: Date = new Date(),
): Promise<string> {
  const jalali = getJalaliDatePartsInAppTz(at);
  const datePrefix = buildReservationTrackingDatePrefixFromParts(jalali);
  const yearPrefix = formatJalaliYearPrefix(jalali.year);

  const candidates = await prisma.reservation.findMany({
    where: { trackingCode: { startsWith: yearPrefix } },
    select: { trackingCode: true },
  });

  const nextSequence =
    maxSequenceForJalaliYear(
      candidates.map((row) => row.trackingCode),
      jalali.year,
    ) + 1;

  if (nextSequence > RESERVATION_TRACKING_SEQUENCE_MAX) {
    throw new BadRequestException(
      'ظرفیت تولید شناسه رزرو برای این سال تکمیل شده است',
    );
  }

  return `${datePrefix}-${nextSequence}`;
}
