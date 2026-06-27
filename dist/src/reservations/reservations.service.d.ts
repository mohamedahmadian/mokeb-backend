import { PrismaService } from '../prisma/prisma.service';
import { MawkibsService } from '../mawkibs/mawkibs.service';
import { CancelReservationDto, CreateReservationDto, CreateGuestReservationDto, SearchReservationDto, UpdateReservationStatusDto } from './dto/reservation.dto';
import { CreateReservationReviewDto, ReplyReservationReviewDto } from './dto/reservation-review.dto';
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
    })[]>;
    findByPilgrim(pilgrimUserId: number, search?: SearchReservationDto): Promise<({
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
    })[]>;
    findByMawkibOwner(ownerUserId: number, search?: SearchReservationDto): Promise<({
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
    })[]>;
    private filterReservationsByMobileSearch;
    findOne(id: number): Promise<{
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
    findByTrackingCode(trackingCode: string): Promise<{
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
    findRecentByMobileForGuest(mobileNumber: string): Promise<({
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
    findOneForUser(id: number, currentUser: AuthUser): Promise<{
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
    private createWithTrackingCode;
    private assertNoConflictingReservation;
    create(dto: CreateReservationDto, currentUser: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            description: string | null;
            whatsapp: string | null;
            bale: string | null;
            eitaa: string | null;
            createdAt: Date;
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
            websiteUrl: string | null;
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            ownerUserId: number;
            status: import("@prisma/client").$Enums.MawkibStatus;
        };
        reservedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
            passwordHash: string;
            province: string | null;
            city: string | null;
            description: string | null;
            whatsapp: string | null;
            telegram: string | null;
            bale: string | null;
            eitaa: string | null;
            email: string | null;
            isActive: boolean;
            createdAt: Date;
        };
        review: {
            id: number;
            createdAt: Date;
            content: string;
            adminReply: string | null;
            repliedAt: Date | null;
            updatedAt: Date;
            reservationId: number;
            repliedByUserId: number | null;
            authorUserId: number;
        } | null;
        pilgrim: {
            id: number;
            mobileNumber: string;
            fullName: string;
            passwordHash: string;
            province: string | null;
            city: string | null;
            description: string | null;
            whatsapp: string | null;
            telegram: string | null;
            bale: string | null;
            eitaa: string | null;
            email: string | null;
            isActive: boolean;
            createdAt: Date;
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
    cancel(id: number, dto: CancelReservationDto, currentUser: AuthUser): Promise<{
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
    remove(id: number): Promise<{
        id: number;
        message: string;
    }>;
    private assertCanRecordAttendance;
    checkIn(id: number, currentUser: AuthUser): Promise<{
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
    checkOut(id: number, currentUser: AuthUser): Promise<{
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
    checkInGuest(trackingCode: string): Promise<{
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
    checkOutGuest(trackingCode: string): Promise<{
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
    private assertCanReviewReservation;
    createReview(reservationId: number, dto: CreateReservationReviewDto, currentUser: AuthUser): Promise<{
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
    updateReview(reservationId: number, dto: CreateReservationReviewDto, currentUser: AuthUser): Promise<{
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
    replyToReview(reservationId: number, dto: ReplyReservationReviewDto, currentUser: AuthUser): Promise<{
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
}
