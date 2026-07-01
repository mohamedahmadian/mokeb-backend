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
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const user_dto_1 = require("./dto/user.dto");
const MIN_PILGRIM_SEARCH_LENGTH = 2;
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
    async findAll(filters = {}) {
        const where = {};
        if (filters.role) {
            where.roles = { some: { role: { name: filters.role } } };
        }
        if (filters.search?.trim()) {
            const term = filters.search.trim();
            where.OR = [
                { fullName: { contains: term, mode: 'insensitive' } },
                { mobileNumber: { contains: term, mode: 'insensitive' } },
            ];
        }
        else {
            if (filters.fullName?.trim()) {
                where.fullName = { contains: filters.fullName.trim(), mode: 'insensitive' };
            }
            if (filters.mobileNumber?.trim()) {
                where.mobileNumber = { contains: filters.mobileNumber.trim(), mode: 'insensitive' };
            }
        }
        if (filters.nationalId?.trim()) {
            where.nationalId = { contains: filters.nationalId.trim(), mode: 'insensitive' };
        }
        if (filters.province?.trim()) {
            where.province = { contains: filters.province.trim(), mode: 'insensitive' };
        }
        if (filters.city?.trim()) {
            where.city = { contains: filters.city.trim(), mode: 'insensitive' };
        }
        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        const include = filters.role === client_1.RoleName.MawkibOwner
            ? {
                ...userInclude,
                ownedMawkibs: {
                    select: { id: true, name: true, status: true },
                    orderBy: { name: 'asc' },
                },
            }
            : userInclude;
        const users = await this.prisma.user.findMany({
            where,
            include,
            orderBy: filters.search?.trim() ? { fullName: 'asc' } : { createdAt: 'desc' },
            ...(filters.search?.trim() ? { take: 50 } : {}),
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
                nationalId: dto.nationalId?.trim() || null,
                nationalIdCardImageUrl: dto.nationalIdCardImageUrl?.trim() || null,
                gender: dto.gender ?? undefined,
                passwordHash,
                province: dto.province,
                city: dto.city,
                description: dto.description,
                whatsapp: dto.whatsapp,
                telegram: dto.telegram,
                bale: dto.bale,
                eitaa: dto.eitaa,
                email: dto.email,
                roles: {
                    create: roles.map((role) => ({ roleId: role.id })),
                },
            },
            include: userInclude,
        });
        return this.sanitize(user);
    }
    async isPilgrimLinkedToOwner(pilgrimUserId, ownerUserId) {
        const count = await this.prisma.user.count({
            where: {
                id: pilgrimUserId,
                isActive: true,
                roles: { some: { role: { name: client_1.RoleName.Pilgrim } } },
                pilgrimReservations: { some: { mawkib: { ownerUserId } } },
            },
        });
        return count > 0;
    }
    stripProfileImageUnlessSelf(dto, actorUserId, targetUserId) {
        if (actorUserId === targetUserId || dto.imageUrl === undefined) {
            return dto;
        }
        const { imageUrl: _, ...rest } = dto;
        return rest;
    }
    async findOneForUser(id, user) {
        const isAdmin = user.roles.includes(client_1.RoleName.Admin);
        if (isAdmin || user.id === id) {
            return this.findOne(id);
        }
        const isMawkibOwner = user.roles.includes(client_1.RoleName.MawkibOwner);
        if (isMawkibOwner && (await this.isPilgrimLinkedToOwner(id, user.id))) {
            return this.findOne(id);
        }
        throw new common_1.ForbiddenException('شما مجوز مشاهده این کاربر را ندارید');
    }
    async updateForUser(id, dto, user) {
        const isAdmin = user.roles.includes(client_1.RoleName.Admin);
        if (isAdmin) {
            return this.update(id, this.stripProfileImageUnlessSelf(dto, user.id, id));
        }
        if (user.id === id) {
            const { roles, isActive, ...selfFields } = dto;
            if (roles !== undefined || isActive !== undefined) {
                throw new common_1.ForbiddenException('شما مجوز تغییر نقش یا وضعیت را ندارید');
            }
            return this.update(id, selfFields);
        }
        const isMawkibOwner = user.roles.includes(client_1.RoleName.MawkibOwner);
        if (isMawkibOwner) {
            if (!(await this.isPilgrimLinkedToOwner(id, user.id))) {
                throw new common_1.ForbiddenException('شما مجوز ویرایش این زائر را ندارید');
            }
            const { roles, imageUrl, ...pilgrimFields } = dto;
            if (roles !== undefined &&
                !(roles.length === 1 && roles[0] === client_1.RoleName.Pilgrim)) {
                throw new common_1.ForbiddenException('شما مجوز تغییر نقش را ندارید');
            }
            if (imageUrl !== undefined) {
                throw new common_1.ForbiddenException('شما مجوز تغییر عکس پروفایل زائر را ندارید');
            }
            return this.update(id, pilgrimFields);
        }
        throw new common_1.ForbiddenException('شما مجوز ویرایش این کاربر را ندارید');
    }
    buildPilgrimWhere(query, ownerUserId) {
        const term = query.search?.trim();
        return {
            roles: { some: { role: { name: client_1.RoleName.Pilgrim } } },
            ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
            ...(query.fullName?.trim() && {
                fullName: { contains: query.fullName.trim(), mode: 'insensitive' },
            }),
            ...(query.mobileNumber?.trim() && {
                mobileNumber: { contains: query.mobileNumber.trim(), mode: 'insensitive' },
            }),
            ...(query.nationalId?.trim() && {
                nationalId: { contains: query.nationalId.trim(), mode: 'insensitive' },
            }),
            ...(query.province?.trim() && {
                province: { contains: query.province.trim(), mode: 'insensitive' },
            }),
            ...(query.city?.trim() && {
                city: { contains: query.city.trim(), mode: 'insensitive' },
            }),
            ...(term && {
                OR: [
                    { fullName: { contains: term, mode: 'insensitive' } },
                    { mobileNumber: { contains: term, mode: 'insensitive' } },
                ],
            }),
            ...(query.mawkibId
                ? {
                    pilgrimReservations: {
                        some: {
                            mawkibId: query.mawkibId,
                            ...(ownerUserId ? { mawkib: { ownerUserId } } : {}),
                        },
                    },
                }
                : ownerUserId
                    ? {
                        pilgrimReservations: {
                            some: { mawkib: { ownerUserId } },
                        },
                    }
                    : {}),
        };
    }
    async findPilgrims(query = {}, ownerUserId) {
        const scope = query.scope ?? user_dto_1.PilgrimListScope.Mine;
        if (scope === user_dto_1.PilgrimListScope.All) {
            const term = query.search?.trim() ?? '';
            if (term.length < MIN_PILGRIM_SEARCH_LENGTH) {
                return [];
            }
        }
        const isQuickSearch = !!query.search?.trim() &&
            !query.fullName?.trim() &&
            !query.mobileNumber?.trim() &&
            !query.nationalId?.trim() &&
            !query.province?.trim() &&
            !query.city?.trim() &&
            query.isActive === undefined &&
            !query.mawkibId;
        const effectiveOwnerId = scope === user_dto_1.PilgrimListScope.Mine ? ownerUserId : undefined;
        if (query.mawkibId && effectiveOwnerId) {
            const ownedMawkib = await this.prisma.mawkib.findFirst({
                where: { id: query.mawkibId, ownerUserId: effectiveOwnerId },
                select: { id: true },
            });
            if (!ownedMawkib) {
                throw new common_1.ForbiddenException('شما مجوز فیلتر با این موکب را ندارید');
            }
        }
        const where = this.buildPilgrimWhere(query, effectiveOwnerId);
        if (isQuickSearch) {
            return this.prisma.user.findMany({
                where: { ...where, isActive: true },
                select: {
                    id: true,
                    fullName: true,
                    mobileNumber: true,
                    city: true,
                },
                orderBy: { fullName: 'asc' },
                take: 50,
            });
        }
        const orderBy = { fullName: 'asc' };
        if (query.all) {
            const users = await this.prisma.user.findMany({
                where,
                include: userInclude,
                orderBy,
            });
            return users.map((user) => this.sanitize(user));
        }
        if (query.page !== undefined) {
            const pageSize = query.pageSize ?? 10;
            const page = query.page;
            const skip = (page - 1) * pageSize;
            const [users, total] = await Promise.all([
                this.prisma.user.findMany({
                    where,
                    include: userInclude,
                    orderBy,
                    skip,
                    take: pageSize,
                }),
                this.prisma.user.count({ where }),
            ]);
            const totalPages = Math.max(1, Math.ceil(total / pageSize));
            return {
                items: users.map((user) => this.sanitize(user)),
                total,
                page,
                pageSize,
                totalPages,
            };
        }
        const users = await this.prisma.user.findMany({
            where,
            include: userInclude,
            orderBy,
        });
        return users.map((user) => this.sanitize(user));
    }
    async createQuickPilgrim(dto) {
        const mobileNumber = dto.mobileNumber.trim();
        const existing = await this.prisma.user.findUnique({
            where: { mobileNumber },
            include: userInclude,
        });
        if (existing) {
            const imageUrl = dto.nationalIdCardImageUrl?.trim();
            if (imageUrl) {
                const updated = await this.prisma.user.update({
                    where: { id: existing.id },
                    data: { nationalIdCardImageUrl: imageUrl },
                    include: userInclude,
                });
                return this.sanitize(updated);
            }
            return this.sanitize(existing);
        }
        const digits = mobileNumber.replace(/\D/g, '');
        const password = dto.password?.trim() || digits.slice(-4);
        if (password.length < 4) {
            throw new common_1.BadRequestException('رمز عبور باید حداقل ۴ کاراکتر باشد یا شماره موبایل معتبر وارد کنید');
        }
        const fullName = `${dto.firstName.trim()} ${dto.lastName.trim()}`;
        return this.create({
            fullName,
            mobileNumber,
            nationalId: dto.nationalId?.trim() || undefined,
            nationalIdCardImageUrl: dto.nationalIdCardImageUrl?.trim() || undefined,
            gender: dto.gender,
            password,
            province: dto.province?.trim() || undefined,
            city: dto.city?.trim() || undefined,
            description: dto.description?.trim() || undefined,
            whatsapp: dto.whatsapp?.trim() || undefined,
            telegram: dto.telegram?.trim() || undefined,
            bale: dto.bale?.trim() || undefined,
            eitaa: dto.eitaa?.trim() || undefined,
            email: dto.email?.trim() || undefined,
            roles: ['Pilgrim'],
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        const { password, roles, ...fields } = dto;
        const data = { ...fields };
        if (fields.nationalId !== undefined) {
            data.nationalId = fields.nationalId.trim() || null;
        }
        if (fields.nationalIdCardImageUrl !== undefined) {
            data.nationalIdCardImageUrl = fields.nationalIdCardImageUrl?.trim() || null;
        }
        if (fields.imageUrl !== undefined) {
            data.imageUrl = fields.imageUrl?.trim() || null;
        }
        if (fields.gender !== undefined) {
            data.gender = fields.gender;
        }
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