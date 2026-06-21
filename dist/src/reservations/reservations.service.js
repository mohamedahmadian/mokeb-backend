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
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const mawkibs_service_1 = require("../mawkibs/mawkibs.service");
let ReservationsService = class ReservationsService {
    prisma;
    mawkibsService;
    constructor(prisma, mawkibsService) {
        this.prisma = prisma;
        this.mawkibsService = mawkibsService;
    }
    async findAllAdmin() {
        return this.prisma.reservation.findMany({
            include: {
                mawkib: { select: { id: true, name: true } },
                pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
                reservedBy: { select: { id: true, fullName: true, mobileNumber: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByPilgrim(pilgrimUserId) {
        return this.prisma.reservation.findMany({
            where: { pilgrimUserId },
            include: {
                mawkib: { select: { id: true, name: true, address: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByMawkibOwner(ownerUserId) {
        const mawkibs = await this.prisma.mawkib.findMany({
            where: { ownerUserId },
            select: { id: true },
        });
        const mawkibIds = mawkibs.map((m) => m.id);
        return this.prisma.reservation.findMany({
            where: { mawkibId: { in: mawkibIds } },
            include: {
                mawkib: { select: { id: true, name: true } },
                pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
                reservedBy: { select: { id: true, fullName: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id },
            include: {
                mawkib: true,
                pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
                reservedBy: { select: { id: true, fullName: true, mobileNumber: true } },
            },
        });
        if (!reservation) {
            throw new common_1.NotFoundException('رزرو یافت نشد');
        }
        return reservation;
    }
    async create(dto, currentUser) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: dto.mawkibId },
        });
        if (!mawkib || mawkib.status !== client_1.MawkibStatus.Approved) {
            throw new common_1.BadRequestException('موکب یافت نشد یا تایید نشده است');
        }
        const reservationDate = new Date(dto.reservationDate);
        await this.mawkibsService.assertCapacity(dto.mawkibId, dto.guestCount, reservationDate);
        const isAdmin = currentUser.roles.includes(client_1.RoleName.Admin);
        const pilgrimUserId = isAdmin && dto.pilgrimUserId
            ? dto.pilgrimUserId
            : currentUser.id;
        if (isAdmin && dto.pilgrimUserId) {
            const pilgrim = await this.prisma.user.findUnique({
                where: { id: dto.pilgrimUserId },
            });
            if (!pilgrim) {
                throw new common_1.NotFoundException('زائر یافت نشد');
            }
        }
        return this.prisma.reservation.create({
            data: {
                mawkibId: dto.mawkibId,
                pilgrimUserId,
                reservedByUserId: currentUser.id,
                reservationDate,
                guestCount: dto.guestCount,
                pilgrimMobile: dto.pilgrimMobile,
                description: dto.description,
                status: isAdmin ? client_1.ReservationStatus.Confirmed : client_1.ReservationStatus.Pending,
            },
            include: {
                mawkib: { select: { id: true, name: true } },
                pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
            },
        });
    }
    async updateStatus(id, dto, currentUser) {
        const reservation = await this.findOne(id);
        const isAdmin = currentUser.roles.includes(client_1.RoleName.Admin);
        const isOwner = currentUser.roles.includes(client_1.RoleName.MawkibOwner);
        if (!isAdmin && !isOwner) {
            throw new common_1.ForbiddenException('شما مجوز تغییر وضعیت رزرو را ندارید');
        }
        if (isOwner && !isAdmin) {
            await this.mawkibsService.assertOwnerAccess(reservation.mawkibId, currentUser.id);
        }
        if (dto.status === client_1.ReservationStatus.Confirmed &&
            reservation.status !== client_1.ReservationStatus.Pending) {
            throw new common_1.BadRequestException('فقط رزروهای در انتظار قابل تایید هستند');
        }
        if (dto.status === client_1.ReservationStatus.Confirmed) {
            await this.mawkibsService.assertCapacity(reservation.mawkibId, reservation.guestCount, reservation.reservationDate);
        }
        return this.prisma.reservation.update({
            where: { id },
            data: { status: dto.status },
            include: {
                mawkib: { select: { id: true, name: true } },
                pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
            },
        });
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mawkibs_service_1.MawkibsService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map