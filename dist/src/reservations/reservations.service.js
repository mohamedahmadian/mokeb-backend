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
const reservation_conflict_util_1 = require("./reservation-conflict.util");
const reservation_occupancy_util_1 = require("./reservation-occupancy.util");
const reviewUserSelect = {
    id: true,
    fullName: true,
};
const reservationInclude = {
    mawkib: {
        select: {
            id: true,
            name: true,
            address: true,
            defaultCheckInTime: true,
            defaultCheckOutTime: true,
        },
    },
    pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
    reservedBy: { select: { id: true, fullName: true, mobileNumber: true } },
    review: {
        include: {
            author: { select: reviewUserSelect },
            repliedBy: { select: reviewUserSelect },
        },
    },
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
        if (search.trackingCode) {
            where.trackingCode = {
                contains: search.trackingCode.trim(),
                mode: 'insensitive',
            };
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
            include: reservationInclude,
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
            include: reservationInclude,
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
            include: reservationInclude,
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
    async assertNoConflictingReservation(params) {
        const conflict = await this.prisma.reservation.findFirst({
            where: {
                pilgrimUserId: params.pilgrimUserId,
                status: { in: reservation_conflict_util_1.BLOCKING_RESERVATION_STATUSES },
                ...(params.excludeReservationId && {
                    id: { not: params.excludeReservationId },
                }),
                reservationDate: { lte: params.reservationEndDate },
                reservationEndDate: { gte: params.reservationDate },
            },
            select: {
                id: true,
                mawkibId: true,
                trackingCode: true,
                reservationDate: true,
                reservationEndDate: true,
                maleGuestCount: true,
                femaleGuestCount: true,
                mawkib: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!conflict) {
            return;
        }
        const candidate = {
            mawkibId: params.mawkibId,
            reservationDate: params.reservationDate,
            reservationEndDate: params.reservationEndDate,
            maleGuestCount: params.maleGuestCount,
            femaleGuestCount: params.femaleGuestCount,
        };
        if ((0, reservation_conflict_util_1.isExactReservationDuplicate)(conflict, candidate)) {
            throw new common_1.BadRequestException('رزرو تکراری با همین موکب، بازه تاریخ و تعداد نفرات برای این زائر وجود دارد');
        }
        throw new common_1.BadRequestException(`این زائر در بازه تاریخ انتخابی رزرو فعال دیگری دارد (کد: ${conflict.trackingCode}${conflict.mawkib?.name ? ` — ${conflict.mawkib.name}` : ''})`);
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
        await this.assertNoConflictingReservation({
            pilgrimUserId,
            mawkibId: dto.mawkibId,
            reservationDate,
            reservationEndDate,
            maleGuestCount: dto.maleGuestCount,
            femaleGuestCount: dto.femaleGuestCount,
        });
        const plannedTimes = (0, reservation_occupancy_util_1.resolvePlannedTimes)(dto, mawkib);
        return this.createWithTrackingCode({
            mawkibId: dto.mawkibId,
            pilgrimUserId,
            reservedByUserId: currentUser.id,
            reservationDate,
            reservationEndDate,
            plannedCheckInTime: plannedTimes.plannedCheckInTime,
            plannedCheckOutTime: plannedTimes.plannedCheckOutTime,
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
            password: dto.password?.trim() || undefined,
        });
        await this.assertNoConflictingReservation({
            pilgrimUserId: pilgrim.id,
            mawkibId: dto.mawkibId,
            reservationDate,
            reservationEndDate,
            maleGuestCount: dto.maleGuestCount,
            femaleGuestCount: dto.femaleGuestCount,
        });
        const plannedTimes = (0, reservation_occupancy_util_1.resolvePlannedTimes)(dto, mawkib);
        const reservation = await this.createWithTrackingCode({
            mawkibId: dto.mawkibId,
            pilgrimUserId: pilgrim.id,
            reservedByUserId: pilgrim.id,
            reservationDate,
            reservationEndDate,
            plannedCheckInTime: plannedTimes.plannedCheckInTime,
            plannedCheckOutTime: plannedTimes.plannedCheckOutTime,
            maleGuestCount: dto.maleGuestCount,
            femaleGuestCount: dto.femaleGuestCount,
            pilgrimMobile: mobileNumber,
            description: dto.description?.trim() || undefined,
            companions: dto.companions?.trim() || undefined,
            status: client_1.ReservationStatus.Pending,
        }, {
            mawkib: {
                select: {
                    id: true,
                    name: true,
                    defaultCheckInTime: true,
                    defaultCheckOutTime: true,
                },
            },
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
            await this.assertNoConflictingReservation({
                pilgrimUserId: reservation.pilgrimUserId,
                mawkibId: reservation.mawkibId,
                reservationDate: reservation.reservationDate,
                reservationEndDate: endDate,
                maleGuestCount: reservation.maleGuestCount,
                femaleGuestCount: reservation.femaleGuestCount,
                excludeReservationId: reservation.id,
            });
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
    assertCanRecordAttendance(reservation) {
        if (reservation.status === client_1.ReservationStatus.Cancelled) {
            throw new common_1.BadRequestException('رزرو لغوشده قابل ثبت ورود/خروج نیست');
        }
        if (reservation.status === client_1.ReservationStatus.Pending) {
            throw new common_1.BadRequestException('تا زمان تایید رزرو، امکان ثبت ورود یا خروج وجود ندارد');
        }
    }
    async checkIn(id, currentUser) {
        const reservation = await this.findOneForUser(id, currentUser);
        const isAdmin = currentUser.roles.includes(client_1.RoleName.Admin);
        const isOwner = currentUser.roles.includes(client_1.RoleName.MawkibOwner);
        const isPilgrim = currentUser.roles.includes(client_1.RoleName.Pilgrim) && !isAdmin && !isOwner;
        if (isPilgrim && reservation.pilgrimUserId !== currentUser.id) {
            throw new common_1.ForbiddenException('فقط رزروهای خودتان را می‌توانید ثبت کنید');
        }
        if (isOwner && !isAdmin) {
            await this.mawkibsService.assertOwnerAccess(reservation.mawkibId, currentUser.id);
        }
        this.assertCanRecordAttendance(reservation);
        if (reservation.actualCheckInAt) {
            throw new common_1.BadRequestException('ورود این رزرو قبلاً ثبت شده است');
        }
        if (reservation.actualCheckOutAt) {
            throw new common_1.BadRequestException('این رزرو قبلاً خروج خورده است');
        }
        return this.prisma.reservation.update({
            where: { id },
            data: { actualCheckInAt: new Date() },
            include: reservationInclude,
        });
    }
    async checkOut(id, currentUser) {
        const reservation = await this.findOneForUser(id, currentUser);
        const isAdmin = currentUser.roles.includes(client_1.RoleName.Admin);
        const isOwner = currentUser.roles.includes(client_1.RoleName.MawkibOwner);
        const isPilgrim = currentUser.roles.includes(client_1.RoleName.Pilgrim) && !isAdmin && !isOwner;
        if (isPilgrim && reservation.pilgrimUserId !== currentUser.id) {
            throw new common_1.ForbiddenException('فقط رزروهای خودتان را می‌توانید ثبت کنید');
        }
        if (isOwner && !isAdmin) {
            await this.mawkibsService.assertOwnerAccess(reservation.mawkibId, currentUser.id);
        }
        this.assertCanRecordAttendance(reservation);
        if (!reservation.actualCheckInAt) {
            throw new common_1.BadRequestException('ابتدا باید ورود ثبت شود');
        }
        if (reservation.actualCheckOutAt) {
            throw new common_1.BadRequestException('خروج این رزرو قبلاً ثبت شده است');
        }
        return this.prisma.reservation.update({
            where: { id },
            data: {
                actualCheckOutAt: new Date(),
                status: client_1.ReservationStatus.Completed,
            },
            include: reservationInclude,
        });
    }
    async checkInGuest(trackingCode) {
        const reservation = await this.findByTrackingCode(trackingCode);
        this.assertCanRecordAttendance(reservation);
        if (reservation.actualCheckInAt) {
            throw new common_1.BadRequestException('ورود این رزرو قبلاً ثبت شده است');
        }
        if (reservation.actualCheckOutAt) {
            throw new common_1.BadRequestException('این رزرو قبلاً خروج خورده است');
        }
        return this.prisma.reservation.update({
            where: { id: reservation.id },
            data: { actualCheckInAt: new Date() },
            include: reservationInclude,
        });
    }
    async checkOutGuest(trackingCode) {
        const reservation = await this.findByTrackingCode(trackingCode);
        this.assertCanRecordAttendance(reservation);
        if (!reservation.actualCheckInAt) {
            throw new common_1.BadRequestException('ابتدا باید ورود ثبت شود');
        }
        if (reservation.actualCheckOutAt) {
            throw new common_1.BadRequestException('خروج این رزرو قبلاً ثبت شده است');
        }
        return this.prisma.reservation.update({
            where: { id: reservation.id },
            data: {
                actualCheckOutAt: new Date(),
                status: client_1.ReservationStatus.Completed,
            },
            include: reservationInclude,
        });
    }
    assertCanReviewReservation(reservation, userId) {
        if (reservation.pilgrimUserId !== userId) {
            throw new common_1.ForbiddenException('فقط زائر این رزرو می‌تواند نظر ثبت کند');
        }
        if (reservation.status !== client_1.ReservationStatus.Confirmed &&
            reservation.status !== client_1.ReservationStatus.Completed) {
            throw new common_1.BadRequestException('فقط برای رزروهای تایید شده یا تکمیل شده می‌توانید نظر ثبت کنید');
        }
    }
    async createReview(reservationId, dto, currentUser) {
        const reservation = await this.findOneForUser(reservationId, currentUser);
        this.assertCanReviewReservation(reservation, currentUser.id);
        const existing = await this.prisma.reservationReview.findUnique({
            where: { reservationId },
        });
        if (existing) {
            throw new common_1.BadRequestException('برای این رزرو قبلاً نظر ثبت شده است');
        }
        await this.prisma.reservationReview.create({
            data: {
                reservationId,
                authorUserId: currentUser.id,
                content: dto.content.trim(),
            },
        });
        return this.findOne(reservationId);
    }
    async updateReview(reservationId, dto, currentUser) {
        const reservation = await this.findOneForUser(reservationId, currentUser);
        this.assertCanReviewReservation(reservation, currentUser.id);
        const review = await this.prisma.reservationReview.findUnique({
            where: { reservationId },
        });
        if (!review) {
            throw new common_1.NotFoundException('نظری برای این رزرو ثبت نشده است');
        }
        if (review.authorUserId !== currentUser.id) {
            throw new common_1.ForbiddenException('فقط نویسنده نظر می‌تواند آن را ویرایش کند');
        }
        if (review.adminReply) {
            throw new common_1.BadRequestException('پس از دریافت پاسخ مدیریت، امکان ویرایش نظر وجود ندارد');
        }
        await this.prisma.reservationReview.update({
            where: { reservationId },
            data: { content: dto.content.trim() },
        });
        return this.findOne(reservationId);
    }
    async replyToReview(reservationId, dto, currentUser) {
        const isAdmin = currentUser.roles.includes(client_1.RoleName.Admin);
        const isOwner = currentUser.roles.includes(client_1.RoleName.MawkibOwner);
        if (!isAdmin && !isOwner) {
            throw new common_1.ForbiddenException('فقط مدیر یا مسئول موکب می‌تواند به نظر پاسخ دهد');
        }
        await this.findOneForUser(reservationId, currentUser);
        const review = await this.prisma.reservationReview.findUnique({
            where: { reservationId },
        });
        if (!review) {
            throw new common_1.NotFoundException('نظری برای این رزرو ثبت نشده است');
        }
        await this.prisma.reservationReview.update({
            where: { reservationId },
            data: {
                adminReply: dto.adminReply.trim(),
                repliedAt: new Date(),
                repliedByUserId: currentUser.id,
            },
        });
        return this.findOne(reservationId);
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