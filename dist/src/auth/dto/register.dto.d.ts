import { UserGender } from '@prisma/client';
export declare class RegisterDto {
    fullName: string;
    mobileNumber: string;
    gender?: UserGender;
    password: string;
    province?: string;
    city?: string;
}
