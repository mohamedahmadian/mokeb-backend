import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto): Promise<{
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
    private buildAuthResponse;
}
