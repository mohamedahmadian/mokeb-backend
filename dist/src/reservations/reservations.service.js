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
const users_service_1 = require("../users/users.service");
const date_util_1 = require("../common/utils/date.util");
const reservation_code_util_1 = require("../common/utils/reservation-code.util");
const reservationInclude = {
    mawkib: { select: { id: true, name: true } },
    pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
    reservedBy: { select: { id: true, fullName: true, mobileNumber: true } },
};
let ReservationsService = class ReservationsService {
    prisma;
    mawkibsService;
    usersService;
    constructor(prisma, mawkibsService, usersService) {
        this.prisma = prisma;
        this.mawkibsService = mawkibsService;
        this.usersService = usersService;
    }
    buildSearchWhere(search) {
        if (!search)
            return {};
        const where = {};
        if (search.mawkibId) {
            where.mawkibId = search.mawkibId;
        }
        if (search.status) {
            where.status = search.status;
        }
        if (search.reservationDateFrom || search.reservationDateTo) {
            where.reservationDate = {
                ...(search.reservationDateFrom && {
                    gte: new Date(search.reservationDateFrom),
                }),
                ...(search.reservationDateTo && {
                    lte: new Date(search.reservationDateTo),
                }),
            };
        }
        if (search.pilgrimUserId) {
            where.pilgrimUserId = search.pilgrimUserId;
        }
        if (search.pilgrimName || search.pilgrimMobile) {
            where.pilgrim = {
                ...(search.pilgrimName && {
                    fullName: { contains: search.pilgrimName, mode: 'insensitive' },
                }),
                ...(search.pilgrimMobile && {
                    mobileNumber: { contains: search.pilgrimMobile, mode: 'insensitive' },
                }),
            };
        }
        if (search.guestCountMin || search.guestCountMax) {
        }
        return where;
    }
    filterByGuestCountTotal(items, search) {
        if (!search?.guestCountMin && !search?.guestCountMax)
            return items;
        return items.filter((item) => {
            const total = item.maleGuestCount + item.femaleGuestCount;
            if (search.guestCountMin && total < search.guestCountMin)
                return false;
            if (search.guestCountMax && total > search.guestCountMax)
                return false;
            return true;
        });
    }
    async findAllAdmin(search) {
        const items = await this.prisma.reservation.findMany({
            where: this.buildSearchWhere(search),
            include: reservationInclude,
            orderBy: { createdAt: 'desc' },
        });
        return this.filterByGuestCountTotal(items, search);
    }
    async findByPilgrim(pilgrimUserId, search) {
        const items = await this.prisma.reservation.findMany({
            where: {
                pilgrimUserId,
                ...this.buildSearchWhere(search),
            },
            include: {
                mawkib: { select: { id: true, name: true, address: true } },
                pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
                reservedBy: { select: { id: true, fullName: true, mobileNumber: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return this.filterByGuestCountTotal(items, search);
    }
    async findByMawkibOwner(ownerUserId, search) {
        const mawkibs = await this.prisma.mawkib.findMany({
            where: { ownerUserId },
            select: { id: true },
        });
        const mawkibIds = mawkibs.map((m) => m.id);
        if (search?.mawkibId && !mawkibIds.includes(search.mawkibId)) {
            return [];
        }
        const { mawkibId, ...rest } = search ?? {};
        const items = await this.prisma.reservation.findMany({
            where: {
                mawkibId: mawkibId ?? { in: mawkibIds },
                ...this.buildSearchWhere(rest),
            },
            include: reservationInclude,
            orderBy: { createdAt: 'desc' },
        });
        return this.filterByGuestCountTotal(items, search);
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
    async findByTrackingCode(trackingCode) {
        const code = trackingCode.trim();
        if (!code) {
            throw new common_1.BadRequestException('کد رزرو الزامی است');
        }
        const reservation = await this.prisma.reservation.findUnique({
            where: { trackingCode: code },
            include: {
                mawkib: { select: { id: true, name: true, address: true } },
                pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
                reservedBy: { select: { id: true, fullName: true, mobileNumber: true } },
            },
        });
        if (!reservation) {
            throw new common_1.NotFoundException('رزروی با این کد یافت نشد');
        }
        return reservation;
    }
    async findRecentByMobileForGuest(mobileNumber) {
        const mobile = mobileNumber.trim();
        if (!mobile) {
            throw new common_1.BadRequestException('شماره موبایل الزامی است');
        }
        const guestInclude = {
            mawkib: { select: { id: true, name: true, address: true } },
            pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
            reservedBy: { select: { id: true, fullName: true, mobileNumber: true } },
        };
        const reservations = await this.prisma.reservation.findMany({
            where: {
                OR: [{ pilgrimMobile: mobile }, { pilgrim: { mobileNumber: mobile } }],
            },
            include: guestInclude,
            orderBy: { createdAt: 'desc' },
            take: 2,
        });
        if (reservations.length === 0) {
            throw new common_1.NotFoundException('رزروی با این شماره موبایل یافت نشد');
        }
        return reservations;
    }
    async findOneForUser(id, currentUser) {
        const reservation = await this.findOne(id);
        const isAdmin = currentUser.roles.includes(client_1.RoleName.Admin);
        const isOwner = currentUser.roles.includes(client_1.RoleName.MawkibOwner);
        if (isAdmin) {
            return reservation;
        }
        if (isOwner) {
            await this.mawkibsService.assertOwnerAccess(reservation.mawkibId, currentUser.id);
            return reservation;
        }
        if (reservation.pilgrimUserId !== currentUser.id &&
            reservation.reservedByUserId !== currentUser.id) {
            throw new common_1.ForbiddenException('شما مجوز مشاهده این رزرو را ندارید');
        }
        return reservation;
    }
    async createWithTrackingCode(data, include = reservationInclude) {
        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                return await this.prisma.reservation.create({
                    data: {
                        ...data,
                        trackingCode: (0, reservation_code_util_1.generateReservationTrackingCode)(),
                    },
                    include,
                });
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                    error.code === 'P2002') {
                    continue;
                }
                throw error;
            }
        }
        throw new common_1.BadRequestException('خطا در تولید شناسه رزرو');
    }
    async create(dto, currentUser) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: dto.mawkibId },
        });
        if (!mawkib || mawkib.status !== client_1.MawkibStatus.Approved) {
            throw new common_1.BadRequestException('موکب یافت نشد یا تایید نشده است');
        }
        const isAdmin = currentUser.roles.includes(client_1.RoleName.Admin);
        const isOwner = currentUser.roles.includes(client_1.RoleName.MawkibOwner);
        if (!isAdmin && isOwner) {
            await this.mawkibsService.assertOwnerAccess(dto.mawkibId, currentUser.id);
        }
        const reservationDate = (0, date_util_1.parseDateOnly)(dto.reservationDate);
        const reservationEndDate = (0, date_util_1.parseDateOnly)(dto.reservationEndDate ?? dto.reservationDate);
        if (reservationEndDate < reservationDate) {
            throw new common_1.BadRequestException('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد');
        }
        await this.mawkibsService.assertReservationServiceStart(dto.mawkibId, reservationDate);
        await this.mawkibsService.assertMaxReservationDays(dto.mawkibId, reservationDate, reservationEndDate);
        await this.mawkibsService.assertCapacityInRange(dto.mawkibId, dto.maleGuestCount, dto.femaleGuestCount, reservationDate, reservationEndDate);
        let pilgrimUserId;
        if (dto.pilgrimUserId) {
            const pilgrim = await this.prisma.user.findUnique({
                where: { id: dto.pilgrimUserId },
            });
            if (!pilgrim) {
                throw new common_1.NotFoundException('زائر یافت نشد');
            }
            pilgrimUserId = pilgrim.id;
        }
        else {
            const pilgrim = await this.prisma.user.findUnique({
                where: { mobileNumber: dto.pilgrimMobile },
            });
            if (!pilgrim) {
                throw new common_1.NotFoundException('زائر با این شماره موبایل یافت نشد. ابتدا کاربر را ثبت کنید');
            }
            pilgrimUserId = pilgrim.id;
        }
        return this.createWithTrackingCode({
            mawkibId: dto.mawkibId,
            pilgrimUserId,
            reservedByUserId: currentUser.id,
            reservationDate,
            reservationEndDate,
            maleGuestCount: dto.maleGuestCount,
            femaleGuestCount: dto.femaleGuestCount,
            pilgrimMobile: dto.pilgrimMobile,
            description: dto.description,
            companions: dto.companions?.trim() || undefined,
            status: isAdmin ? client_1.ReservationStatus.Confirmed : client_1.ReservationStatus.Pending,
        });
    }
    async createGuest(dto) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: dto.mawkibId },
        });
        if (!mawkib || mawkib.status !== client_1.MawkibStatus.Approved) {
            throw new common_1.BadRequestException('موکب یافت نشد یا تایید نشده است');
        }
        const reservationDate = (0, date_util_1.parseDateOnly)(dto.reservationDate);
        const reservationEndDate = (0, date_util_1.parseDateOnly)(dto.reservationEndDate ?? dto.reservationDate);
        if (reservationEndDate < reservationDate) {
            throw new common_1.BadRequestException('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد');
        }
        await this.mawkibsService.assertReservationServiceStart(dto.mawkibId, reservationDate);
        await this.mawkibsService.assertMaxReservationDays(dto.mawkibId, reservationDate, reservationEndDate);
        await this.mawkibsService.assertCapacityInRange(dto.mawkibId, dto.maleGuestCount, dto.femaleGuestCount, reservationDate, reservationEndDate);
        const mobileNumber = dto.mobileNumber.trim();
        const pilgrim = await this.usersService.createQuickPilgrim({
            firstName: dto.firstName,
            lastName: dto.lastName,
            mobileNumber,
            province: dto.province,
            city: dto.city,
        });
        const reservation = await this.createWithTrackingCode({
            mawkibId: dto.mawkibId,
            pilgrimUserId: pilgrim.id,
            reservedByUserId: pilgrim.id,
            reservationDate,
            reservationEndDate,
            maleGuestCount: dto.maleGuestCount,
            femaleGuestCount: dto.femaleGuestCount,
            pilgrimMobile: mobileNumber,
            description: dto.description?.trim() || undefined,
            companions: dto.companions?.trim() || undefined,
            status: client_1.ReservationStatus.Pending,
        }, {
            mawkib: { select: { id: true, name: true } },
        });
        return {
            message: 'درخواست رزرو شما ثبت شد و پس از بررسی مدیریت، نتیجه اعلام خواهد شد',
            reservationId: reservation.id,
            trackingCode: reservation.trackingCode,
            status: reservation.status,
            mawkibName: reservation.mawkib.name,
            reservationDate: dto.reservationDate,
            reservationEndDate: dto.reservationEndDate,
            maleGuestCount: reservation.maleGuestCount,
            femaleGuestCount: reservation.femaleGuestCount,
        };
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
            const endDate = reservation.reservationEndDate ?? reservation.reservationDate;
            await this.mawkibsService.assertCapacityInRange(reservation.mawkibId, reservation.maleGuestCount, reservation.femaleGuestCount, reservation.reservationDate, endDate);
        }
        return this.prisma.reservation.update({
            where: { id },
            data: { status: dto.status },
            include: reservationInclude,
        });
    }
    async cancel(id, dto, currentUser) {
        const reservation = await this.findOne(id);
        const isAdmin = currentUser.roles.includes(client_1.RoleName.Admin);
        const isOwner = currentUser.roles.includes(client_1.RoleName.MawkibOwner);
        const isPilgrim = currentUser.roles.includes(client_1.RoleName.Pilgrim);
        if (reservation.status === client_1.ReservationStatus.Cancelled) {
            throw new common_1.BadRequestException('این رزرو قبلاً لغو شده است');
        }
        if (reservation.status === client_1.ReservationStatus.Completed) {
            throw new common_1.BadRequestException('رزرو تکمیل‌شده قابل لغو نیست');
        }
        if (isAdmin) {
        }
        else if (isPilgrim && !isAdmin && !isOwner) {
            if (reservation.pilgrimUserId !== currentUser.id) {
                throw new common_1.ForbiddenException('فقط رزروهای خودتان را می‌توانید لغو کنید');
            }
        }
        else if (isOwner && !isAdmin) {
            await this.mawkibsService.assertOwnerAccess(reservation.mawkibId, currentUser.id);
        }
        else {
            throw new common_1.ForbiddenException('شما مجوز لغو این رزرو را ندارید');
        }
        const note = dto.note?.trim() || undefined;
        return this.prisma.reservation.update({
            where: { id },
            data: {
                status: client_1.ReservationStatus.Cancelled,
                cancellationNote: note,
            },
            include: reservationInclude,
        });
    }
    async remove(id) {
        const reservation = await this.findOne(id);
        await this.prisma.reservation.delete({ where: { id: reservation.id } });
        return { id, message: 'رزرو با موفقیت حذف شد' };
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mawkibs_service_1.MawkibsService,
        users_service_1.UsersService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map