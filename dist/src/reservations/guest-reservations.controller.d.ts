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
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
        review: ({
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    checkOutGuest(body: TrackReservationDto): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
        review: ({
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    }>;
    track(query: TrackReservationDto): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
        review: ({
            repliedBy: {
                id: number;
                fullName: string;
            } | null;
            author: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
            repliedByUserId: number | null;
            authorUserId: number;
        }) | null;
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
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
        mawkibId: number;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
        cancellationNote: string | null;
        reservedByUserId: number;
        pilgrimUserId: number;
    })[]>;
}
