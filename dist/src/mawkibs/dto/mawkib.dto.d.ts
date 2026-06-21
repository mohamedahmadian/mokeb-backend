import { MawkibStatus } from '@prisma/client';
export declare class CreateMawkibDto {
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
    phoneNumber: string;
    description?: string;
    capacity: number;
    imageUrl?: string;
    ownerUserId: number;
}
export declare class UpdateMawkibDto {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    phoneNumber?: string;
    description?: string;
    capacity?: number;
    imageUrl?: string;
    status?: MawkibStatus;
}
export declare class SearchMawkibDto {
    name?: string;
    province?: string;
    city?: string;
    reservationDate?: Date;
    minAvailableCapacity?: number;
    hasAvailability?: boolean;
}
