import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationRequestDto } from './dto/registration-request.dto';
import { AuthUser } from '../common/decorators/current-user.decorator';
export declare class RegistrationRequestsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findByOwner(ownerUserId: number): import("@prisma/client").Prisma.PrismaPromise<{
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
    create(dto: CreateRegistrationRequestDto, currentUser: AuthUser): Promise<{
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
    review(id: number, status: 'Approved' | 'Rejected'): Promise<{
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
            defaultCheckInTime: string;
            defaultCheckOutTime: string;
            onlineReservationEnabled: boolean;
            ownerUserId: number;
            status: import("@prisma/client").$Enums.MawkibStatus;
        };
    }>;
}
