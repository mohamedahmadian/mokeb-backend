import { ReservationsService } from './reservations.service';
import { CreateGuestReservationDto, GuestRecordAttendanceDto, TrackByExactMobileDto, TrackReservationDto } from './dto/reservation.dto';
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
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            imageUrl: string | null;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        lastStatusUpdatedBy: {
            id: number;
            fullName: string;
        } | null;
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
            reservationId: number;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
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
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            createdAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
            updatedAt: Date;
        })[];
    } & {
        id: number;
        description: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
        mawkibId: number;
        pilgrimUserId: number;
        trackingCode: string;
        pilgrimMobile: string;
        reservedByUserId: number;
        reservationDate: Date;
        reservationEndDate: Date;
        plannedCheckInTime: string | null;
        plannedCheckOutTime: string | null;
        actualCheckInAt: Date | null;
        actualCheckOutAt: Date | null;
        maleGuestCount: number;
        femaleGuestCount: number;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    checkOutGuest(body: GuestRecordAttendanceDto): Promise<{
        mealPlanNotice: string | undefined;
        mawkib: {
            id: number;
            name: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            imageUrl: string | null;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        lastStatusUpdatedBy: {
            id: number;
            fullName: string;
        } | null;
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
            reservationId: number;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
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
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            createdAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
            updatedAt: Date;
        })[];
        id: number;
        description: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
        mawkibId: number;
        pilgrimUserId: number;
        trackingCode: string;
        pilgrimMobile: string;
        reservedByUserId: number;
        reservationDate: Date;
        reservationEndDate: Date;
        plannedCheckInTime: string | null;
        plannedCheckOutTime: string | null;
        actualCheckInAt: Date | null;
        actualCheckOutAt: Date | null;
        maleGuestCount: number;
        femaleGuestCount: number;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    track(query: TrackReservationDto): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            imageUrl: string | null;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        lastStatusUpdatedBy: {
            id: number;
            fullName: string;
        } | null;
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
            reservationId: number;
            updatedAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
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
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            createdAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
            updatedAt: Date;
        })[];
    } & {
        id: number;
        description: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
        mawkibId: number;
        pilgrimUserId: number;
        trackingCode: string;
        pilgrimMobile: string;
        reservedByUserId: number;
        reservationDate: Date;
        reservationEndDate: Date;
        plannedCheckInTime: string | null;
        plannedCheckOutTime: string | null;
        actualCheckInAt: Date | null;
        actualCheckOutAt: Date | null;
        maleGuestCount: number;
        femaleGuestCount: number;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    trackByExactMobile(query: TrackByExactMobileDto): Promise<({
        mawkib: {
            id: number;
            name: string;
            address: string;
            phoneNumber: string;
            imageUrl: string | null;
        };
        pilgrim: {
            id: number;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
        };
        reservedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        };
        deliveredItems: ({
            recordedBy: {
                id: number;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            createdAt: Date;
            reservationId: number;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
            updatedAt: Date;
        })[];
    } & {
        id: number;
        description: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
        mawkibId: number;
        pilgrimUserId: number;
        trackingCode: string;
        pilgrimMobile: string;
        reservedByUserId: number;
        reservationDate: Date;
        reservationEndDate: Date;
        plannedCheckInTime: string | null;
        plannedCheckOutTime: string | null;
        actualCheckInAt: Date | null;
        actualCheckOutAt: Date | null;
        maleGuestCount: number;
        femaleGuestCount: number;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    })[]>;
}
