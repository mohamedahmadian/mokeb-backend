import { ReservationStatus } from '@prisma/client';
export declare const BLOCKING_RESERVATION_STATUSES: ReservationStatus[];
export declare function sameDateOnly(a: Date, b: Date): boolean;
export declare function reservationRangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean;
export declare function isExactReservationDuplicate(existing: {
    mawkibId: number;
    reservationDate: Date;
    reservationEndDate: Date;
    maleGuestCount: number;
    femaleGuestCount: number;
}, candidate: {
    mawkibId: number;
    reservationDate: Date;
    reservationEndDate: Date;
    maleGuestCount: number;
    femaleGuestCount: number;
}): boolean;
