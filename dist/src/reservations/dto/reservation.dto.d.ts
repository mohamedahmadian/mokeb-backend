import { ReservationStatus } from '@prisma/client';
export declare class CreateReservationDto {
    mawkibId: number;
    pilgrimUserId?: number;
    reservationDate: string;
    guestCount: number;
    pilgrimMobile: string;
    description?: string;
}
export declare class UpdateReservationStatusDto {
    status: ReservationStatus;
}
