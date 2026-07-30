import { UserGender } from '@prisma/client';
export declare class CreateServantDto {
    fullName: string;
    mobileNumber: string;
    password: string;
    nationalId?: string;
    nationalIdCardImageUrl?: string;
    gender?: UserGender;
    province?: string;
    city?: string;
    address?: string;
    description?: string;
    whatsapp?: string;
    telegram?: string;
    bale?: string;
    eitaa?: string;
    email?: string;
}
export declare class UpdateServantDto {
    fullName?: string;
    nationalId?: string;
    nationalIdCardImageUrl?: string | null;
    gender?: UserGender | null;
    province?: string;
    city?: string;
    address?: string;
    description?: string;
    whatsapp?: string;
    telegram?: string;
    bale?: string;
    eitaa?: string;
    email?: string;
    isActive?: boolean;
    password?: string;
}
export declare class UpdateServantMawkibAccessDto {
    allMawkibs: boolean;
    mawkibIds?: number[];
}
export declare class ListServantsDto {
    mawkibId?: number;
    search?: string;
    isActive?: boolean;
}
