import { RegistrationRequestsService } from './registration-requests.service';
import { CreateRegistrationRequestDto, ReviewRegistrationRequestDto } from './dto/registration-request.dto';
import type { AuthUser } from '../common/decorators/current-user.decorator';
export declare class RegistrationRequestsController {
    private service;
    constructor(service: RegistrationRequestsService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        owner: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        address: string;
        latitude: number | null;
        longitude: number | null;
        phoneNumber: string;
        ownerUserId: number;
        status: import("@prisma/client").$Enums.RegistrationRequestStatus;
        ownerName: string;
        mawkibName: string;
        capacity: number;
    })[]>;
    findMy(user: AuthUser): import("@prisma/client").Prisma.PrismaPromise<{
        id: number;
        description: string | null;
        createdAt: Date;
        address: string;
        latitude: number | null;
        longitude: number | null;
        phoneNumber: string;
        ownerUserId: number;
        status: import("@prisma/client").$Enums.RegistrationRequestStatus;
        ownerName: string;
        mawkibName: string;
        capacity: number;
    }[]>;
    findOne(id: number): Promise<{
        owner: {
            id: number;
            mobileNumber: string;
            fullName: string;
        };
    } & {
        id: number;
        description: string | null;
        createdAt: Date;
        address: string;
        latitude: number | null;
        longitude: number | null;
        phoneNumber: string;
        ownerUserId: number;
        status: import("@prisma/client").$Enums.RegistrationRequestStatus;
        ownerName: string;
        mawkibName: string;
        capacity: number;
    }>;
    create(dto: CreateRegistrationRequestDto, user: AuthUser): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        address: string;
        latitude: number | null;
        longitude: number | null;
        phoneNumber: string;
        ownerUserId: number;
        status: import("@prisma/client").$Enums.RegistrationRequestStatus;
        ownerName: string;
        mawkibName: string;
        capacity: number;
    }>;
    review(id: number, dto: ReviewRegistrationRequestDto): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        address: string;
        latitude: number | null;
        longitude: number | null;
        phoneNumber: string;
        ownerUserId: number;
        status: import("@prisma/client").$Enums.RegistrationRequestStatus;
        ownerName: string;
        mawkibName: string;
        capacity: number;
    } | {
        request: {
            owner: {
                id: number;
                mobileNumber: string;
                fullName: string;
            };
        } & {
            id: number;
            description: string | null;
            createdAt: Date;
            address: string;
            latitude: number | null;
            longitude: number | null;
            phoneNumber: string;
            ownerUserId: number;
            status: import("@prisma/client").$Enums.RegistrationRequestStatus;
            ownerName: string;
            mawkibName: string;
            capacity: number;
        };
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
            ownerUserId: number;
            status: import("@prisma/client").$Enums.MawkibStatus;
        };
    }>;
}
