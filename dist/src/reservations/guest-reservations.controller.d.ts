import { ReservationsService } from './reservations.service';
import { CreateGuestReservationDto, GuestRecordAttendanceDto, TrackByMobileDto, TrackReservationDto } from './dto/reservation.dto';
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
    checkInGuest(body: GuestRecordAttendanceDto): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
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
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
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
    checkOutGuest(body: GuestRecordAttendanceDto): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
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
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
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
            imageUrl: string | null;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
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
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
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
            phoneNumber: string;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            updatedAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
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
