import { UserGender } from '@prisma/client';
export declare class RegisterPilgrimDto {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    nationalId?: string;
    nationalIdCardImageUrl?: string;
    gender?: UserGender;
    birthDate?: string;
    country?: string;
    passportNumber?: string;
    password: string;
    province?: string;
    city?: string;
    description?: string;
    whatsapp?: string;
    telegram?: string;
    bale?: string;
    eitaa?: string;
    email?: string;
}
export declare class RegisterMawkibOwnerDto {
    fullName: string;
    mobileNumber: string;
    nationalId?: string;
    gender?: UserGender;
    password: string;
    province?: string;
    city?: string;
    description?: string;
    whatsapp?: string;
    telegram?: string;
    bale?: string;
    eitaa?: string;
    email?: string;
}
