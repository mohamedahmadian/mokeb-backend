import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateHonoraryVolunteerApplicationDto } from './dto/create-honorary-volunteer-application.dto';
import { CreateAuthenticatedVolunteerApplicationDto } from './dto/create-authenticated-volunteer-application.dto';
import { CreateMawkibNeedDto } from './dto/create-mawkib-need.dto';
import { HonoraryVolunteerFiltersDto } from './dto/honorary-volunteer-filters.dto';
import { ReviewHonoraryVolunteerApplicationDto } from './dto/review-honorary-volunteer-application.dto';
import { UpdateHonoraryVolunteerApplicationDto } from './dto/update-honorary-volunteer-application.dto';
export declare class HonoraryVolunteersService {
    private prisma;
    private authService;
    constructor(prisma: PrismaService, authService: AuthService);
    private validateDateRange;
    private assertMawkibExists;
    private assertOwnerMawkib;
    private buildWhere;
    private mapApplicationData;
    createVolunteer(dto: CreateHonoraryVolunteerApplicationDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            fullName: string;
            mobileNumber: string;
            roles: string[];
        };
        mawkib: {
            name: string;
            id: number;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                fullName: string;
                mobileNumber: string;
            };
        } | null;
        submittedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        } | null;
        reviewedBy: {
            id: number;
            fullName: string;
        } | null;
        id: number;
        mobileNumber: string;
        province: string | null;
        city: string | null;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        lastName: string;
        firstName: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        mawkibId: number | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    }>;
    createVolunteerForAuthenticatedUser(dto: CreateAuthenticatedVolunteerApplicationDto, user: AuthUser): Promise<{
        mawkib: {
            name: string;
            id: number;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                fullName: string;
                mobileNumber: string;
            };
        } | null;
        submittedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        } | null;
        reviewedBy: {
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        mobileNumber: string;
        province: string | null;
        city: string | null;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        lastName: string;
        firstName: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        mawkibId: number | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    }>;
    createMawkibNeed(dto: CreateMawkibNeedDto, ownerUserId: number): Promise<{
        mawkib: {
            name: string;
            id: number;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                fullName: string;
                mobileNumber: string;
            };
        } | null;
        submittedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        } | null;
        reviewedBy: {
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        mobileNumber: string;
        province: string | null;
        city: string | null;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        lastName: string;
        firstName: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        mawkibId: number | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    }>;
    findPublicNeeds(filters: HonoraryVolunteerFiltersDto): Prisma.PrismaPromise<({
        mawkib: {
            name: string;
            id: number;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                fullName: string;
                mobileNumber: string;
            };
        } | null;
        submittedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        } | null;
        reviewedBy: {
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        mobileNumber: string;
        province: string | null;
        city: string | null;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        lastName: string;
        firstName: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        mawkibId: number | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    })[]>;
    findAll(filters: HonoraryVolunteerFiltersDto): Prisma.PrismaPromise<({
        mawkib: {
            name: string;
            id: number;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                fullName: string;
                mobileNumber: string;
            };
        } | null;
        submittedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        } | null;
        reviewedBy: {
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        mobileNumber: string;
        province: string | null;
        city: string | null;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        lastName: string;
        firstName: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        mawkibId: number | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    })[]>;
    findByUser(user: AuthUser): Prisma.PrismaPromise<({
        mawkib: {
            name: string;
            id: number;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                fullName: string;
                mobileNumber: string;
            };
        } | null;
        submittedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        } | null;
        reviewedBy: {
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        mobileNumber: string;
        province: string | null;
        city: string | null;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        lastName: string;
        firstName: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        mawkibId: number | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    })[]>;
    findByTrackingCode(trackingCode: string): Promise<{
        mawkib: {
            name: string;
            id: number;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                fullName: string;
                mobileNumber: string;
            };
        } | null;
        submittedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        } | null;
        reviewedBy: {
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        mobileNumber: string;
        province: string | null;
        city: string | null;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        lastName: string;
        firstName: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        mawkibId: number | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    }>;
    findByMobileForGuest(mobileNumber: string): Prisma.PrismaPromise<({
        mawkib: {
            name: string;
            id: number;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                fullName: string;
                mobileNumber: string;
            };
        } | null;
        submittedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        } | null;
        reviewedBy: {
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        mobileNumber: string;
        province: string | null;
        city: string | null;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        lastName: string;
        firstName: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        mawkibId: number | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    })[]>;
    findOne(id: number): Promise<{
        mawkib: {
            name: string;
            id: number;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                fullName: string;
                mobileNumber: string;
            };
        } | null;
        submittedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        } | null;
        reviewedBy: {
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        mobileNumber: string;
        province: string | null;
        city: string | null;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        lastName: string;
        firstName: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        mawkibId: number | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    }>;
    private assertCanManageOwn;
    updateOwn(id: number, dto: UpdateHonoraryVolunteerApplicationDto, user: AuthUser): Promise<{
        mawkib: {
            name: string;
            id: number;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                fullName: string;
                mobileNumber: string;
            };
        } | null;
        submittedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        } | null;
        reviewedBy: {
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        mobileNumber: string;
        province: string | null;
        city: string | null;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        lastName: string;
        firstName: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        mawkibId: number | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    }>;
    cancelOwn(id: number, user: AuthUser): Promise<{
        mawkib: {
            name: string;
            id: number;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                fullName: string;
                mobileNumber: string;
            };
        } | null;
        submittedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        } | null;
        reviewedBy: {
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        mobileNumber: string;
        province: string | null;
        city: string | null;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        lastName: string;
        firstName: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        mawkibId: number | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    }>;
    review(id: number, dto: ReviewHonoraryVolunteerApplicationDto, reviewerUserId: number): Promise<{
        mawkib: {
            name: string;
            id: number;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                fullName: string;
                mobileNumber: string;
            };
        } | null;
        submittedBy: {
            id: number;
            fullName: string;
            mobileNumber: string;
        } | null;
        reviewedBy: {
            id: number;
            fullName: string;
        } | null;
    } & {
        id: number;
        mobileNumber: string;
        province: string | null;
        city: string | null;
        description: string | null;
        createdAt: Date;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        lastName: string;
        firstName: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        mawkibId: number | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    }>;
}
