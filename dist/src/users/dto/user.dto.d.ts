import { RoleName } from '@prisma/client';
export declare class CreateUserDto {
    fullName: string;
    mobileNumber: string;
    password: string;
    province?: string;
    city?: string;
    description?: string;
    roles: RoleName[];
}
export declare class UpdateUserDto {
    fullName?: string;
    province?: string;
    city?: string;
    description?: string;
    isActive?: boolean;
    password?: string;
    roles?: RoleName[];
}
export declare class AssignRoleDto {
    role: RoleName;
}
