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
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
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
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    checkOutGuest(body: GuestRecordAttendanceDto): Promise<{
        mealPlanNotice: string | undefined;
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
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
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    track(query: TrackReservationDto): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            maxReservationDays: number;
            defaultReservationDays: number;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            mealPlanManagementEnabled: boolean;
            owner: {
                mobileNumber: string;
                fullName: string;
            };
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
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
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    }>;
    trackByExactMobile(query: TrackByExactMobileDto): Promise<({
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            address: string;
            neshanAddressUrl: string | null;
            phoneNumber: string;
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
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
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            receivedAt: Date | null;
            recordedByUserId: number;
        })[];
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        trackingCode: string;
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
        pilgrimMobile: string;
        companions: string | null;
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
    })[]>;
}
