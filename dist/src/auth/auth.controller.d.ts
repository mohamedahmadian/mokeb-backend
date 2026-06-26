import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterMawkibOwnerDto, RegisterPilgrimDto } from './dto/public-register.dto';
import type { AuthUser } from '../common/decorators/current-user.decorator';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    me(user: AuthUser): AuthUser;
    changePassword(user: AuthUser, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
