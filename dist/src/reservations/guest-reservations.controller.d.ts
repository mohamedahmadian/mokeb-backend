import { ReservationsService } from './reservations.service';
import { CreateGuestReservationDto, TrackByMobileDto, TrackReservationDto } from './dto/reservation.dto';
export declare class GuestReservationsController {
    private reservationsService;
    constructor(reservationsService: ReservationsService);
    createGuest(dto: CreateGuestReservationDto): Promise<{
        message: string;
        reservationId: number;
        trackingCode: string;
        status: import("@prisma/client").$Enums.ReservationStatus;
        mawkibName: string;
        reservationDate: string;
        reservationEndDate: string;
        maleGuestCount: number;
        femaleGuestCount: number;
    }>;
    track(query: TrackReservationDto): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ReservationStatus;
        reservationDate: Date;
        reservationEndDate: Date;
        maleGuestCount: number;
        femaleGuestCount: number;
        trackingCode: string;
        pilgrimMobile: string;
        companions: string | null;
        cancellationNote: string | null;
        mawkibId: number;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    trackByMobile(query: TrackByMobileDto): Promise<({
        mawkib: {
            id: number;
            name: string;
            address: string;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ReservationStatus;
        reservationDate: Date;
        reservationEndDate: Date;
        maleGuestCount: number;
        femaleGuestCount: number;
        trackingCode: string;
        pilgrimMobile: string;
        companions: string | null;
        cancellationNote: string | null;
        mawkibId: number;
        reservedByUserId: number;
        pilgrimUserId: number;
    })[]>;
}
