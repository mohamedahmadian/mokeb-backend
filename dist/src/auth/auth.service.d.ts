import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterMawkibOwnerDto, RegisterPilgrimDto } from './dto/public-register.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private usersService;
    constructor(prisma: PrismaService, jwtService: JwtService, usersService: UsersService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            fullName: string;
            mobileNumber: string;
            roles: string[];
        };
    }>;
    registerPilgrim(dto: RegisterPilgrimDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            fullName: string;
            mobileNumber: string;
            roles: string[];
        };
    }>;
    registerMawkibOwner(dto: RegisterMawkibOwnerDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            fullName: string;
            mobileNumber: string;
            roles: string[];
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            fullName: string;
            mobileNumber: string;
            roles: string[];
        };
    }>;
    validateUser(userId: number): Promise<{
        id: number;
        mobileNumber: string;
        roles: import("@prisma/client").$Enums.RoleName[];
    } | null>;
    private buildAuthResponseFromCreated;
    private buildAuthResponse;
}
