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
const mawkib_inventory_service_1 = require("./mawkib-inventory.service");
const mawkibInclude = {
    owner: { select: { id: true, fullName: true, mobileNumber: true, province: true, city: true } },
    _count: { select: { reservations: true } },
    images: { orderBy: { sortOrder: 'asc' } },
};
let MawkibsService = class MawkibsService {
    prisma;
    inventoryService;
    constructor(prisma, inventoryService) {
        this.prisma = prisma;
        this.inventoryService = inventoryService;
    }
    applyAmenityFilters(where, search) {
        if (!search)
            return;
        for (const key of mawkib_dto_1.MAWKIB_AMENITY_FILTER_KEYS) {
            if (search[key] === true) {
                where[key] = true;
            }
        }
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
        if (search.ownerName) {
            where.owner = {
                fullName: { contains: search.ownerName, mode: 'insensitive' },
            };
        }
        if (search.country) {
            where.country = search.country;
        }
        if (search.mawkibCity) {
            where.mawkibCity = search.mawkibCity;
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
        this.applyAmenityFilters(where, search);
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
    async enrichWithTodayCapacity(mawkibs, day = new Date()) {
        const snapshots = await this.inventoryService.getSnapshotsForMawkibsOnDate(mawkibs, day);
        return mawkibs.map((mawkib) => {
            const snapshot = snapshots.get(mawkib.id);
            return {
                ...mawkib,
                availableMaleCapacity: snapshot.availableMale,
                availableFemaleCapacity: snapshot.availableFemale,
            };
        });
    }
    hasReservationAvailabilitySearch(search) {
        if (!search)
            return false;
        return !!(search.reservationDate ||
            search.reservationDateFrom ||
            search.reservationDateTo ||
            search.hasAvailability ||
            search.minAvailableMaleCapacity !== undefined ||
            search.minAvailableFemaleCapacity !== undefined);
    }
    async enrichAndFilterByAvailability(mawkibs, search) {
        const rangeStart = search.reservationDateFrom ?? search.reservationDate ?? undefined;
        const rangeEnd = search.reservationDateTo ??
            search.reservationDateFrom ??
            search.reservationDate ??
            undefined;
        let enriched;
        if (rangeStart && rangeEnd) {
            enriched = await Promise.all(mawkibs.map(async (mawkib) => {
                const snapshot = await this.getMinCapacityInRange(mawkib.id, (0, date_util_1.parseDateOnly)(rangeStart), (0, date_util_1.parseDateOnly)(rangeEnd));
                return {
                    ...mawkib,
                    availableMaleCapacity: snapshot.availableMale,
                    availableFemaleCapacity: snapshot.availableFemale,
                };
            }));
        }
        else if (rangeStart) {
            enriched = await this.enrichWithTodayCapacity(mawkibs, (0, date_util_1.parseDateOnly)(rangeStart));
        }
        else {
            enriched = await this.enrichWithTodayCapacity(mawkibs);
        }
        return enriched.filter((m) => {
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
    applyListPagination(items, search) {
        if (search?.all) {
            return items;
        }
        if (search?.page === undefined) {
            return items;
        }
        const pageSize = search.pageSize ?? 10;
        const page = search.page;
        const total = items.length;
        const skip = (page - 1) * pageSize;
        return {
            items: items.slice(skip, skip + pageSize),
            total,
            page,
            pageSize,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        };
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
        if (search?.country) {
            where.country = search.country;
        }
        if (search?.ownerName?.trim()) {
            where.owner = {
                fullName: { contains: search.ownerName.trim(), mode: 'insensitive' },
            };
        }
        this.applyAmenityFilters(where, search);
        const mawkibs = await this.prisma.mawkib.findMany({
            where,
            include: {
                owner: {
                    select: { id: true, fullName: true, mobileNumber: true, province: true, city: true },
                },
                images: { orderBy: { sortOrder: 'asc' } },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!this.hasReservationAvailabilitySearch(search)) {
            const enriched = await this.enrichWithTodayCapacity(mawkibs);
            const filtered = this.filterByCapacityView(enriched, search?.capacityFilter);
            return this.applyListPagination(filtered, search);
        }
        const filtered = await this.enrichAndFilterByAvailability(mawkibs, search);
        return this.applyListPagination(filtered, search);
    }
    async findAllAdmin(search) {
        const mawkibs = await this.prisma.mawkib.findMany({
            where: this.buildAdminWhere(search),
            include: mawkibInclude,
            orderBy: { createdAt: 'desc' },
        });
        const enriched = await this.enrichWithTodayCapacity(mawkibs);
        const filtered = this.filterByCapacityView(enriched, search?.capacityFilter);
        return this.applyListPagination(filtered, search);
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
        if (this.hasReservationAvailabilitySearch(search)) {
            const filtered = await this.enrichAndFilterByAvailability(mawkibs, search);
            return this.applyListPagination(filtered, search);
        }
        const enriched = await this.enrichWithTodayCapacity(mawkibs);
        const filtered = this.filterByCapacityView(enriched, search?.capacityFilter);
        return this.applyListPagination(filtered, search);
    }
    async syncGalleryImages(mawkibId, urls) {
        if (urls === undefined)
            return;
        const normalized = urls.map((url) => url.trim()).filter(Boolean);
        const existing = await this.prisma.mawkibImage.findMany({
            where: { mawkibId },
        });
        const desiredUrls = new Set(normalized);
        const toDelete = existing.filter((item) => !desiredUrls.has(item.url));
        if (toDelete.length > 0) {
            await this.prisma.mawkibImage.deleteMany({
                where: { id: { in: toDelete.map((item) => item.id) } },
            });
        }
        for (let index = 0; index < normalized.length; index += 1) {
            const url = normalized[index];
            const record = existing.find((item) => item.url === url);
            if (record) {
                if (record.sortOrder !== index) {
                    await this.prisma.mawkibImage.update({
                        where: { id: record.id },
                        data: { sortOrder: index },
                    });
                }
                continue;
            }
            await this.prisma.mawkibImage.create({
                data: { mawkibId, url, sortOrder: index },
            });
        }
    }
    async findOnePublic(id) {
        const mawkib = await this.prisma.mawkib.findFirst({
            where: { id, status: client_1.MawkibStatus.Approved },
            include: mawkibInclude,
        });
        if (!mawkib) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        const [enriched] = await this.enrichWithTodayCapacity([mawkib]);
        return enriched;
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
        const [enriched] = await this.enrichWithTodayCapacity([mawkib]);
        return enriched;
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
        const { ownerUserId: _ownerUserId, serviceStartDate, serviceEndDate, status, galleryImageUrls, ...fields } = dto;
        const created = await this.prisma.mawkib.create({
            data: {
                ...fields,
                serviceStartDate: serviceStartDate ? new Date(serviceStartDate) : undefined,
                serviceEndDate: serviceEndDate ? new Date(serviceEndDate) : undefined,
                status: isAdmin ? (status ?? client_1.MawkibStatus.Approved) : client_1.MawkibStatus.Pending,
                owner: { connect: { id: ownerUserId } },
            },
            include: mawkibInclude,
        });
        await this.inventoryService.seedHorizonForMawkib(created.id);
        await this.syncGalleryImages(created.id, galleryImageUrls);
        return this.prisma.mawkib.findUniqueOrThrow({
            where: { id: created.id },
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
        const { ownerUserId: _o, status: _s, serviceStartDate, serviceEndDate, galleryImageUrls, ...fields } = dto;
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
        const updated = await this.prisma.mawkib.update({
            where: { id },
            data,
            include: mawkibInclude,
        });
        await this.syncGalleryImages(id, galleryImageUrls);
        if (galleryImageUrls !== undefined) {
            return this.prisma.mawkib.findUniqueOrThrow({
                where: { id },
                include: mawkibInclude,
            });
        }
        return updated;
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
    async getInventoryHorizon() {
        return this.inventoryService.getHorizonMeta(new Date());
    }
    async getCapacitySnapshotsForMawkibs(mawkibs, day) {
        return this.inventoryService.getSnapshotsForMawkibsOnDate(mawkibs, day);
    }
    async getInventoryRange(mawkibId, query) {
        return this.inventoryService.getInventoryRange(mawkibId, query.startDate, query.endDate);
    }
    async getInventoryRangeForViewer(mawkibId, query, userId, isAdmin = false) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: mawkibId },
            select: { id: true, status: true, ownerUserId: true },
        });
        if (!mawkib) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        const isOwner = userId != null && mawkib.ownerUserId === userId;
        if (mawkib.status !== client_1.MawkibStatus.Approved && !isAdmin && !isOwner) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        return this.getInventoryRange(mawkibId, query);
    }
    async syncInventoryOnReservationConfirmed(reservation) {
        await this.inventoryService.applyReservationOccupancy(reservation, 1);
    }
    async syncInventoryOnReservationCancelled(reservation) {
        await this.inventoryService.applyReservationOccupancy(reservation, -1);
    }
    async syncInventoryOnEarlyCheckout(reservation) {
        await this.inventoryService.applyEarlyCheckoutRelease(reservation);
    }
    async getCapacitySnapshot(mawkibId, reservationDate) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: mawkibId },
        });
        if (!mawkib) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        const dateFilter = (0, date_util_1.parseDateOnly)(reservationDate ?? new Date());
        return this.inventoryService.getCapacitySnapshotFromInventory(mawkibId, dateFilter, mawkib.maleCapacity, mawkib.femaleCapacity);
    }
    async getMinCapacityInRange(mawkibId, startDate, endDate) {
        const start = (0, date_util_1.parseDateOnly)(startDate);
        const end = (0, date_util_1.parseDateOnly)(endDate);
        if (end < start) {
            throw new common_1.BadRequestException('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد');
        }
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: mawkibId },
            select: { maleCapacity: true, femaleCapacity: true },
        });
        if (!mawkib) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        return this.inventoryService.getMinCapacityInRangeFromInventory(mawkibId, start, end, mawkib.maleCapacity, mawkib.femaleCapacity);
    }
    async getAvailableCapacity(mawkibId, reservationDate) {
        const snapshot = await this.getCapacitySnapshot(mawkibId, reservationDate);
        return (0, capacity_types_1.totalAvailable)(snapshot);
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
            throw new common_1.BadRequestException(`تعداد بانوان (${femaleGuestCount}) از ظرفیت کل موکب (${mawkib.femaleCapacity} نفر) بیشتر است`);
        }
    }
    async assertCapacity(mawkibId, maleGuestCount, femaleGuestCount, reservationDate) {
        await this.assertGuestCountWithinMawkibCapacity(mawkibId, maleGuestCount, femaleGuestCount);
        const snapshot = await this.getCapacitySnapshot(mawkibId, reservationDate);
        if (maleGuestCount > snapshot.availableMale) {
            throw new common_1.BadRequestException(`ظرفیت آقایان کافی نیست. باقی‌مانده: ${snapshot.availableMale} نفر`);
        }
        if (femaleGuestCount > snapshot.availableFemale) {
            throw new common_1.BadRequestException(`ظرفیت بانوان کافی نیست. باقی‌مانده: ${snapshot.availableFemale} نفر`);
        }
    }
    async assertCapacityInRange(mawkibId, maleGuestCount, femaleGuestCount, startDate, endDate) {
        await this.assertGuestCountWithinMawkibCapacity(mawkibId, maleGuestCount, femaleGuestCount);
        const snapshot = await this.getMinCapacityInRange(mawkibId, startDate, endDate);
        if (maleGuestCount > snapshot.availableMale) {
            throw new common_1.BadRequestException(`ظرفیت آقایان کافی نیست. کمترین ظرفیت باقی‌مانده در بازه: ${snapshot.availableMale} نفر`);
        }
        if (femaleGuestCount > snapshot.availableFemale) {
            throw new common_1.BadRequestException(`ظرفیت بانوان کافی نیست. کمترین ظرفیت باقی‌مانده در بازه: ${snapshot.availableFemale} نفر`);
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
    assertOnlineReservationAllowed(mawkib, currentUser) {
        if (mawkib.onlineReservationEnabled) {
            return;
        }
        if (!currentUser) {
            throw new common_1.BadRequestException('امکان رزرو آنلاین این موکب غیرفعال است');
        }
        const isAdmin = currentUser.roles.includes(client_1.RoleName.Admin);
        const isOwner = currentUser.roles.includes(client_1.RoleName.MawkibOwner) &&
            mawkib.ownerUserId === currentUser.id;
        if (isAdmin || isOwner) {
            return;
        }
        throw new common_1.BadRequestException('امکان رزرو آنلاین این موکب غیرفعال است');
    }
};
exports.MawkibsService = MawkibsService;
exports.MawkibsService = MawkibsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mawkib_inventory_service_1.MawkibInventoryService])
], MawkibsService);
//# sourceMappingURL=mawkibs.service.js.map