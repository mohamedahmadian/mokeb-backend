import { PrismaService } from '../prisma/prisma.service';
import { MawkibsService } from '../mawkibs/mawkibs.service';
import { CancelReservationDto, CreateReservationDto, CreateGuestReservationDto, ExtendReservationDto, RecordReservationAttendanceDto, SearchReservationDto, UpdateReservationStatusDto } from './dto/reservation.dto';
import { CreateReservationReviewDto, ReplyReservationReviewDto } from './dto/reservation-review.dto';
import { CreateReservationDeliveredItemDto, UpdateReservationDeliveredItemDto } from './dto/reservation-delivered-item.dto';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { ReservationEventsService } from './reservation-events.service';
import { MealPlansService } from '../meal-plans/meal-plans.service';
import { AttendanceRosterKind } from './dto/attendance-roster.dto';
export interface PaginatedReservationsResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export declare class ReservationsService {
    private prisma;
    private mawkibsService;
    private usersService;
    private reservationEventsService;
    private mealPlansService;
    constructor(prisma: PrismaService, mawkibsService: MawkibsService, usersService: UsersService, reservationEventsService: ReservationEventsService, mealPlansService: MealPlansService);
    private maybeGenerateMealPlans;
    private statusAuditFields;
    private appendWhereAnd;
    private buildReservationLookupOrConditions;
    private buildSearchWhere;
    private filterByGuestCountTotal;
    private sortByReservationDate;
    private applyLookupRanking;
    private applyListPagination;
    findAllAdmin(search?: SearchReservationDto): Promise<({
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    })[] | PaginatedReservationsResult<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>>;
    findByPilgrim(pilgrimUserId: number, search?: SearchReservationDto): Promise<({
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    })[] | PaginatedReservationsResult<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>>;
    findByMawkibOwner(ownerUserId: number, search?: SearchReservationDto): Promise<({
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    })[] | PaginatedReservationsResult<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>>;
    getPendingCountsByMawkib(user: AuthUser): Promise<{
        total: number;
        byMawkib: {
            mawkibId: number;
            mawkibName: string;
            count: number;
        }[];
    }>;
    private pickReservationForPilgrimCard;
    findLatestForPilgrimCard(pilgrimUserId: number, user: AuthUser, ownerScope?: boolean): Promise<({
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }) | null>;
    private filterReservationsByMobileSearch;
    findOne(id: number): Promise<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    findByTrackingCode(trackingCode: string): Promise<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    findRecentByMobileForGuest(mobileNumber: string): Promise<({
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    })[]>;
    findRecentByExactMobileForGuest(mobileNumber: string): Promise<({
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    })[]>;
    findOneForUser(id: number, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    private assertTrackingCodeAvailable;
    private createWithTrackingCode;
    private assertNoConflictingReservation;
    create(dto: CreateReservationDto, currentUser: AuthUser): Promise<{
        mawkib: {
            id: number;
            description: string | null;
            status: import("@prisma/client").$Enums.MawkibStatus;
            createdAt: Date;
            name: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            facilities: string | null;
            services: string | null;
            serviceStartDate: Date | null;
            serviceEndDate: Date | null;
            maleCapacity: number;
            femaleCapacity: number;
            imageUrl: string | null;
            distanceToShrine: string | null;
            distanceToBusStation: string | null;
            distanceToMetro: string | null;
            lunchReception: boolean;
            breakfastReception: boolean;
            dinnerReception: boolean;
            bathroom: boolean;
            laundry: boolean;
            parking: boolean;
            internet: boolean;
            familyFriendly: boolean;
            elevator: boolean;
            stairs: boolean;
            maxReservationDays: number;
            defaultReservationDays: number;
            country: import("@prisma/client").$Enums.MawkibCountry;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            rules: string | null;
            telegramChannel: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            websiteUrl: string | null;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            onlineReservationEnabled: boolean;
            autoApprovePilgrimReservations: boolean;
            recordCheckInOnReservationConfirm: boolean;
            skipCapacityCheckEnabled: boolean;
            mealPlanManagementEnabled: boolean;
            ownerUserId: number;
        };
        pilgrim: {
            id: number;
            description: string | null;
            createdAt: Date;
            imageUrl: string | null;
            country: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            passportNumber: string | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            telegram: string | null;
            email: string | null;
            isActive: boolean;
        };
        reservedBy: {
            id: number;
            description: string | null;
            createdAt: Date;
            imageUrl: string | null;
            country: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            passportNumber: string | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            telegram: string | null;
            email: string | null;
            isActive: boolean;
        };
        lastStatusUpdatedBy: {
            id: number;
            description: string | null;
            createdAt: Date;
            imageUrl: string | null;
            country: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            passportNumber: string | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            telegram: string | null;
            email: string | null;
            isActive: boolean;
        } | null;
        review: {
            id: number;
            createdAt: Date;
            reservationId: number;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            updatedAt: Date;
        } | null;
        deliveredItems: {
            id: number;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            createdAt: Date;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        }[];
        events: {
            id: number;
            description: string | null;
            createdAt: Date;
            reservationId: number;
            eventType: import("@prisma/client").$Enums.ReservationEventType;
            createdByUserId: number;
        }[];
        mealPlans: {
            id: number;
            createdAt: Date;
            reservationId: number;
            updatedAt: Date;
            date: Date;
            mealType: import("@prisma/client").$Enums.MealType;
            isRequired: boolean;
            isServed: boolean;
            servedAt: Date | null;
        }[];
        _count: {
            mawkib: number;
            pilgrim: number;
            reservedBy: number;
            lastStatusUpdatedBy: number;
            review: number;
            deliveredItems: number;
            events: number;
            mealPlans: number;
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
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
    updateStatus(id: number, dto: UpdateReservationStatusDto, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    cancel(id: number, dto: CancelReservationDto, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    extend(sourceId: number, dto: ExtendReservationDto, currentUser: AuthUser): Promise<{
        mawkib: {
            id: number;
            description: string | null;
            status: import("@prisma/client").$Enums.MawkibStatus;
            createdAt: Date;
            name: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            facilities: string | null;
            services: string | null;
            serviceStartDate: Date | null;
            serviceEndDate: Date | null;
            maleCapacity: number;
            femaleCapacity: number;
            imageUrl: string | null;
            distanceToShrine: string | null;
            distanceToBusStation: string | null;
            distanceToMetro: string | null;
            lunchReception: boolean;
            breakfastReception: boolean;
            dinnerReception: boolean;
            bathroom: boolean;
            laundry: boolean;
            parking: boolean;
            internet: boolean;
            familyFriendly: boolean;
            elevator: boolean;
            stairs: boolean;
            maxReservationDays: number;
            defaultReservationDays: number;
            country: import("@prisma/client").$Enums.MawkibCountry;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            rules: string | null;
            telegramChannel: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            websiteUrl: string | null;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            onlineReservationEnabled: boolean;
            autoApprovePilgrimReservations: boolean;
            recordCheckInOnReservationConfirm: boolean;
            skipCapacityCheckEnabled: boolean;
            mealPlanManagementEnabled: boolean;
            ownerUserId: number;
        };
        pilgrim: {
            id: number;
            description: string | null;
            createdAt: Date;
            imageUrl: string | null;
            country: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            passportNumber: string | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            telegram: string | null;
            email: string | null;
            isActive: boolean;
        };
        reservedBy: {
            id: number;
            description: string | null;
            createdAt: Date;
            imageUrl: string | null;
            country: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            passportNumber: string | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            telegram: string | null;
            email: string | null;
            isActive: boolean;
        };
        lastStatusUpdatedBy: {
            id: number;
            description: string | null;
            createdAt: Date;
            imageUrl: string | null;
            country: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            fullName: string;
            mobileNumber: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            passportNumber: string | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            telegram: string | null;
            email: string | null;
            isActive: boolean;
        } | null;
        review: {
            id: number;
            createdAt: Date;
            reservationId: number;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
            updatedAt: Date;
        } | null;
        deliveredItems: {
            id: number;
            description: string | null;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
            createdAt: Date;
            reservationId: number;
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        }[];
        events: {
            id: number;
            description: string | null;
            createdAt: Date;
            reservationId: number;
            eventType: import("@prisma/client").$Enums.ReservationEventType;
            createdByUserId: number;
        }[];
        mealPlans: {
            id: number;
            createdAt: Date;
            reservationId: number;
            updatedAt: Date;
            date: Date;
            mealType: import("@prisma/client").$Enums.MealType;
            isRequired: boolean;
            isServed: boolean;
            servedAt: Date | null;
        }[];
        _count: {
            mawkib: number;
            pilgrim: number;
            reservedBy: number;
            lastStatusUpdatedBy: number;
            review: number;
            deliveredItems: number;
            events: number;
            mealPlans: number;
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        message: string;
    }>;
    private resolveActualCheckInOnConfirm;
    private syncCheckInEventOnConfirm;
    private assertConfirmedReservationStillActive;
    private extractAppTimeString;
    private resolveCheckoutEndDate;
    private assertCheckoutEndDateValid;
    private performCheckOut;
    private performCheckOutUpdate;
    private assertCanRecordAttendance;
    private assertCanEditAttendance;
    private resolveRecordedAt;
    private assertUniqueAttendanceSecondForReservation;
    checkIn(id: number, currentUser: AuthUser, dto?: RecordReservationAttendanceDto): Promise<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    checkOut(id: number, currentUser: AuthUser, dto?: RecordReservationAttendanceDto): Promise<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    private assertCanManageAttendance;
    updateCheckIn(id: number, currentUser: AuthUser, dto: RecordReservationAttendanceDto): Promise<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    updateCheckOut(id: number, currentUser: AuthUser, dto: RecordReservationAttendanceDto): Promise<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    checkInGuest(trackingCode: string, dto?: RecordReservationAttendanceDto): Promise<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    checkOutGuest(trackingCode: string, dto?: RecordReservationAttendanceDto): Promise<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    private assertCanReviewReservation;
    createReview(reservationId: number, dto: CreateReservationReviewDto, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    updateReview(reservationId: number, dto: CreateReservationReviewDto, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    replyToReview(reservationId: number, dto: ReplyReservationReviewDto, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    private assertReservationEligibleForDeliveredItems;
    private assertCanManageDeliveredItems;
    createDeliveredItem(reservationId: number, dto: CreateReservationDeliveredItemDto, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    updateDeliveredItem(reservationId: number, itemId: number, dto: UpdateReservationDeliveredItemDto, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    receiveDeliveredItem(reservationId: number, itemId: number, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    removeDeliveredItem(reservationId: number, itemId: number, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            itemName: string;
            quantity: number;
            recordedByUserId: number;
            receivedAt: Date | null;
        })[];
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
        travelOrigin: string | null;
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        presenceState: import("@prisma/client").$Enums.ReservationPresenceState;
        lastStatusUpdatedByUserId: number | null;
        lastStatusUpdatedAt: Date | null;
        createdAt: Date;
    }>;
    getAttendanceRoster(kind: AttendanceRosterKind, user: AuthUser, mawkibId?: number): Promise<{
        kind: AttendanceRosterKind;
        generatedAt: string;
        mawkibId: number | null;
        rows: {
            reservationId: number;
            fullName: string;
            mobile: string;
            nationalId: string | null;
            durationMs: number;
            lastExitAt: string | null;
        }[];
    }>;
}
