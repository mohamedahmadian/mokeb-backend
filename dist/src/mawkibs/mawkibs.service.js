"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MawkibsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let MawkibsService = class MawkibsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(search) {
        const mawkibs = await this.prisma.mawkib.findMany({
            where: {
                status: client_1.MawkibStatus.Approved,
                ...(search?.name && {
                    name: { contains: search.name, mode: 'insensitive' },
                }),
            },
            include: {
                owner: {
                    select: { id: true, fullName: true, province: true, city: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!search?.reservationDate && !search?.hasAvailability && !search?.minAvailableCapacity) {
            return mawkibs;
        }
        const enriched = await Promise.all(mawkibs.map(async (mawkib) => {
            const availableCapacity = await this.getAvailableCapacity(mawkib.id, search?.reservationDate);
            return { ...mawkib, availableCapacity };
        }));
        return enriched.filter((m) => {
            if (search?.province && m.owner.province !== search.province)
                return false;
            if (search?.city && m.owner.city !== search.city)
                return false;
            if (search?.minAvailableCapacity && m.availableCapacity < search.minAvailableCapacity) {
                return false;
            }
            if (search?.hasAvailability && m.availableCapacity <= 0)
                return false;
            return true;
        });
    }
    async findAllAdmin() {
        return this.prisma.mawkib.findMany({
            include: {
                owner: { select: { id: true, fullName: true, mobileNumber: true } },
                _count: { select: { reservations: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByOwner(ownerUserId) {
        const mawkibs = await this.prisma.mawkib.findMany({
            where: { ownerUserId },
            include: {
                _count: { select: { reservations: true } },
            },
        });
        return Promise.all(mawkibs.map(async (mawkib) => ({
            ...mawkib,
            availableCapacity: await this.getAvailableCapacity(mawkib.id),
        })));
    }
    async findOne(id) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, fullName: true, mobileNumber: true } },
            },
        });
        if (!mawkib) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        const availableCapacity = await this.getAvailableCapacity(mawkib.id);
        return { ...mawkib, availableCapacity };
    }
    create(dto) {
        return this.prisma.mawkib.create({
            data: {
                ...dto,
                status: client_1.MawkibStatus.Approved,
            },
            include: {
                owner: { select: { id: true, fullName: true } },
            },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.mawkib.update({
            where: { id },
            data: dto,
        });
    }
    async updateStatus(id, status) {
        await this.findOne(id);
        return this.prisma.mawkib.update({
            where: { id },
            data: { status },
        });
    }
    async getAvailableCapacity(mawkibId, reservationDate) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: mawkibId },
        });
        if (!mawkib) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        const where = {
            mawkibId,
            status: { in: [client_1.ReservationStatus.Pending, client_1.ReservationStatus.Confirmed] },
            ...(reservationDate && { reservationDate }),
        };
        const result = await this.prisma.reservation.aggregate({
            where,
            _sum: { guestCount: true },
        });
        const totalReserved = result._sum.guestCount ?? 0;
        return mawkib.capacity - totalReserved;
    }
    async assertOwnerAccess(mawkibId, userId) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: mawkibId },
        });
        if (!mawkib) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        if (mawkib.ownerUserId !== userId) {
            throw new common_1.ForbiddenException('شما مالک این موکب نیستید');
        }
        return mawkib;
    }
    async assertCapacity(mawkibId, guestCount, reservationDate) {
        const available = await this.getAvailableCapacity(mawkibId, reservationDate);
        if (guestCount > available) {
            throw new common_1.BadRequestException(`ظرفیت کافی نیست. ظرفیت باقی‌مانده: ${available} نفر`);
        }
    }
};
exports.MawkibsService = MawkibsService;
exports.MawkibsService = MawkibsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MawkibsService);
//# sourceMappingURL=mawkibs.service.js.map