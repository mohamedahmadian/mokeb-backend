import { ReservationStatus, UserGender } from '@prisma/client';
export declare class CreateReservationDto {
    mawkibId: number;
    pilgrimUserId?: number;
    reservationDate: string;
    reservationEndDate?: string;
    maleGuestCount: number;
    femaleGuestCount: number;
    pilgrimMobile: string;
    description?: string;
    travelOrigin?: string;
    companions?: string;
    plannedCheckInTime?: string;
    plannedCheckOutTime?: string;
    skipCapacityCheck?: boolean;
    trackingCode?: string;
}
export declare class CreateGuestReservationDto {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    province?: string;
    city?: string;
    password?: string;
    nationalId?: string;
    nationalIdCardImageUrl?: string;
    gender?: UserGender;
    birthDate?: string;
    country?: string;
    passportNumber?: string;
    mawkibId: number;
    reservationDate: string;
    reservationEndDate: string;
    maleGuestCount: number;
    femaleGuestCount: number;
    description?: string;
    travelOrigin?: string;
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
export declare class UpdateReservationTrackingCodeDto {
    trackingCode: string;
}
export declare class SearchReservationDto {
    mawkibId?: number;
    status?: ReservationStatus;
    reservationDateFrom?: string;
    reservationDateTo?: string;
    createdAtFrom?: string;
    createdAtTo?: string;
    mawkibName?: string;
    sortOrder?: 'asc' | 'desc';
    pilgrimName?: string;
    pilgrimMobile?: string;
    pilgrimNationalId?: string;
    trackingCode?: string;
    lookupQuery?: string;
    pilgrimUserId?: number;
    guestCountMin?: number;
    guestCountMax?: number;
    page?: number;
    pageSize?: number;
    all?: boolean;
    lookupSingle?: boolean;
    lookupExact?: boolean;
}
export declare class TrackReservationDto {
    trackingCode: string;
}
export declare class TrackByMobileDto {
    mobileNumber: string;
}
export declare class TrackByExactMobileDto {
    mobileNumber: string;
}
export declare class ExtendReservationDto {
    reservationEndDate?: string;
    stayDays?: number;
}
export declare class RecordReservationAttendanceDto {
    recordedAt?: string;
}
export declare class GuestRecordAttendanceDto extends TrackReservationDto {
    recordedAt?: string;
}
