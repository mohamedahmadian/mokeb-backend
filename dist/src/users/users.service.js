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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const userInclude = {
    roles: { include: { role: true } },
};
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    sanitize(user) {
        const { passwordHash: _, ...rest } = user;
        return rest;
    }
    async findAll() {
        const users = await this.prisma.user.findMany({
            include: userInclude,
            orderBy: { createdAt: 'desc' },
        });
        return users.map((user) => this.sanitize(user));
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                ...userInclude,
                ownedMawkibs: { select: { id: true, name: true } },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('کاربر یافت نشد');
        }
        return this.sanitize(user);
    }
    async create(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { mobileNumber: dto.mobileNumber },
        });
        if (existing) {
            throw new common_1.ConflictException('این شماره موبایل قبلاً ثبت شده است');
        }
        const roles = await this.prisma.role.findMany({
            where: { name: { in: dto.roles } },
        });
        if (roles.length !== dto.roles.length) {
            throw new common_1.BadRequestException('یک یا چند نقش نامعتبر است');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                fullName: dto.fullName,
                mobileNumber: dto.mobileNumber,
                passwordHash,
                province: dto.province,
                city: dto.city,
                description: dto.description,
                roles: {
                    create: roles.map((role) => ({ roleId: role.id })),
                },
            },
            include: userInclude,
        });
        return this.sanitize(user);
    }
    async update(id, dto) {
        await this.findOne(id);
        const { password, roles, ...fields } = dto;
        const data = { ...fields };
        if (password) {
            data.passwordHash = await bcrypt.hash(password, 10);
        }
        if (roles) {
            const roleRecords = await this.prisma.role.findMany({
                where: { name: { in: roles } },
            });
            if (roleRecords.length !== roles.length) {
                throw new common_1.BadRequestException('یک یا چند نقش نامعتبر است');
            }
            data.roles = {
                deleteMany: {},
                create: roleRecords.map((role) => ({ roleId: role.id })),
            };
        }
        const user = await this.prisma.user.update({
            where: { id },
            data,
            include: userInclude,
        });
        return this.sanitize(user);
    }
    async remove(id) {
        const user = await this.findOne(id);
        const [mawkibCount, reservationCount] = await Promise.all([
            this.prisma.mawkib.count({ where: { ownerUserId: id } }),
            this.prisma.reservation.count({
                where: {
                    OR: [{ pilgrimUserId: id }, { reservedByUserId: id }],
                },
            }),
        ]);
        if (mawkibCount > 0 || reservationCount > 0) {
            const updated = await this.prisma.user.update({
                where: { id },
                data: { isActive: false },
                include: userInclude,
            });
            return {
                ...this.sanitize(updated),
                message: 'کاربر به‌دلیل داشتن سوابق، غیرفعال شد',
                softDeleted: true,
            };
        }
        await this.prisma.user.delete({ where: { id } });
        return { id: user.id, message: 'کاربر حذف شد', softDeleted: false };
    }
    async assignRole(id, dto) {
        await this.findOne(id);
        const role = await this.prisma.role.findUnique({
            where: { name: dto.role },
        });
        if (!role) {
            throw new common_1.NotFoundException('نقش یافت نشد');
        }
        await this.prisma.userRole.upsert({
            where: {
                userId_roleId: { userId: id, roleId: role.id },
            },
            create: { userId: id, roleId: role.id },
            update: {},
        });
        return this.findOne(id);
    }
    async removeRole(id, roleName) {
        const role = await this.prisma.role.findUnique({
            where: { name: roleName },
        });
        if (!role) {
            throw new common_1.NotFoundException('نقش یافت نشد');
        }
        await this.prisma.userRole.deleteMany({
            where: { userId: id, roleId: role.id },
        });
        return this.findOne(id);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map