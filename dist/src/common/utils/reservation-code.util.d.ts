import type { Prisma, PrismaClient } from '@prisma/client';
export declare const RESERVATION_TRACKING_SEQUENCE_MIN = 1;
export declare const RESERVATION_TRACKING_SEQUENCE_MAX = 9999999;
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
export declare function getJalaliDatePartsInAppTz(date?: Date, timeZone?: string): JalaliDateParts;
export declare function formatJalaliYearPrefix(jalaliYear: number): string;
export declare function resolveJalaliYearFromTail(yearTail: number, referenceYear: number): number;
export declare function buildReservationTrackingDatePrefixFromParts(jalali: JalaliDateParts): string;
export declare function buildReservationTrackingDatePrefix(date?: Date, timeZone?: string): string;
export declare function formatReservationTrackingCode(jalali: JalaliDateParts, sequence: number): string;
export declare function parseReservationTrackingCode(trackingCode: string, referenceYear?: number): ParsedReservationTrackingCode | null;
export declare function allocateNextReservationTrackingCode(prisma: DbClient, at?: Date): Promise<string>;
export {};
