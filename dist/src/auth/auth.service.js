"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const users_service_1 = require("../users/users.service");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    usersService;
    constructor(prisma, jwtService, usersService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.usersService = usersService;
    }
    async register(dto) {
        const parts = dto.fullName.trim().split(/\s+/);
        const firstName = parts[0] ?? '';
        const lastName = parts.slice(1).join(' ') || firstName;
        return this.registerPilgrim({
            firstName,
            lastName,
            mobileNumber: dto.mobileNumber,
            password: dto.password,
            province: dto.province,
            city: dto.city,
        });
    }
    async registerPilgrim(dto) {
        const user = await this.usersService.create({
            fullName: `${dto.firstName.trim()} ${dto.lastName.trim()}`,
            mobileNumber: dto.mobileNumber.trim(),
            nationalId: dto.nationalId?.trim() || undefined,
            nationalIdCardImageUrl: dto.nationalIdCardImageUrl?.trim() || undefined,
            password: dto.password,
            province: dto.province?.trim() || undefined,
            city: dto.city?.trim() || undefined,
            description: dto.description?.trim() || undefined,
            whatsapp: dto.whatsapp?.trim() || undefined,
            telegram: dto.telegram?.trim() || undefined,
            bale: dto.bale?.trim() || undefined,
            eitaa: dto.eitaa?.trim() || undefined,
            email: dto.email?.trim() || undefined,
            roles: [client_1.RoleName.Pilgrim],
        });
        return this.buildAuthResponseFromCreated(user);
    }
    async registerMawkibOwner(dto) {
        const user = await this.usersService.create({
            fullName: dto.fullName.trim(),
            mobileNumber: dto.mobileNumber.trim(),
            nationalId: dto.nationalId?.trim() || undefined,
            password: dto.password,
            province: dto.province?.trim() || undefined,
            city: dto.city?.trim() || undefined,
            description: dto.description?.trim() || undefined,
            whatsapp: dto.whatsapp?.trim() || undefined,
            telegram: dto.telegram?.trim() || undefined,
            bale: dto.bale?.trim() || undefined,
            eitaa: dto.eitaa?.trim() || undefined,
            email: dto.email?.trim() || undefined,
            roles: [client_1.RoleName.MawkibOwner],
        });
        return this.buildAuthResponseFromCreated(user);
    }
    async registerHonoraryServant(dto) {
        const fullName = `${dto.firstName.trim()} ${dto.lastName.trim()}`;
        const mobileNumber = dto.mobileNumber.trim();
        const existing = await this.prisma.user.findUnique({
            where: { mobileNumber },
            include: { roles: { include: { role: true } } },
        });
        if (existing) {
            const isValid = await bcrypt.compare(dto.password, existing.passwordHash);
            if (!isValid) {
                throw new common_1.UnauthorizedException('این شماره موبایل قبلاً ثبت شده است. لطفاً با رمز عبور صحیح وارد شوید.');
            }
            await this.ensureHonoraryServantRole(existing.id);
            const user = await this.prisma.user.findUnique({
                where: { id: existing.id },
                include: { roles: { include: { role: true } } },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('کاربر یافت نشد');
            }
            return this.buildAuthResponse(user);
        }
        const user = await this.usersService.create({
            fullName,
            mobileNumber,
            password: dto.password,
            province: dto.province?.trim() || undefined,
            city: dto.city?.trim() || undefined,
            roles: [client_1.RoleName.HonoraryServant],
        });
        const userWithRoles = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { roles: { include: { role: true } } },
        });
        if (!userWithRoles) {
            throw new common_1.UnauthorizedException('کاربر یافت نشد');
        }
        return this.buildAuthResponseFromCreated(userWithRoles);
    }
    async ensureHonoraryServantRole(userId) {
        const role = await this.prisma.role.findUnique({
            where: { name: client_1.RoleName.HonoraryServant },
        });
        if (!role) {
            throw new common_1.UnauthorizedException('نقش خادم‌یار یافت نشد');
        }
        await this.prisma.userRole.upsert({
            where: {
                userId_roleId: { userId, roleId: role.id },
            },
            create: { userId, roleId: role.id },
            update: {},
        });
    }
    async assignHonoraryServantRole(userId) {
        await this.ensureHonoraryServantRole(userId);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { mobileNumber: dto.mobileNumber },
            include: {
                roles: { include: { role: true } },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('کاربر مورد نظر توسط مدیریت غیرفعال شده است');
        }
        const isValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است');
        }
        return this.buildAuthResponse(user);
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('کاربر یافت نشد');
        }
        const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException('رمز عبور فعلی اشتباه است');
        }
        if (dto.currentPassword === dto.newPassword) {
            throw new common_1.BadRequestException('رمز عبور جدید باید با رمز فعلی متفاوت باشد');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash: await bcrypt.hash(dto.newPassword, 10),
            },
        });
        return { message: 'رمز عبور با موفقیت تغییر کرد' };
    }
    async validateUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                roles: { include: { role: true } },
            },
        });
        if (!user || !user.isActive) {
            return null;
        }
        return {
            id: user.id,
            mobileNumber: user.mobileNumber,
            roles: user.roles.map((ur) => ur.role.name),
        };
    }
    async isMobileRegistered(mobileNumber) {
        const trimmed = mobileNumber.trim();
        if (!trimmed) {
            return { registered: false };
        }
        const user = await this.prisma.user.findUnique({
            where: { mobileNumber: trimmed },
            select: { id: true },
        });
        return { registered: Boolean(user) };
    }
    buildAuthResponseFromCreated(user) {
        return this.buildAuthResponse({
            id: user.id,
            fullName: user.fullName,
            mobileNumber: user.mobileNumber,
            isActive: true,
            roles: user.roles,
        });
    }
    buildAuthResponse(user) {
        const roles = user.roles.map((ur) => ur.role.name);
        const payload = { sub: user.id, mobileNumber: user.mobileNumber, roles };
        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                fullName: user.fullName,
                mobileNumber: user.mobileNumber,
                roles,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map