import { PrismaService } from '../prisma/prisma.service';
import { MawkibsService } from '../mawkibs/mawkibs.service';
import { CancelReservationDto, CreateReservationDto, CreateGuestReservationDto, RecordReservationAttendanceDto, SearchReservationDto, UpdateReservationStatusDto } from './dto/reservation.dto';
import { CreateReservationReviewDto, ReplyReservationReviewDto } from './dto/reservation-review.dto';
import { CreateReservationDeliveredItemDto, UpdateReservationDeliveredItemDto } from './dto/reservation-delivered-item.dto';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
export declare class ReservationsService {
    private prisma;
    private mawkibsService;
    private usersService;
    constructor(prisma: PrismaService, mawkibsService: MawkibsService, usersService: UsersService);
    private buildSearchWhere;
    private filterByGuestCountTotal;
    findAllAdmin(search?: SearchReservationDto): Promise<({
        mawkib: {
            id: number;
            name: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            imageUrl: string | null;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    })[]>;
    findByPilgrim(pilgrimUserId: number, search?: SearchReservationDto): Promise<({
        mawkib: {
            id: number;
            name: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            imageUrl: string | null;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    })[]>;
    findByMawkibOwner(ownerUserId: number, search?: SearchReservationDto): Promise<({
        mawkib: {
            id: number;
            name: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            imageUrl: string | null;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    })[]>;
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
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    }>;
    findRecentByMobileForGuest(mobileNumber: string): Promise<({
        mawkib: {
            id: number;
            name: string;
            address: string;
            phoneNumber: string;
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    }>;
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
            lunchReception: boolean;
            breakfastReception: boolean;
            dinnerReception: boolean;
            bathroom: boolean;
            laundry: boolean;
            parking: boolean;
            internet: boolean;
            familyFriendly: boolean;
            maxReservationDays: number | null;
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
            ownerUserId: number;
        };
        pilgrim: {
            id: number;
            description: string | null;
            createdAt: Date;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            fullName: string;
            mobileNumber: string;
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
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            fullName: string;
            mobileNumber: string;
            passwordHash: string;
            province: string | null;
            city: string | null;
            telegram: string | null;
            email: string | null;
            isActive: boolean;
        };
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
        _count: {
            mawkib: number;
            pilgrim: number;
            reservedBy: number;
            review: number;
            deliveredItems: number;
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
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        message: string;
    }>;
    private assertCanRecordAttendance;
    private resolveRecordedAt;
    checkIn(id: number, currentUser: AuthUser, dto?: RecordReservationAttendanceDto): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            imageUrl: string | null;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    }>;
    checkOut(id: number, currentUser: AuthUser, dto?: RecordReservationAttendanceDto): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            imageUrl: string | null;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    }>;
    checkOutGuest(trackingCode: string, dto?: RecordReservationAttendanceDto): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            imageUrl: string | null;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
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
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            owner: {
                fullName: string;
                mobileNumber: string;
            };
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
        cancellationNote: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        createdAt: Date;
    }>;
}
