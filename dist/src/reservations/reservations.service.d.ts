import { PrismaService } from '../prisma/prisma.service';
import { MawkibsService } from '../mawkibs/mawkibs.service';
import { ServantMawkibAccessService } from '../users/servant-mawkib-access.service';
import { CancelReservationDto, UpdateReservationTrackingCodeDto, CreateReservationDto, CreateGuestReservationDto, ExtendReservationDto, RecordReservationAttendanceDto, SearchReservationDto, UpdateReservationStatusDto } from './dto/reservation.dto';
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
    private servantMawkibAccess;
    private reservationEventsService;
    private mealPlansService;
    constructor(prisma: PrismaService, mawkibsService: MawkibsService, usersService: UsersService, servantMawkibAccess: ServantMawkibAccessService, reservationEventsService: ReservationEventsService, mealPlansService: MealPlansService);
    private maybeGenerateMealPlans;
    private statusAuditFields;
    private appendWhereAnd;
    private buildReservationLookupOrConditions;
    private buildReservationLookupOrConditionsForQuery;
    private buildSearchWhere;
    private filterByGuestCountTotal;
    private sortByCreatedAt;
    private applyLookupRanking;
    private applyListPagination;
    findAllAdmin(search?: SearchReservationDto): Promise<({
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    })[] | PaginatedReservationsResult<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    }>>;
    findByPilgrim(pilgrimUserId: number, search?: SearchReservationDto): Promise<({
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    })[] | PaginatedReservationsResult<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    }>>;
    findByMawkibIds(mawkibIds: number[], search?: SearchReservationDto): Promise<({
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    })[] | PaginatedReservationsResult<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    }>>;
    findByMawkibOwner(ownerUserId: number, search?: SearchReservationDto): Promise<({
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    })[] | PaginatedReservationsResult<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    }>>;
    findByMawkibServant(userId: number, search?: SearchReservationDto): Promise<({
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    })[] | PaginatedReservationsResult<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    }) | null>;
    private filterReservationsByMobileSearch;
    findOne(id: number): Promise<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    findByTrackingCode(trackingCode: string): Promise<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    findRecentByMobileForGuest(mobileNumber: string): Promise<({
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    findRecentByExactMobileForGuest(mobileNumber: string): Promise<({
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    findOneForUser(id: number, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    private assertTrackingCodeAvailable;
    private applyAcceptancePatternToReservation;
    private createWithTrackingCode;
    private assertNoConflictingReservation;
    private throwReservationConflict;
    create(dto: CreateReservationDto, currentUser: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            imageUrl: string | null;
            country: import("@prisma/client").$Enums.MawkibCountry;
            address: string;
            description: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.MawkibStatus;
            neshanAddressUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            facilities: string | null;
            services: string | null;
            serviceStartDate: Date | null;
            serviceEndDate: Date | null;
            maleCapacity: number;
            femaleCapacity: number;
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
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            rules: string | null;
            telegramChannel: string | null;
            websiteUrl: string | null;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            onlineReservationEnabled: boolean;
            autoApprovePilgrimReservations: boolean;
            recordCheckInOnReservationConfirm: boolean;
            skipCapacityCheckEnabled: boolean;
            mealPlanManagementEnabled: boolean;
            acceptanceType: import("@prisma/client").$Enums.MawkibAcceptanceType;
            stayDurationMode: import("@prisma/client").$Enums.MawkibStayDurationMode;
            fixedStayDays: number | null;
            reservationStartMode: import("@prisma/client").$Enums.MawkibReservationStartMode;
            formShowNationalId: boolean;
            formShowPassportNumber: boolean;
            formShowReservationCode: boolean;
            formShowCarPlate: boolean;
            formShowGender: boolean;
            formShowPassword: boolean;
            formShowLocation: boolean;
            formShowNationalIdCardImage: boolean;
            ownerUserId: number;
        };
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            imageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            country: string | null;
            passportNumber: string | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            address: string | null;
            carPlate: string | null;
            description: string | null;
            whatsapp: string | null;
            telegram: string | null;
            bale: string | null;
            eitaa: string | null;
            email: string | null;
            isActive: boolean;
            servantMawkibId: number | null;
            servantOwnerUserId: number | null;
            servantAllMawkibsAccess: boolean;
            createdAt: Date;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            imageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            country: string | null;
            passportNumber: string | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            address: string | null;
            carPlate: string | null;
            description: string | null;
            whatsapp: string | null;
            telegram: string | null;
            bale: string | null;
            eitaa: string | null;
            email: string | null;
            isActive: boolean;
            servantMawkibId: number | null;
            servantOwnerUserId: number | null;
            servantAllMawkibsAccess: boolean;
            createdAt: Date;
        };
        lastStatusUpdatedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
            nationalId: string | null;
            nationalIdCardImageUrl: string | null;
            imageUrl: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            birthDate: Date | null;
            country: string | null;
            passportNumber: string | null;
            passwordHash: string;
            province: string | null;
            city: string | null;
            address: string | null;
            carPlate: string | null;
            description: string | null;
            whatsapp: string | null;
            telegram: string | null;
            bale: string | null;
            eitaa: string | null;
            email: string | null;
            isActive: boolean;
            servantMawkibId: number | null;
            servantOwnerUserId: number | null;
            servantAllMawkibsAccess: boolean;
            createdAt: Date;
        } | null;
        review: {
            id: number;
            createdAt: Date;
            reservationId: number;
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
        } | null;
        deliveredItems: {
            id: number;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReservationDeliveredItemStatus;
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
            date: Date;
            updatedAt: Date;
            mealType: import("@prisma/client").$Enums.MealType;
            isRequired: boolean;
            guestCount: number;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    updateTrackingCode(id: number, dto: UpdateReservationTrackingCodeDto, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    cancel(id: number, dto: CancelReservationDto, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    extend(sourceId: number, dto: ExtendReservationDto, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    checkOut(id: number, currentUser: AuthUser, dto?: RecordReservationAttendanceDto): Promise<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    private assertCanManageAttendance;
    updateCheckIn(id: number, currentUser: AuthUser, dto: RecordReservationAttendanceDto): Promise<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    updateCheckOut(id: number, currentUser: AuthUser, dto: RecordReservationAttendanceDto): Promise<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    checkInGuest(trackingCode: string, dto?: RecordReservationAttendanceDto): Promise<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    checkOutGuest(trackingCode: string, dto?: RecordReservationAttendanceDto): Promise<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    private assertCanReviewReservation;
    createReview(reservationId: number, dto: CreateReservationReviewDto, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    updateReview(reservationId: number, dto: CreateReservationReviewDto, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    replyToReview(reservationId: number, dto: ReplyReservationReviewDto, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    private assertReservationEligibleForDeliveredItems;
    private assertCanManageDeliveredItems;
    createDeliveredItem(reservationId: number, dto: CreateReservationDeliveredItemDto, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    updateDeliveredItem(reservationId: number, itemId: number, dto: UpdateReservationDeliveredItemDto, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    receiveDeliveredItem(reservationId: number, itemId: number, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    removeDeliveredItem(reservationId: number, itemId: number, currentUser: AuthUser): Promise<{
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
            updatedAt: Date;
            authorUserId: number;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            repliedByUserId: number | null;
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
            recordedByUserId: number;
            receivedAt: Date | null;
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
    getAttendanceRoster(kind: AttendanceRosterKind, user: AuthUser, mawkibId?: number): Promise<{
        kind: AttendanceRosterKind;
        generatedAt: string;
        mawkibId: number | null;
        rows: NonNullable<{
            reservationId: number;
            fullName: string;
            mobile: string;
            nationalId: string | null;
            durationMs: number;
            lastExitAt: string | null;
            absenceKind: "NOT_ARRIVED" | "TEMPORARILY_OUT";
            registerEventType: import("./attendance-roster.util").AbsentRegisterEventType;
        } | {
            reservationId: number;
            fullName: string;
            mobile: string;
            nationalId: string | null;
            durationMs: number;
            lastExitAt: null;
            absenceKind: null;
            registerEventType: null;
        } | null>[];
    }>;
}
