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
const mawkib_search_utils_1 = require("./mawkib-search.utils");
const mawkib_dto_1 = require("./dto/mawkib.dto");
const date_util_1 = require("../common/utils/date.util");
const capacity_types_1 = require("../common/types/capacity.types");
const reservation_occupancy_util_1 = require("../reservations/reservation-occupancy.util");
const mawkibInclude = {
    owner: { select: { id: true, fullName: true, mobileNumber: true, province: true, city: true } },
    _count: { select: { reservations: true } },
};
let MawkibsService = class MawkibsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildAdminWhere(search) {
        if (!search)
            return {};
        const where = {};
        if (search.name) {
            where.name = { contains: search.name, mode: 'insensitive' };
        }
        if (search.phoneNumber) {
            where.phoneNumber = { contains: search.phoneNumber, mode: 'insensitive' };
        }
        if (search.status) {
            where.status = search.status;
        }
        if (search.ownerUserId) {
            where.ownerUserId = search.ownerUserId;
        }
        if (search.ownerName || search.province || search.city) {
            where.owner = {
                ...(search.ownerName && {
                    fullName: { contains: search.ownerName, mode: 'insensitive' },
                }),
                ...(search.province && {
                    province: { contains: search.province, mode: 'insensitive' },
                }),
                ...(search.city && {
                    city: { contains: search.city, mode: 'insensitive' },
                }),
            };
        }
        if (search.serviceStartFrom || search.serviceStartTo) {
            where.serviceStartDate = {
                ...(search.serviceStartFrom && { gte: new Date(search.serviceStartFrom) }),
                ...(search.serviceStartTo && { lte: new Date(search.serviceStartTo) }),
            };
        }
        if (search.serviceEndFrom || search.serviceEndTo) {
            where.serviceEndDate = {
                ...(search.serviceEndFrom && { gte: new Date(search.serviceEndFrom) }),
                ...(search.serviceEndTo && { lte: new Date(search.serviceEndTo) }),
            };
        }
        return where;
    }
    filterByCapacityView(items, capacityFilter) {
        if (!capacityFilter || capacityFilter === mawkib_dto_1.MawkibCapacityFilter.All) {
            return items;
        }
        if (capacityFilter === mawkib_dto_1.MawkibCapacityFilter.Available) {
            return items.filter((m) => m.availableMaleCapacity > 0 || m.availableFemaleCapacity > 0);
        }
        return items.filter((m) => m.availableMaleCapacity <= 0 && m.availableFemaleCapacity <= 0);
    }
    hasAvailabilitySearchParams(search) {
        if (!search)
            return false;
        return !!(search.reservationDate ||
            search.reservationDateFrom ||
            search.reservationDateTo ||
            search.hasAvailability ||
            search.minAvailableMaleCapacity !== undefined ||
            search.minAvailableFemaleCapacity !== undefined ||
            search.province ||
            search.city ||
            search.capacityFilter ||
            search.serviceStartFrom ||
            search.serviceStartTo ||
            search.serviceEndFrom ||
            search.serviceEndTo);
    }
    async enrichAndFilterByAvailability(mawkibs, search) {
        const rangeStart = search.reservationDateFrom ?? search.reservationDate ?? undefined;
        const rangeEnd = search.reservationDateTo ??
            search.reservationDateFrom ??
            search.reservationDate ??
            undefined;
        const enriched = await Promise.all(mawkibs.map(async (mawkib) => {
            let snapshot;
            if (rangeStart && rangeEnd) {
                snapshot = await this.getMinCapacityInRange(mawkib.id, (0, date_util_1.parseDateOnly)(rangeStart), (0, date_util_1.parseDateOnly)(rangeEnd));
            }
            else if (rangeStart) {
                snapshot = await this.getCapacitySnapshot(mawkib.id, (0, date_util_1.parseDateOnly)(rangeStart));
            }
            else {
                snapshot = await this.getCapacitySnapshot(mawkib.id);
            }
            return {
                ...mawkib,
                availableMaleCapacity: snapshot.availableMale,
                availableFemaleCapacity: snapshot.availableFemale,
            };
        }));
        return enriched.filter((m) => {
            if (search.province && m.owner.province !== search.province)
                return false;
            if (search.city && m.owner.city !== search.city)
                return false;
            if (rangeStart && m.maxReservationDays) {
                const dayCount = (0, date_util_1.eachDateInRange)((0, date_util_1.parseDateOnly)(rangeStart), (0, date_util_1.parseDateOnly)(rangeEnd ?? rangeStart)).length;
                if (dayCount > m.maxReservationDays)
                    return false;
            }
            if (rangeStart && m.serviceStartDate) {
                const resStart = (0, date_util_1.parseDateOnly)(rangeStart);
                if (resStart < m.serviceStartDate)
                    return false;
            }
            if (search.minAvailableMaleCapacity !== undefined &&
                m.maleCapacity < search.minAvailableMaleCapacity) {
                return false;
            }
            if (search.minAvailableFemaleCapacity !== undefined &&
                m.femaleCapacity < search.minAvailableFemaleCapacity) {
                return false;
            }
            if (search.minAvailableMaleCapacity !== undefined &&
                m.availableMaleCapacity < search.minAvailableMaleCapacity) {
                return false;
            }
            if (search.minAvailableFemaleCapacity !== undefined &&
                m.availableFemaleCapacity < search.minAvailableFemaleCapacity) {
                return false;
            }
            if (search.hasAvailability &&
                m.availableMaleCapacity <= 0 &&
                m.availableFemaleCapacity <= 0) {
                return false;
            }
            if (search.capacityFilter === mawkib_dto_1.MawkibCapacityFilter.Available) {
                if (m.availableMaleCapacity <= 0 && m.availableFemaleCapacity <= 0) {
                    return false;
                }
            }
            if (search.capacityFilter === mawkib_dto_1.MawkibCapacityFilter.Full) {
                if (m.availableMaleCapacity > 0 || m.availableFemaleCapacity > 0) {
                    return false;
                }
            }
            return true;
        });
    }
    async findAll(search) {
        const where = {
            status: client_1.MawkibStatus.Approved,
            ...(search?.name && {
                name: { contains: search.name, mode: 'insensitive' },
            }),
        };
        if (search?.q?.trim()) {
            const term = search.q.trim();
            const matchedCities = (0, mawkib_search_utils_1.matchMawkibCitiesFromQuery)(term);
            const matchedCountries = (0, mawkib_search_utils_1.matchMawkibCountriesFromQuery)(term);
            const or = [
                { name: { contains: term, mode: 'insensitive' } },
                { address: { contains: term, mode: 'insensitive' } },
            ];
            for (const city of matchedCities) {
                or.push({ mawkibCity: city });
            }
            for (const country of matchedCountries) {
                or.push({ country });
            }
            where.OR = or;
        }
        if (search?.serviceStartFrom || search?.serviceStartTo) {
            where.serviceStartDate = {
                ...(search.serviceStartFrom && { gte: new Date(search.serviceStartFrom) }),
                ...(search.serviceStartTo && { lte: new Date(search.serviceStartTo) }),
            };
        }
        if (search?.serviceEndFrom || search?.serviceEndTo) {
            where.serviceEndDate = {
                ...(search.serviceEndFrom && { gte: new Date(search.serviceEndFrom) }),
                ...(search.serviceEndTo && { lte: new Date(search.serviceEndTo) }),
            };
        }
        if (search?.minAvailableMaleCapacity !== undefined) {
            where.maleCapacity = { gte: search.minAvailableMaleCapacity };
        }
        if (search?.minAvailableFemaleCapacity !== undefined) {
            where.femaleCapacity = { gte: search.minAvailableFemaleCapacity };
        }
        if (search?.mawkibCity) {
            where.mawkibCity = search.mawkibCity;
        }
        const mawkibs = await this.prisma.mawkib.findMany({
            where,
            include: {
                owner: {
                    select: { id: true, fullName: true, mobileNumber: true, province: true, city: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!this.hasAvailabilitySearchParams(search)) {
            return mawkibs;
        }
        return this.enrichAndFilterByAvailability(mawkibs, search);
    }
    async findAllAdmin(search) {
        const mawkibs = await this.prisma.mawkib.findMany({
            where: this.buildAdminWhere(search),
            include: mawkibInclude,
            orderBy: { createdAt: 'desc' },
        });
        const enriched = await Promise.all(mawkibs.map(async (mawkib) => {
            const snapshot = await this.getCapacitySnapshot(mawkib.id);
            return {
                ...mawkib,
                availableMaleCapacity: snapshot.availableMale,
                availableFemaleCapacity: snapshot.availableFemale,
            };
        }));
        return this.filterByCapacityView(enriched, search?.capacityFilter);
    }
    async findByOwner(ownerUserId, search) {
        const mawkibs = await this.prisma.mawkib.findMany({
            where: {
                ownerUserId,
                ...this.buildAdminWhere(search),
            },
            include: mawkibInclude,
            orderBy: { createdAt: 'desc' },
        });
        if (this.hasAvailabilitySearchParams(search)) {
            return this.enrichAndFilterByAvailability(mawkibs, search);
        }
        const enriched = await Promise.all(mawkibs.map(async (mawkib) => {
            const snapshot = await this.getCapacitySnapshot(mawkib.id);
            return {
                ...mawkib,
                availableMaleCapacity: snapshot.availableMale,
                availableFemaleCapacity: snapshot.availableFemale,
            };
        }));
        return this.filterByCapacityView(enriched, search?.capacityFilter);
    }
    async findOnePublic(id) {
        const mawkib = await this.prisma.mawkib.findFirst({
            where: { id, status: client_1.MawkibStatus.Approved },
            include: mawkibInclude,
        });
        if (!mawkib) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        const snapshot = await this.getCapacitySnapshot(mawkib.id);
        return {
            ...mawkib,
            availableMaleCapacity: snapshot.availableMale,
            availableFemaleCapacity: snapshot.availableFemale,
        };
    }
    async findOne(id, userId, isAdmin = true) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id },
            include: mawkibInclude,
        });
        if (!mawkib) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        if (!isAdmin && userId && mawkib.ownerUserId !== userId) {
            throw new common_1.ForbiddenException('شما مجوز مشاهده این موکب را ندارید');
        }
        const snapshot = await this.getCapacitySnapshot(mawkib.id);
        return {
            ...mawkib,
            availableMaleCapacity: snapshot.availableMale,
            availableFemaleCapacity: snapshot.availableFemale,
        };
    }
    async create(dto, actingUserId, isAdmin = true) {
        const ownerUserId = isAdmin ? dto.ownerUserId : actingUserId;
        if (!ownerUserId) {
            throw new common_1.BadRequestException('مسئول موکب مشخص نشده است');
        }
        if (!isAdmin && dto.ownerUserId && dto.ownerUserId !== actingUserId) {
            throw new common_1.ForbiddenException('امکان ثبت موکب برای کاربر دیگر وجود ندارد');
        }
        const owner = await this.prisma.user.findUnique({
            where: { id: ownerUserId },
        });
        if (!owner) {
            throw new common_1.NotFoundException('مسئول موکب یافت نشد');
        }
        const { ownerUserId: _ownerUserId, serviceStartDate, serviceEndDate, status, ...fields } = dto;
        return this.prisma.mawkib.create({
            data: {
                ...fields,
                serviceStartDate: serviceStartDate ? new Date(serviceStartDate) : undefined,
                serviceEndDate: serviceEndDate ? new Date(serviceEndDate) : undefined,
                status: isAdmin ? (status ?? client_1.MawkibStatus.Approved) : client_1.MawkibStatus.Pending,
                owner: { connect: { id: ownerUserId } },
            },
            include: mawkibInclude,
        });
    }
    async update(id, dto, userId, isAdmin = true) {
        const mawkib = await this.prisma.mawkib.findUnique({ where: { id } });
        if (!mawkib) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        if (!isAdmin) {
            if (mawkib.ownerUserId !== userId) {
                throw new common_1.ForbiddenException('شما مجوز ویرایش این موکب را ندارید');
            }
        }
        const ownerUserId = isAdmin ? dto.ownerUserId : undefined;
        const status = isAdmin ? dto.status : undefined;
        const { ownerUserId: _o, status: _s, serviceStartDate, serviceEndDate, ...fields } = dto;
        const data = {
            ...fields,
            ...(serviceStartDate !== undefined && {
                serviceStartDate: serviceStartDate ? new Date(serviceStartDate) : null,
            }),
            ...(serviceEndDate !== undefined && {
                serviceEndDate: serviceEndDate ? new Date(serviceEndDate) : null,
            }),
        };
        if (isAdmin) {
            if (status !== undefined)
                data.status = status;
            if (ownerUserId !== undefined) {
                const owner = await this.prisma.user.findUnique({
                    where: { id: ownerUserId },
                });
                if (!owner) {
                    throw new common_1.NotFoundException('مسئول موکب یافت نشد');
                }
                data.owner = { connect: { id: ownerUserId } };
            }
        }
        return this.prisma.mawkib.update({
            where: { id },
            data,
            include: mawkibInclude,
        });
    }
    async remove(id) {
        await this.findOne(id);
        const reservationCount = await this.prisma.reservation.count({
            where: {
                mawkibId: id,
                status: { in: [client_1.ReservationStatus.Pending, client_1.ReservationStatus.Confirmed] },
            },
        });
        if (reservationCount > 0) {
            const updated = await this.prisma.mawkib.update({
                where: { id },
                data: { status: client_1.MawkibStatus.Rejected },
                include: mawkibInclude,
            });
            return {
                ...updated,
                message: 'موکب به‌دلیل داشتن رزرو فعال، رد شد (حذف نشد)',
                softDeleted: true,
            };
        }
        await this.prisma.mawkib.delete({ where: { id } });
        return { id, message: 'موکب حذف شد', softDeleted: false };
    }
    async updateStatus(id, status) {
        await this.findOne(id);
        return this.prisma.mawkib.update({
            where: { id },
            data: { status },
            include: mawkibInclude,
        });
    }
    async getCapacitySnapshot(mawkibId, reservationDate) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: mawkibId },
        });
        if (!mawkib) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        const dateFilter = (0, date_util_1.parseDateOnly)(reservationDate ?? new Date());
        const candidates = await this.prisma.reservation.findMany({
            where: {
                mawkibId,
                status: client_1.ReservationStatus.Confirmed,
                reservationDate: { lte: dateFilter },
                OR: [
                    { reservationEndDate: { gt: dateFilter } },
                    { actualCheckOutAt: { not: null } },
                ],
            },
            select: {
                reservationDate: true,
                reservationEndDate: true,
                actualCheckOutAt: true,
                maleGuestCount: true,
                femaleGuestCount: true,
            },
        });
        let reservedMale = 0;
        let reservedFemale = 0;
        for (const reservation of candidates) {
            if (!(0, reservation_occupancy_util_1.reservationOccupiesDay)(reservation, dateFilter))
                continue;
            reservedMale += reservation.maleGuestCount;
            reservedFemale += reservation.femaleGuestCount;
        }
        return {
            maleCapacity: mawkib.maleCapacity,
            femaleCapacity: mawkib.femaleCapacity,
            availableMale: Math.max(0, mawkib.maleCapacity - reservedMale),
            availableFemale: Math.max(0, mawkib.femaleCapacity - reservedFemale),
        };
    }
    async getAvailableCapacity(mawkibId, reservationDate) {
        const snapshot = await this.getCapacitySnapshot(mawkibId, reservationDate);
        return (0, capacity_types_1.totalAvailable)(snapshot);
    }
    async getMinCapacityInRange(mawkibId, startDate, endDate) {
        const start = (0, date_util_1.parseDateOnly)(startDate);
        const end = (0, date_util_1.parseDateOnly)(endDate);
        if (end < start) {
            throw new common_1.BadRequestException('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد');
        }
        const days = (0, date_util_1.eachDateInRange)(start, end);
        let minMale = Number.POSITIVE_INFINITY;
        let minFemale = Number.POSITIVE_INFINITY;
        let maleCapacity = 0;
        let femaleCapacity = 0;
        for (const day of days) {
            const snapshot = await this.getCapacitySnapshot(mawkibId, day);
            maleCapacity = snapshot.maleCapacity;
            femaleCapacity = snapshot.femaleCapacity;
            minMale = Math.min(minMale, snapshot.availableMale);
            minFemale = Math.min(minFemale, snapshot.availableFemale);
        }
        return {
            maleCapacity,
            femaleCapacity,
            availableMale: minMale === Number.POSITIVE_INFINITY ? 0 : minMale,
            availableFemale: minFemale === Number.POSITIVE_INFINITY ? 0 : minFemale,
        };
    }
    async getMinAvailableCapacityInRange(mawkibId, startDate, endDate) {
        const snapshot = await this.getMinCapacityInRange(mawkibId, startDate, endDate);
        return (0, capacity_types_1.totalAvailable)(snapshot);
    }
    async assertGuestCountWithinMawkibCapacity(mawkibId, maleGuestCount, femaleGuestCount) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: mawkibId },
            select: { maleCapacity: true, femaleCapacity: true },
        });
        if (!mawkib) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        if (maleGuestCount > mawkib.maleCapacity) {
            throw new common_1.BadRequestException(`تعداد آقایان (${maleGuestCount}) از ظرفیت کل موکب (${mawkib.maleCapacity} نفر) بیشتر است`);
        }
        if (femaleGuestCount > mawkib.femaleCapacity) {
            throw new common_1.BadRequestException(`تعداد خانم‌ها (${femaleGuestCount}) از ظرفیت کل موکب (${mawkib.femaleCapacity} نفر) بیشتر است`);
        }
    }
    async assertCapacity(mawkibId, maleGuestCount, femaleGuestCount, reservationDate) {
        await this.assertGuestCountWithinMawkibCapacity(mawkibId, maleGuestCount, femaleGuestCount);
        const snapshot = await this.getCapacitySnapshot(mawkibId, reservationDate);
        if (maleGuestCount > snapshot.availableMale) {
            throw new common_1.BadRequestException(`ظرفیت آقایان کافی نیست. باقی‌مانده: ${snapshot.availableMale} نفر`);
        }
        if (femaleGuestCount > snapshot.availableFemale) {
            throw new common_1.BadRequestException(`ظرفیت خانم‌ها کافی نیست. باقی‌مانده: ${snapshot.availableFemale} نفر`);
        }
    }
    async assertCapacityInRange(mawkibId, maleGuestCount, femaleGuestCount, startDate, endDate) {
        await this.assertGuestCountWithinMawkibCapacity(mawkibId, maleGuestCount, femaleGuestCount);
        const snapshot = await this.getMinCapacityInRange(mawkibId, startDate, endDate);
        if (maleGuestCount > snapshot.availableMale) {
            throw new common_1.BadRequestException(`ظرفیت آقایان کافی نیست. کمترین ظرفیت باقی‌مانده در بازه: ${snapshot.availableMale} نفر`);
        }
        if (femaleGuestCount > snapshot.availableFemale) {
            throw new common_1.BadRequestException(`ظرفیت خانم‌ها کافی نیست. کمترین ظرفیت باقی‌مانده در بازه: ${snapshot.availableFemale} نفر`);
        }
    }
    async assertReservationServiceStart(mawkibId, reservationStart) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: mawkibId },
            select: { serviceStartDate: true },
        });
        if (!mawkib) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        if (!mawkib.serviceStartDate)
            return;
        const start = (0, date_util_1.parseDateOnly)(reservationStart);
        if (start < mawkib.serviceStartDate) {
            throw new common_1.BadRequestException('تاریخ شروع رزرو نمی‌تواند قبل از تاریخ شروع خدمات موکب باشد');
        }
    }
    async assertMaxReservationDays(mawkibId, startDate, endDate) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: mawkibId },
            select: { maxReservationDays: true },
        });
        if (!mawkib?.maxReservationDays)
            return;
        const days = (0, date_util_1.eachDateInRange)((0, date_util_1.parseDateOnly)(startDate), (0, date_util_1.parseDateOnly)(endDate)).length;
        if (days > mawkib.maxReservationDays) {
            throw new common_1.BadRequestException(`حداکثر بازه رزرو برای این موکب ${mawkib.maxReservationDays} روز است`);
        }
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
};
exports.MawkibsService = MawkibsService;
exports.MawkibsService = MawkibsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MawkibsService);
//# sourceMappingURL=mawkibs.service.js.map