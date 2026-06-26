import { MawkibCity, MawkibCountry, MawkibStatus } from '@prisma/client';
export declare enum MawkibCapacityFilter {
    All = "all",
    Available = "available",
    Full = "full"
}
export declare class CreateMawkibDto {
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
    phoneNumber: string;
    description?: string;
    facilities?: string;
    services?: string;
    serviceStartDate?: string;
    serviceEndDate?: string;
    maleCapacity: number;
    femaleCapacity: number;
    imageUrl?: string;
    distanceToShrine?: string;
    lunchReception?: boolean;
    breakfastReception?: boolean;
    dinnerReception?: boolean;
    bathroom?: boolean;
    laundry?: boolean;
    parking?: boolean;
    internet?: boolean;
    familyFriendly?: boolean;
    maxReservationDays?: number;
    country?: MawkibCountry;
    mawkibCity?: MawkibCity;
    rules?: string;
    telegramChannel?: string;
    whatsapp?: string;
    bale?: string;
    eitaa?: string;
    websiteUrl?: string;
    defaultCheckInTime?: string;
    defaultCheckOutTime?: string;
    ownerUserId: number;
    status?: MawkibStatus;
}
export declare class UpdateMawkibDto {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    phoneNumber?: string;
    description?: string;
    facilities?: string;
    services?: string;
    serviceStartDate?: string;
    serviceEndDate?: string;
    maleCapacity?: number;
    femaleCapacity?: number;
    imageUrl?: string;
    distanceToShrine?: string;
    lunchReception?: boolean;
    breakfastReception?: boolean;
    dinnerReception?: boolean;
    bathroom?: boolean;
    laundry?: boolean;
    parking?: boolean;
    internet?: boolean;
    familyFriendly?: boolean;
    maxReservationDays?: number;
    country?: MawkibCountry;
    mawkibCity?: MawkibCity;
    rules?: string;
    telegramChannel?: string;
    whatsapp?: string;
    bale?: string;
    eitaa?: string;
    websiteUrl?: string;
    defaultCheckInTime?: string;
    defaultCheckOutTime?: string;
    ownerUserId?: number;
    status?: MawkibStatus;
}
export declare class SearchMawkibDto {
    q?: string;
    name?: string;
    province?: string;
    city?: string;
    mawkibCity?: MawkibCity;
    reservationDate?: string;
    reservationDateFrom?: string;
    reservationDateTo?: string;
    minAvailableMaleCapacity?: number;
    minAvailableFemaleCapacity?: number;
    hasAvailability?: boolean;
    capacityFilter?: MawkibCapacityFilter;
    serviceStartFrom?: string;
    serviceStartTo?: string;
    serviceEndFrom?: string;
    serviceEndTo?: string;
}
export declare class AdminSearchMawkibDto {
    name?: string;
    phoneNumber?: string;
    ownerName?: string;
    ownerUserId?: number;
    status?: MawkibStatus;
    province?: string;
    city?: string;
    serviceStartFrom?: string;
    serviceStartTo?: string;
    serviceEndFrom?: string;
    serviceEndTo?: string;
    capacityFilter?: MawkibCapacityFilter;
    reservationDate?: string;
    reservationDateFrom?: string;
    reservationDateTo?: string;
    minAvailableMaleCapacity?: number;
    minAvailableFemaleCapacity?: number;
    hasAvailability?: boolean;
}
