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
    checkInGuest(body: TrackReservationDto): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        review: ({
            author: {
                id: number;
                fullName: string;
            };
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            reservationId: number;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            updatedAt: Date;
        }) | null;
    } & {
        id: number;
        mawkibId: number;
        pilgrimUserId: number;
        reservedByUserId: number;
        reservationDate: Date;
        reservationEndDate: Date;
        plannedCheckInTime: string | null;
        plannedCheckOutTime: string | null;
        actualCheckInAt: Date | null;
        actualCheckOutAt: Date | null;
        maleGuestCount: number;
        femaleGuestCount: number;
        trackingCode: string;
        pilgrimMobile: string;
        companions: string | null;
        description: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    }>;
    checkOutGuest(body: TrackReservationDto): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        review: ({
            author: {
                id: number;
                fullName: string;
            };
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            reservationId: number;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            updatedAt: Date;
        }) | null;
    } & {
        id: number;
        mawkibId: number;
        pilgrimUserId: number;
        reservedByUserId: number;
        reservationDate: Date;
        reservationEndDate: Date;
        plannedCheckInTime: string | null;
        plannedCheckOutTime: string | null;
        actualCheckInAt: Date | null;
        actualCheckOutAt: Date | null;
        maleGuestCount: number;
        femaleGuestCount: number;
        trackingCode: string;
        pilgrimMobile: string;
        companions: string | null;
        description: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    }>;
    track(query: TrackReservationDto): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        review: ({
            author: {
                id: number;
                fullName: string;
            };
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            reservationId: number;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            updatedAt: Date;
        }) | null;
    } & {
        id: number;
        mawkibId: number;
        pilgrimUserId: number;
        reservedByUserId: number;
        reservationDate: Date;
        reservationEndDate: Date;
        plannedCheckInTime: string | null;
        plannedCheckOutTime: string | null;
        actualCheckInAt: Date | null;
        actualCheckOutAt: Date | null;
        maleGuestCount: number;
        femaleGuestCount: number;
        trackingCode: string;
        pilgrimMobile: string;
        companions: string | null;
        description: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    }>;
    trackByMobile(query: TrackByMobileDto): Promise<({
        mawkib: {
            id: number;
            name: string;
            address: string;
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
    } & {
        id: number;
        mawkibId: number;
        pilgrimUserId: number;
        reservedByUserId: number;
        reservationDate: Date;
        reservationEndDate: Date;
        plannedCheckInTime: string | null;
        plannedCheckOutTime: string | null;
        actualCheckInAt: Date | null;
        actualCheckOutAt: Date | null;
        maleGuestCount: number;
        femaleGuestCount: number;
        trackingCode: string;
        pilgrimMobile: string;
        companions: string | null;
        description: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    })[]>;
}
