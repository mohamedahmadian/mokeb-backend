import { HonoraryVolunteersService } from './honorary-volunteers.service';
import { CreateHonoraryVolunteerApplicationDto } from './dto/create-honorary-volunteer-application.dto';
import { CreateAuthenticatedVolunteerApplicationDto } from './dto/create-authenticated-volunteer-application.dto';
import { CreateMawkibNeedDto } from './dto/create-mawkib-need.dto';
import { HonoraryVolunteerFiltersDto } from './dto/honorary-volunteer-filters.dto';
import { ReviewHonoraryVolunteerApplicationDto } from './dto/review-honorary-volunteer-application.dto';
import { UpdateHonoraryVolunteerApplicationDto } from './dto/update-honorary-volunteer-application.dto';
import { TrackHonoraryVolunteerByMobileDto, TrackHonoraryVolunteerDto } from './dto/track-honorary-volunteer.dto';
import type { AuthUser } from '../common/decorators/current-user.decorator';
export declare class HonoraryVolunteersController {
    private service;
    constructor(service: HonoraryVolunteersService);
    findPublicNeeds(filters: HonoraryVolunteerFiltersDto): import("@prisma/client").Prisma.PrismaPromise<({
        mawkib: {
            id: number;
            name: string;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        } | null;
        submittedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
        firstName: string;
        lastName: string;
        mawkibId: number | null;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    })[]>;
    track(query: TrackHonoraryVolunteerDto): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        } | null;
        submittedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
        firstName: string;
        lastName: string;
        mawkibId: number | null;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    }>;
    trackByMobile(query: TrackHonoraryVolunteerByMobileDto): import("@prisma/client").Prisma.PrismaPromise<({
        mawkib: {
            id: number;
            name: string;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        } | null;
        submittedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
        firstName: string;
        lastName: string;
        mawkibId: number | null;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    })[]>;
    create(dto: CreateHonoraryVolunteerApplicationDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            fullName: string;
            mobileNumber: string;
            roles: string[];
        };
        mawkib: {
            id: number;
            name: string;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        } | null;
        submittedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
        firstName: string;
        lastName: string;
        mawkibId: number | null;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    }>;
    createOwnerNeed(dto: CreateMawkibNeedDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        } | null;
        submittedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
        firstName: string;
        lastName: string;
        mawkibId: number | null;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    }>;
    createForAuthenticatedUser(dto: CreateAuthenticatedVolunteerApplicationDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        } | null;
        submittedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
        firstName: string;
        lastName: string;
        mawkibId: number | null;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    }>;
    findMy(user: AuthUser): import("@prisma/client").Prisma.PrismaPromise<({
        mawkib: {
            id: number;
            name: string;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        } | null;
        submittedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
        firstName: string;
        lastName: string;
        mawkibId: number | null;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    })[]>;
    findAll(filters: HonoraryVolunteerFiltersDto): import("@prisma/client").Prisma.PrismaPromise<({
        mawkib: {
            id: number;
            name: string;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        } | null;
        submittedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
        firstName: string;
        lastName: string;
        mawkibId: number | null;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    })[]>;
    findOne(id: number): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        } | null;
        submittedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
        firstName: string;
        lastName: string;
        mawkibId: number | null;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    }>;
    updateOwn(id: number, dto: UpdateHonoraryVolunteerApplicationDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        } | null;
        submittedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
        firstName: string;
        lastName: string;
        mawkibId: number | null;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    }>;
    cancelOwn(id: number, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        } | null;
        submittedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
        firstName: string;
        lastName: string;
        mawkibId: number | null;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    }>;
    review(id: number, dto: ReviewHonoraryVolunteerApplicationDto, user: AuthUser): Promise<{
        mawkib: {
            id: number;
            name: string;
            address: string;
            phoneNumber: string;
            mawkibCity: import("@prisma/client").$Enums.MawkibCity | null;
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        } | null;
        submittedBy: {
            id: number;
            mobileNumber: string;
            fullName: string;
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
        firstName: string;
        lastName: string;
        mawkibId: number | null;
        status: import("@prisma/client").$Enums.HonoraryVolunteerApplicationStatus;
        trackingCode: string;
        applicantType: import("@prisma/client").$Enums.HonoraryVolunteerApplicantType;
        serviceTypes: import("@prisma/client").$Enums.HonoraryVolunteerServiceType[];
        serviceDescription: string | null;
        availabilityStartDate: Date;
        availabilityEndDate: Date;
        availabilityDescription: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        submittedByUserId: number | null;
        reviewedByUserId: number | null;
    }>;
}
