import { ReservationStatus } from '@prisma/client';
export declare class CreateReservationDto {
    mawkibId: number;
    pilgrimUserId?: number;
    reservationDate: string;
    reservationEndDate?: string;
    maleGuestCount: number;
    femaleGuestCount: number;
    private readonly _guestCheck?;
    pilgrimMobile: string;
    description?: string;
    companions?: string;
    plannedCheckInTime?: string;
    plannedCheckOutTime?: string;
    skipCapacityCheck?: boolean;
}
export declare class CreateGuestReservationDto {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    province?: string;
    city?: string;
    password?: string;
    mawkibId: number;
    reservationDate: string;
    reservationEndDate: string;
    maleGuestCount: number;
    femaleGuestCount: number;
    private readonly _guestCheck?;
    description?: string;
    companions?: string;
    plannedCheckInTime?: string;
    plannedCheckOutTime?: string;
}
export declare class UpdateReservationStatusDto {
    status: ReservationStatus;
}
export declare class CancelReservationDto {
    note?: string;
}
export declare class SearchReservationDto {
    mawkibId?: number;
    status?: ReservationStatus;
    reservationDateFrom?: string;
    reservationDateTo?: string;
    pilgrimName?: string;
    pilgrimMobile?: string;
    trackingCode?: string;
    pilgrimUserId?: number;
    guestCountMin?: number;
    guestCountMax?: number;
}
export declare class TrackReservationDto {
    trackingCode: string;
}
export declare class TrackByMobileDto {
    mobileNumber: string;
}
