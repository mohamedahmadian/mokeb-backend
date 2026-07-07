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
const reservation_events_service_1 = require("./reservation-events.service");
const reservation_event_util_1 = require("./reservation-event.util");
const date_util_1 = require("../common/utils/date.util");
const reservation_code_util_1 = require("../common/utils/reservation-code.util");
const mobile_search_util_1 = require("../common/utils/mobile-search.util");
const reservation_conflict_util_1 = require("./reservation-conflict.util");
const reservation_guest_count_util_1 = require("./reservation-guest-count.util");
const reservation_occupancy_util_1 = require("./reservation-occupancy.util");
const reservation_extend_util_1 = require("./reservation-extend.util");
const reservation_lookup_util_1 = require("./reservation-lookup.util");
const meal_plans_service_1 = require("../meal-plans/meal-plans.service");
const attendance_roster_dto_1 = require("./dto/attendance-roster.dto");
const attendance_roster_util_1 = require("./attendance-roster.util");
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
            phoneNumber: true,
            imageUrl: true,
            latitude: true,
            longitude: true,
            defaultCheckInTime: true,
            defaultCheckOutTime: true,
            defaultReservationDays: true,
            maxReservationDays: true,
            mealPlanManagementEnabled: true,
            owner: { select: { fullName: true, mobileNumber: true } },
        },
    },
    pilgrim: { select: { id: true, fullName: true, mobileNumber: true, nationalId: true } },
    reservedBy: { select: { id: true, fullName: true, mobileNumber: true } },
    lastStatusUpdatedBy: { select: reviewUserSelect },
    review: {
        include: {
            author: { select: reviewUserSelect },
            repliedBy: { select: reviewUserSelect },
        },
    },
    deliveredItems: {
        include: {
            recordedBy: { select: reviewUserSelect },
        },
        orderBy: { createdAt: 'desc' },
    },
};
const guestReservationTrackInclude = {
    mawkib: {
        select: {
            id: true,
            name: true,
            address: true,
            phoneNumber: true,
            imageUrl: true,
        },
    },
    pilgrim: { select: { id: true, fullName: true, mobileNumber: true, nationalId: true } },
    reservedBy: { select: { id: true, fullName: true, mobileNumber: true } },
    deliveredItems: {
        include: {
            recordedBy: { select: reviewUserSelect },
        },
        orderBy: { createdAt: 'desc' },
    },
};
let ReservationsService = class ReservationsService {
    prisma;
    mawkibsService;
    usersService;
    reservationEventsService;
    mealPlansService;
    constructor(prisma, mawkibsService, usersService, reservationEventsService, mealPlansService) {
        this.prisma = prisma;
        this.mawkibsService = mawkibsService;
        this.usersService = usersService;
        this.reservationEventsService = reservationEventsService;
        this.mealPlansService = mealPlansService;
    }
    async maybeGenerateMealPlans(reservation) {
        await this.mealPlansService.autoGenerateForNewReservation({
            reservationId: reservation.id,
            mawkibId: reservation.mawkibId,
            reservationDate: reservation.reservationDate,
            reservationEndDate: reservation.reservationEndDate,
        });
    }
    statusAuditFields(userId) {
        return {
            lastStatusUpdatedByUserId: userId,
            lastStatusUpdatedAt: new Date(),
        };
    }
    appendWhereAnd(where, clause) {
        const existingAnd = where.AND
            ? Array.isArray(where.AND)
                ? where.AND
                : [where.AND]
            : [];
        where.AND = [...existingAnd, clause];
    }
    buildReservationLookupOrConditions(query, exact = false) {
        const q = query.trim();
        const conditions = [];
        if (exact) {
            const id = (0, reservation_lookup_util_1.parseReservationIdLookup)(q);
            if (id != null) {
                conditions.push({ id });
            }
            conditions.push({
                trackingCode: { equals: q, mode: 'insensitive' },
            });
            const mobileVariants = (0, mobile_search_util_1.buildExactMobileLookupVariants)(q);
            if (mobileVariants.length > 0) {
                conditions.push({ pilgrimMobile: { in: mobileVariants } }, {
                    pilgrim: {
                        mobileNumber: { in: mobileVariants },
                    },
                });
            }
            conditions.push({
                pilgrim: {
                    nationalId: { equals: q, mode: 'insensitive' },
                },
            });
            return conditions;
        }
        const id = (0, reservation_lookup_util_1.parseReservationIdLookup)(q);
        if (id != null) {
            conditions.push({ id });
            conditions.push({ trackingCode: { equals: q, mode: 'insensitive' } }, { trackingCode: { endsWith: `-${q}`, mode: 'insensitive' } });
        }
        conditions.push({ trackingCode: { contains: q, mode: 'insensitive' } }, { pilgrimMobile: { contains: q, mode: 'insensitive' } }, {
            pilgrim: {
                mobileNumber: { contains: q, mode: 'insensitive' },
            },
        }, {
            pilgrim: {
                nationalId: { contains: q, mode: 'insensitive' },
            },
        });
        const digits = (0, mobile_search_util_1.normalizeMobileDigits)(q);
        if (digits && digits !== q) {
            conditions.push({ pilgrimMobile: { contains: digits, mode: 'insensitive' } }, {
                pilgrim: {
                    mobileNumber: { contains: digits, mode: 'insensitive' },
                },
            }, {
                pilgrim: {
                    nationalId: { contains: digits, mode: 'insensitive' },
                },
            });
        }
        for (const pattern of (0, mobile_search_util_1.buildMobileSearchPatterns)(q)) {
            if (pattern === q || pattern === digits)
                continue;
            conditions.push({ pilgrimMobile: { contains: pattern, mode: 'insensitive' } }, {
                pilgrim: {
                    mobileNumber: { contains: pattern, mode: 'insensitive' },
                },
            });
        }
        return conditions;
    }
    buildSearchWhere(search) {
        if (!search)
            return {};
        const where = {};
        const lookupQuery = search.lookupQuery?.trim();
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
        if (search.createdAtFrom || search.createdAtTo) {
            const fromDate = search.createdAtFrom ?? search.createdAtTo;
            const toDate = search.createdAtTo ?? search.createdAtFrom;
            const start = new Date(fromDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(toDate);
            end.setHours(23, 59, 59, 999);
            where.createdAt = { gte: start, lte: end };
        }
        if (search.mawkibName?.trim()) {
            where.mawkib = {
                name: { contains: search.mawkibName.trim(), mode: 'insensitive' },
            };
        }
        if (search.pilgrimUserId) {
            where.pilgrimUserId = search.pilgrimUserId;
        }
        if (lookupQuery) {
            this.appendWhereAnd(where, {
                OR: this.buildReservationLookupOrConditions(lookupQuery, search.lookupExact),
            });
        }
        else if (search.trackingCode) {
            where.trackingCode = {
                contains: search.trackingCode.trim(),
                mode: 'insensitive',
            };
        }
        if (!lookupQuery &&
            (search.pilgrimName ||
                search.pilgrimMobile ||
                search.pilgrimNationalId)) {
            const pilgrimFilters = [];
            if (search.pilgrimName) {
                pilgrimFilters.push({
                    pilgrim: {
                        fullName: { contains: search.pilgrimName, mode: 'insensitive' },
                    },
                });
            }
            if (search.pilgrimMobile) {
                const patterns = (0, mobile_search_util_1.buildMobileSearchPatterns)(search.pilgrimMobile);
                if (patterns.length > 0) {
                    pilgrimFilters.push({
                        OR: patterns.flatMap((pattern) => [
                            { pilgrimMobile: { contains: pattern, mode: 'insensitive' } },
                            {
                                pilgrim: {
                                    mobileNumber: { contains: pattern, mode: 'insensitive' },
                                },
                            },
                        ]),
                    });
                }
            }
            if (search.pilgrimNationalId?.trim()) {
                pilgrimFilters.push({
                    pilgrim: {
                        nationalId: {
                            contains: search.pilgrimNationalId.trim(),
                            mode: 'insensitive',
                        },
                    },
                });
            }
            if (pilgrimFilters.length === 1) {
                Object.assign(where, pilgrimFilters[0]);
            }
            else {
                const existingAnd = where.AND
                    ? Array.isArray(where.AND)
                        ? where.AND
                        : [where.AND]
                    : [];
                where.AND = [...existingAnd, ...pilgrimFilters];
            }
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
    sortByReservationDate(items, search) {
        const order = search?.sortOrder ?? 'desc';
        return [...items].sort((a, b) => {
            const dateDiff = a.reservationDate.getTime() - b.reservationDate.getTime();
            if (dateDiff !== 0) {
                return order === 'asc' ? dateDiff : -dateDiff;
            }
            const createdDiff = a.createdAt.getTime() - b.createdAt.getTime();
            return order === 'asc' ? createdDiff : -createdDiff;
        });
    }
    applyLookupRanking(items, search) {
        const lookupQuery = search?.lookupQuery?.trim();
        if (!lookupQuery)
            return items;
        const ranked = (0, reservation_lookup_util_1.rankReservationsByLookupQuery)(items, lookupQuery, search?.lookupExact);
        if (search?.lookupSingle) {
            return ranked.length > 0 ? [ranked[0]] : [];
        }
        return ranked;
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
    async findAllAdmin(search) {
        const items = await this.prisma.reservation.findMany({
            where: this.buildSearchWhere(search),
            include: reservationInclude,
            orderBy: { reservationDate: 'desc' },
        });
        const filtered = this.sortByReservationDate(this.applyLookupRanking(this.filterReservationsByMobileSearch(this.filterByGuestCountTotal(items, search), search), search), search);
        return this.applyListPagination(filtered, search);
    }
    async findByPilgrim(pilgrimUserId, search) {
        const items = await this.prisma.reservation.findMany({
            where: {
                pilgrimUserId,
                ...this.buildSearchWhere(search),
            },
            include: reservationInclude,
            orderBy: { reservationDate: 'desc' },
        });
        const filtered = this.sortByReservationDate(this.applyLookupRanking(this.filterReservationsByMobileSearch(this.filterByGuestCountTotal(items, search), search), search), search);
        return this.applyListPagination(filtered, search);
    }
    async findByMawkibOwner(ownerUserId, search) {
        const mawkibs = await this.prisma.mawkib.findMany({
            where: { ownerUserId },
            select: { id: true },
        });
        const mawkibIds = mawkibs.map((m) => m.id);
        if (search?.mawkibId && !mawkibIds.includes(search.mawkibId)) {
            return this.applyListPagination([], search);
        }
        const { mawkibId, ...rest } = search ?? {};
        const items = await this.prisma.reservation.findMany({
            where: {
                mawkibId: mawkibId ?? { in: mawkibIds },
                ...this.buildSearchWhere(rest),
            },
            include: reservationInclude,
            orderBy: { reservationDate: 'desc' },
        });
        const filtered = this.sortByReservationDate(this.applyLookupRanking(this.filterReservationsByMobileSearch(this.filterByGuestCountTotal(items, search), search), search), search);
        return this.applyListPagination(filtered, search);
    }
    async getPendingCountsByMawkib(user) {
        const isAdmin = user.roles.includes(client_1.RoleName.Admin);
        const isMawkibOwner = user.roles.includes(client_1.RoleName.MawkibOwner);
        if (!isAdmin && !isMawkibOwner) {
            throw new common_1.ForbiddenException('شما مجوز دسترسی به این اطلاعات را ندارید');
        }
        const where = {
            status: client_1.ReservationStatus.Pending,
            ...(isAdmin ? {} : { mawkib: { ownerUserId: user.id } }),
        };
        const counts = await this.prisma.reservation.groupBy({
            by: ['mawkibId'],
            where,
            _count: { id: true },
        });
        const mawkibIds = counts.map((item) => item.mawkibId);
        const mawkibs = await this.prisma.mawkib.findMany({
            where: { id: { in: mawkibIds } },
            select: { id: true, name: true },
        });
        const nameById = new Map(mawkibs.map((m) => [m.id, m.name]));
        const byMawkib = counts
            .map((item) => ({
            mawkibId: item.mawkibId,
            mawkibName: nameById.get(item.mawkibId) ?? '',
            count: item._count.id,
        }))
            .sort((a, b) => a.mawkibName.localeCompare(b.mawkibName, 'fa'));
        const total = byMawkib.reduce((sum, item) => sum + item.count, 0);
        return { total, byMawkib };
    }
    pickReservationForPilgrimCard(reservations) {
        const statusPriority = {
            [client_1.ReservationStatus.Confirmed]: 0,
            [client_1.ReservationStatus.Completed]: 1,
            [client_1.ReservationStatus.Pending]: 2,
            [client_1.ReservationStatus.Cancelled]: 99,
        };
        const eligible = reservations.filter((item) => item.status !== client_1.ReservationStatus.Cancelled);
        if (eligible.length === 0)
            return null;
        return [...eligible].sort((a, b) => {
            const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
            if (priorityDiff !== 0)
                return priorityDiff;
            return b.reservationDate.getTime() - a.reservationDate.getTime();
        })[0];
    }
    async findLatestForPilgrimCard(pilgrimUserId, user, ownerScope = false) {
        const isAdmin = user.roles.includes(client_1.RoleName.Admin);
        const isMawkibOwner = user.roles.includes(client_1.RoleName.MawkibOwner);
        if (!isAdmin && !isMawkibOwner) {
            throw new common_1.ForbiddenException('شما مجوز دسترسی به این اطلاعات را ندارید');
        }
        const search = { pilgrimUserId, all: true };
        const useOwnerScope = ownerScope
            ? isMawkibOwner
            : !isAdmin && isMawkibOwner;
        const result = useOwnerScope
            ? await this.findByMawkibOwner(user.id, search)
            : await this.findAllAdmin(search);
        const reservations = Array.isArray(result) ? result : [];
        return this.pickReservationForPilgrimCard(reservations);
    }
    filterReservationsByMobileSearch(items, search) {
        if (search?.lookupQuery?.trim())
            return items;
        if (!search?.pilgrimMobile?.trim())
            return items;
        const searchDigits = (0, mobile_search_util_1.normalizeMobileDigits)(search.pilgrimMobile);
        return items.filter((item) => (0, mobile_search_util_1.mobileDigitMatches)(searchDigits, item.pilgrimMobile) ||
            (0, mobile_search_util_1.mobileDigitMatches)(searchDigits, item.pilgrim.mobileNumber));
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
        const patterns = (0, mobile_search_util_1.buildMobileSearchPatterns)(mobile);
        if (patterns.length === 0) {
            throw new common_1.BadRequestException('شماره موبایل نامعتبر است');
        }
        const reservations = await this.prisma.reservation.findMany({
            where: {
                OR: patterns.flatMap((pattern) => [
                    { pilgrimMobile: { contains: pattern, mode: 'insensitive' } },
                    {
                        pilgrim: {
                            mobileNumber: { contains: pattern, mode: 'insensitive' },
                        },
                    },
                ]),
            },
            include: guestReservationTrackInclude,
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        const searchDigits = (0, mobile_search_util_1.normalizeMobileDigits)(mobile);
        const matched = reservations.filter((reservation) => (0, mobile_search_util_1.mobileDigitMatches)(searchDigits, reservation.pilgrimMobile) ||
            (0, mobile_search_util_1.mobileDigitMatches)(searchDigits, reservation.pilgrim.mobileNumber));
        if (matched.length === 0) {
            throw new common_1.NotFoundException('رزروی با این شماره موبایل یافت نشد');
        }
        return matched.slice(0, 2);
    }
    async findRecentByExactMobileForGuest(mobileNumber) {
        const mobile = mobileNumber.trim();
        if (!mobile) {
            throw new common_1.BadRequestException('شماره موبایل الزامی است');
        }
        if (!(0, mobile_search_util_1.isCompleteMobileNumber)(mobile)) {
            throw new common_1.BadRequestException('شماره موبایل باید به‌صورت کامل وارد شود');
        }
        const lookupVariants = (0, mobile_search_util_1.buildExactMobileLookupVariants)(mobile);
        if (lookupVariants.length === 0) {
            throw new common_1.BadRequestException('شماره موبایل نامعتبر است');
        }
        const reservations = await this.prisma.reservation.findMany({
            where: {
                OR: [
                    { pilgrimMobile: { in: lookupVariants } },
                    { pilgrim: { mobileNumber: { in: lookupVariants } } },
                ],
            },
            include: guestReservationTrackInclude,
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        const matched = reservations.filter((reservation) => (0, mobile_search_util_1.mobilesAreExactlyEqual)(mobile, reservation.pilgrimMobile) ||
            (0, mobile_search_util_1.mobilesAreExactlyEqual)(mobile, reservation.pilgrim.mobileNumber));
        if (matched.length === 0) {
            throw new common_1.NotFoundException('رزروی با این شماره موبایل یافت نشد');
        }
        return matched.slice(0, 2);
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
    async assertTrackingCodeAvailable(trackingCode) {
        const existing = await this.prisma.reservation.findUnique({
            where: { trackingCode },
            select: { id: true },
        });
        if (existing) {
            throw new common_1.BadRequestException('این کد رزرو قبلاً ثبت شده است');
        }
    }
    async createWithTrackingCode(data, options, include = reservationInclude) {
        (0, reservation_guest_count_util_1.assertHasGuestCount)(data.maleGuestCount, data.femaleGuestCount);
        const trimmedCustom = options?.customTrackingCode?.trim();
        if (trimmedCustom) {
            if (!options?.allowCustomTrackingCode) {
                throw new common_1.ForbiddenException('شما مجوز تعیین کد رزرو را ندارید');
            }
            if (trimmedCustom.length > 64) {
                throw new common_1.BadRequestException('کد رزرو حداکثر ۶۴ کاراکتر می‌تواند باشد');
            }
            await this.assertTrackingCodeAvailable(trimmedCustom);
            try {
                return await this.prisma.reservation.create({
                    data: {
                        ...data,
                        trackingCode: trimmedCustom,
                    },
                    include,
                });
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                    error.code === 'P2002') {
                    throw new common_1.BadRequestException('این کد رزرو قبلاً ثبت شده است');
                }
                throw error;
            }
        }
        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                const trackingCode = await (0, reservation_code_util_1.allocateNextReservationTrackingCode)(this.prisma);
                return await this.prisma.reservation.create({
                    data: {
                        ...data,
                        trackingCode,
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
                reservationDate: { lt: params.reservationEndDate },
                reservationEndDate: { gt: params.reservationDate },
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
            this.throwReservationConflict(conflict, true);
        }
        this.throwReservationConflict(conflict, false);
    }
    throwReservationConflict(conflict, exactDuplicate) {
        const conflictPayload = {
            trackingCode: conflict.trackingCode,
            mawkibName: conflict.mawkib?.name ?? null,
            reservationDate: (0, date_util_1.formatDateOnly)(conflict.reservationDate),
            reservationEndDate: (0, date_util_1.formatDateOnly)(conflict.reservationEndDate),
        };
        const message = exactDuplicate
            ? 'متاسفانه این رزرو با رزروهای قبلی شما در سامانه تداخل دارد'
            : `این زائر در بازه تاریخ انتخابی رزرو فعال دیگری دارد (کد: ${conflict.trackingCode}${conflict.mawkib?.name ? ` — ${conflict.mawkib.name}` : ''})`;
        throw new common_1.BadRequestException({
            message,
            error: 'ReservationConflict',
            conflict: conflictPayload,
        });
    }
    async create(dto, currentUser) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: dto.mawkibId },
        });
        if (!mawkib || mawkib.status !== client_1.MawkibStatus.Approved) {
            throw new common_1.BadRequestException('موکب یافت نشد یا تایید نشده است');
        }
        this.mawkibsService.assertOnlineReservationAllowed(mawkib, currentUser);
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
        const skipCapacity = dto.skipCapacityCheck === true && (isAdmin || isOwner);
        if (dto.skipCapacityCheck === true && !isAdmin && !isOwner) {
            throw new common_1.ForbiddenException('شما مجوز ثبت رزرو بدون بررسی ظرفیت را ندارید');
        }
        if (dto.trackingCode && !isAdmin && !isOwner) {
            throw new common_1.ForbiddenException('شما مجوز تعیین کد رزرو را ندارید');
        }
        if (!skipCapacity) {
            await this.mawkibsService.assertCapacityInRange(dto.mawkibId, dto.maleGuestCount, dto.femaleGuestCount, reservationDate, reservationEndDate);
        }
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
        const autoConfirmed = isAdmin || isOwner;
        const checkInOnConfirm = autoConfirmed
            ? this.resolveActualCheckInOnConfirm(mawkib, null)
            : undefined;
        const reservation = await this.createWithTrackingCode({
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
            status: autoConfirmed
                ? client_1.ReservationStatus.Confirmed
                : client_1.ReservationStatus.Pending,
            ...(autoConfirmed ? this.statusAuditFields(currentUser.id) : {}),
            ...(checkInOnConfirm ? { actualCheckInAt: checkInOnConfirm } : {}),
        }, {
            customTrackingCode: dto.trackingCode,
            allowCustomTrackingCode: isAdmin || isOwner,
        });
        await this.syncCheckInEventOnConfirm(reservation.id, checkInOnConfirm, currentUser.id);
        if (reservation.status === client_1.ReservationStatus.Confirmed) {
            await this.mawkibsService.syncInventoryOnReservationConfirmed(reservation);
        }
        await this.maybeGenerateMealPlans(reservation);
        return reservation;
    }
    async createGuest(dto) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: dto.mawkibId },
        });
        if (!mawkib || mawkib.status !== client_1.MawkibStatus.Approved) {
            throw new common_1.BadRequestException('موکب یافت نشد یا تایید نشده است');
        }
        this.mawkibsService.assertOnlineReservationAllowed(mawkib);
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
            nationalId: dto.nationalId,
            nationalIdCardImageUrl: dto.nationalIdCardImageUrl,
            gender: dto.gender,
            birthDate: dto.birthDate,
            country: dto.country,
            passportNumber: dto.passportNumber,
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
        const autoApproved = mawkib.autoApprovePilgrimReservations === true;
        const initialStatus = autoApproved
            ? client_1.ReservationStatus.Confirmed
            : client_1.ReservationStatus.Pending;
        const checkInOnConfirm = initialStatus === client_1.ReservationStatus.Confirmed
            ? this.resolveActualCheckInOnConfirm(mawkib, null)
            : undefined;
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
            travelOrigin: dto.travelOrigin?.trim() || undefined,
            companions: dto.companions?.trim() || undefined,
            status: initialStatus,
            ...(checkInOnConfirm ? { actualCheckInAt: checkInOnConfirm } : {}),
        }, undefined, {
            mawkib: {
                select: {
                    id: true,
                    name: true,
                    defaultCheckInTime: true,
                    defaultCheckOutTime: true,
                },
            },
        });
        await this.syncCheckInEventOnConfirm(reservation.id, checkInOnConfirm, pilgrim.id);
        if (reservation.status === client_1.ReservationStatus.Confirmed) {
            await this.mawkibsService.syncInventoryOnReservationConfirmed(reservation);
        }
        await this.maybeGenerateMealPlans(reservation);
        return {
            message: autoApproved
                ? 'رزرو شما با موفقیت ثبت و تأیید شد'
                : 'درخواست رزرو شما ثبت شد و پس از بررسی مدیریت، نتیجه اعلام خواهد شد',
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
        let checkInOnConfirm;
        if (dto.status === client_1.ReservationStatus.Confirmed &&
            reservation.status === client_1.ReservationStatus.Pending) {
            const mawkibSettings = await this.prisma.mawkib.findUnique({
                where: { id: reservation.mawkibId },
                select: { recordCheckInOnReservationConfirm: true },
            });
            if (mawkibSettings) {
                checkInOnConfirm = this.resolveActualCheckInOnConfirm(mawkibSettings, reservation.actualCheckInAt);
            }
        }
        const updated = await this.prisma.reservation.update({
            where: { id },
            data: {
                status: dto.status,
                ...this.statusAuditFields(currentUser.id),
                ...(checkInOnConfirm ? { actualCheckInAt: checkInOnConfirm } : {}),
            },
            include: reservationInclude,
        });
        await this.syncCheckInEventOnConfirm(updated.id, checkInOnConfirm, currentUser.id);
        if (dto.status === client_1.ReservationStatus.Confirmed &&
            reservation.status === client_1.ReservationStatus.Pending) {
            await this.mawkibsService.syncInventoryOnReservationConfirmed(updated);
        }
        return updated;
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
        this.assertConfirmedReservationStillActive(reservation);
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
        const isStaffCancel = isAdmin || isOwner;
        if (reservation.status === client_1.ReservationStatus.Confirmed) {
            await this.mawkibsService.syncInventoryOnReservationCancelled(reservation);
        }
        return this.prisma.reservation.update({
            where: { id },
            data: {
                status: client_1.ReservationStatus.Cancelled,
                cancellationNote: note,
                ...(isStaffCancel ? this.statusAuditFields(currentUser.id) : {}),
            },
            include: reservationInclude,
        });
    }
    async extend(sourceId, dto, currentUser) {
        const source = await this.findOne(sourceId);
        const isAdmin = currentUser.roles.includes(client_1.RoleName.Admin);
        const isOwner = currentUser.roles.includes(client_1.RoleName.MawkibOwner);
        const isPilgrimOnly = currentUser.roles.includes(client_1.RoleName.Pilgrim) && !isAdmin && !isOwner;
        if (source.status !== client_1.ReservationStatus.Confirmed &&
            source.status !== client_1.ReservationStatus.Completed) {
            throw new common_1.BadRequestException('فقط رزروهای تایید شده یا تکمیل‌شده قابل تمدید هستند');
        }
        if (isAdmin) {
        }
        else if (isOwner) {
            await this.mawkibsService.assertOwnerAccess(source.mawkibId, currentUser.id);
        }
        else if (isPilgrimOnly) {
            if (source.pilgrimUserId !== currentUser.id) {
                throw new common_1.ForbiddenException('فقط رزروهای خودتان را می‌توانید تمدید کنید');
            }
        }
        else {
            throw new common_1.ForbiddenException('شما مجوز تمدید این رزرو را ندارید');
        }
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: source.mawkibId },
        });
        if (!mawkib || mawkib.status !== client_1.MawkibStatus.Approved) {
            throw new common_1.BadRequestException('موکب یافت نشد یا تایید نشده است');
        }
        this.mawkibsService.assertOnlineReservationAllowed(mawkib, currentUser);
        const extensionStartStr = (0, reservation_extend_util_1.computeExtensionStartDate)(source.reservationEndDate ?? source.reservationDate);
        const extensionStart = (0, date_util_1.parseDateOnly)(extensionStartStr);
        let extensionEnd;
        if (isPilgrimOnly) {
            if (dto.reservationEndDate || dto.stayDays) {
                throw new common_1.BadRequestException('زائر نمی‌تواند بازه تمدید را به‌صورت دستی تنظیم کند');
            }
            extensionEnd = (0, date_util_1.parseDateOnly)((0, reservation_extend_util_1.defaultExtensionEndDate)(source.reservationEndDate, mawkib.defaultReservationDays));
        }
        else {
            if (dto.reservationEndDate) {
                extensionEnd = (0, date_util_1.parseDateOnly)(dto.reservationEndDate);
            }
            else if (dto.stayDays) {
                extensionEnd = (0, date_util_1.parseDateOnly)((0, reservation_extend_util_1.computeExtensionEndDate)(extensionStartStr, dto.stayDays));
            }
            else {
                extensionEnd = (0, date_util_1.parseDateOnly)((0, reservation_extend_util_1.defaultExtensionEndDate)(source.reservationEndDate, mawkib.defaultReservationDays));
            }
        }
        if (extensionEnd < extensionStart) {
            throw new common_1.BadRequestException('تاریخ پایان تمدید نمی‌تواند قبل از تاریخ شروع باشد');
        }
        await this.mawkibsService.assertReservationServiceStart(source.mawkibId, extensionStart);
        await this.mawkibsService.assertMaxReservationDays(source.mawkibId, extensionStart, extensionEnd);
        await this.mawkibsService.assertCapacityInRange(source.mawkibId, source.maleGuestCount, source.femaleGuestCount, extensionStart, extensionEnd);
        await this.assertNoConflictingReservation({
            pilgrimUserId: source.pilgrimUserId,
            mawkibId: source.mawkibId,
            reservationDate: extensionStart,
            reservationEndDate: extensionEnd,
            maleGuestCount: source.maleGuestCount,
            femaleGuestCount: source.femaleGuestCount,
            excludeReservationId: sourceId,
        });
        const plannedTimes = (0, reservation_occupancy_util_1.resolvePlannedTimes)({
            plannedCheckInTime: source.plannedCheckInTime ?? undefined,
            plannedCheckOutTime: source.plannedCheckOutTime ?? undefined,
        }, mawkib);
        const extensionNote = `تمدید رزرو ${source.trackingCode}`;
        const autoConfirmed = isAdmin || isOwner;
        const checkInOnConfirm = autoConfirmed
            ? this.resolveActualCheckInOnConfirm(mawkib, null)
            : undefined;
        const reservation = await this.createWithTrackingCode({
            mawkibId: source.mawkibId,
            pilgrimUserId: source.pilgrimUserId,
            reservedByUserId: currentUser.id,
            reservationDate: extensionStart,
            reservationEndDate: extensionEnd,
            plannedCheckInTime: plannedTimes.plannedCheckInTime,
            plannedCheckOutTime: plannedTimes.plannedCheckOutTime,
            maleGuestCount: source.maleGuestCount,
            femaleGuestCount: source.femaleGuestCount,
            pilgrimMobile: source.pilgrimMobile,
            description: extensionNote,
            companions: source.companions ?? undefined,
            travelOrigin: source.travelOrigin ?? undefined,
            status: autoConfirmed
                ? client_1.ReservationStatus.Confirmed
                : client_1.ReservationStatus.Pending,
            ...(autoConfirmed ? this.statusAuditFields(currentUser.id) : {}),
            ...(checkInOnConfirm ? { actualCheckInAt: checkInOnConfirm } : {}),
        });
        await this.syncCheckInEventOnConfirm(reservation.id, checkInOnConfirm, currentUser.id);
        if (reservation.status === client_1.ReservationStatus.Confirmed) {
            await this.mawkibsService.syncInventoryOnReservationConfirmed(reservation);
        }
        await this.maybeGenerateMealPlans(reservation);
        return reservation;
    }
    async remove(id) {
        const reservation = await this.findOne(id);
        if (reservation.status === client_1.ReservationStatus.Confirmed) {
            await this.mawkibsService.syncInventoryOnReservationCancelled(reservation);
        }
        await this.prisma.reservation.delete({ where: { id: reservation.id } });
        return { id, message: 'رزرو با موفقیت حذف شد' };
    }
    resolveActualCheckInOnConfirm(mawkib, actualCheckInAt) {
        if (mawkib.recordCheckInOnReservationConfirm === true &&
            !actualCheckInAt) {
            return new Date();
        }
        return undefined;
    }
    async syncCheckInEventOnConfirm(reservationId, checkInAt, userId) {
        if (!checkInAt)
            return;
        await this.reservationEventsService.syncEventFromLegacyAttendance(reservationId, client_1.ReservationEventType.CHECK_IN, checkInAt, userId);
    }
    assertConfirmedReservationStillActive(reservation) {
        if (reservation.status !== client_1.ReservationStatus.Confirmed)
            return;
        if ((0, date_util_1.parseDateOnly)(reservation.reservationEndDate) < (0, date_util_1.startOfAppDay)()) {
            throw new common_1.BadRequestException('تاریخ پایان اقامت این رزرو گذشته است؛ امکان لغو وجود ندارد. رزرو را تکمیل کنید یا از وظیفه تکمیل خودکار استفاده کنید.');
        }
    }
    extractAppTimeString(date) {
        const parts = new Intl.DateTimeFormat('en-GB', {
            timeZone: date_util_1.APP_TIMEZONE,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).formatToParts(date);
        const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
        const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
        return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    }
    resolveCheckoutEndDate(recordedAt) {
        return (0, date_util_1.parseDateOnly)((0, date_util_1.formatDateOnlyInAppTz)(recordedAt));
    }
    assertCheckoutEndDateValid(reservation, newEndDate) {
        const stayStart = (0, date_util_1.parseDateOnly)(reservation.reservationDate);
        const plannedEnd = (0, date_util_1.parseDateOnly)(reservation.reservationEndDate);
        if (newEndDate < stayStart) {
            throw new common_1.BadRequestException('تاریخ خروج نمی‌تواند قبل از شروع اقامت باشد');
        }
        if (newEndDate > plannedEnd) {
            throw new common_1.BadRequestException('تاریخ خروج نمی‌تواند بعد از پایان برنامه‌ریزی‌شده اقامت باشد');
        }
    }
    async performCheckOut(reservation, recordedAt, auditUserId) {
        if (!reservation.actualCheckInAt) {
            throw new common_1.BadRequestException('ابتدا باید ورود ثبت شود');
        }
        if (reservation.actualCheckOutAt ||
            reservation.status === client_1.ReservationStatus.Completed) {
            throw new common_1.BadRequestException('خروج این رزرو قبلاً ثبت شده است');
        }
        if (reservation.actualCheckInAt &&
            (0, date_util_1.isRecordedAtBeforeCheckInMinute)(recordedAt, reservation.actualCheckInAt)) {
            throw new common_1.BadRequestException('ساعت خروج نمی‌تواند قبل از ورود باشد');
        }
        const oldEndDate = reservation.reservationEndDate;
        const newEndDate = this.resolveCheckoutEndDate(recordedAt);
        this.assertCheckoutEndDateValid(reservation, newEndDate);
        await this.mawkibsService.syncInventoryOnEndDateChange({
            mawkibId: reservation.mawkibId,
            reservationDate: reservation.reservationDate,
            maleGuestCount: reservation.maleGuestCount,
            femaleGuestCount: reservation.femaleGuestCount,
        }, oldEndDate, newEndDate);
        return this.prisma.reservation.update({
            where: { id: reservation.id },
            data: {
                actualCheckOutAt: recordedAt,
                reservationEndDate: newEndDate,
                plannedCheckOutTime: this.extractAppTimeString(recordedAt),
                status: client_1.ReservationStatus.Completed,
                ...(auditUserId ? this.statusAuditFields(auditUserId) : {}),
            },
            include: reservationInclude,
        }).then(async (updated) => {
            if (auditUserId) {
                await this.reservationEventsService.syncEventFromLegacyAttendance(reservation.id, client_1.ReservationEventType.EARLY_CHECKOUT, recordedAt, auditUserId);
            }
            const mealPlanResult = await this.mealPlansService.cancelMealPlansAfterCheckoutDate(reservation.id, newEndDate);
            return {
                ...updated,
                mealPlanNotice: mealPlanResult.notice,
            };
        });
    }
    async performCheckOutUpdate(reservation, recordedAt) {
        if (!reservation.actualCheckInAt) {
            throw new common_1.BadRequestException('ابتدا باید ورود ثبت شود');
        }
        if (reservation.actualCheckInAt &&
            (0, date_util_1.isRecordedAtBeforeCheckInMinute)(recordedAt, reservation.actualCheckInAt)) {
            throw new common_1.BadRequestException('ساعت خروج نمی‌تواند قبل از ورود باشد');
        }
        const oldEndDate = reservation.reservationEndDate;
        const newEndDate = this.resolveCheckoutEndDate(recordedAt);
        if (newEndDate < (0, date_util_1.parseDateOnly)(reservation.reservationDate)) {
            throw new common_1.BadRequestException('تاریخ خروج نمی‌تواند قبل از شروع اقامت باشد');
        }
        await this.mawkibsService.syncInventoryOnEndDateChange({
            mawkibId: reservation.mawkibId,
            reservationDate: reservation.reservationDate,
            maleGuestCount: reservation.maleGuestCount,
            femaleGuestCount: reservation.femaleGuestCount,
        }, oldEndDate, newEndDate);
        return this.prisma.reservation.update({
            where: { id: reservation.id },
            data: {
                actualCheckOutAt: recordedAt,
                reservationEndDate: newEndDate,
                plannedCheckOutTime: this.extractAppTimeString(recordedAt),
            },
            include: reservationInclude,
        });
    }
    assertCanRecordAttendance(reservation) {
        if (reservation.status === client_1.ReservationStatus.Cancelled) {
            throw new common_1.BadRequestException('رزرو لغوشده قابل ثبت ورود/خروج نیست');
        }
        if (reservation.status === client_1.ReservationStatus.Pending) {
            throw new common_1.BadRequestException('تا زمان تایید رزرو، امکان ثبت ورود یا خروج وجود ندارد');
        }
    }
    assertCanEditAttendance(reservation) {
        if (reservation.status === client_1.ReservationStatus.Cancelled) {
            throw new common_1.BadRequestException('رزرو لغوشده قابل ویرایش ورود/خروج نیست');
        }
        if (reservation.status === client_1.ReservationStatus.Pending) {
            throw new common_1.BadRequestException('تا زمان تایید رزرو، امکان ویرایش ورود یا خروج وجود ندارد');
        }
    }
    resolveRecordedAt(recordedAt) {
        if (!recordedAt)
            return new Date();
        const date = new Date(recordedAt);
        if (Number.isNaN(date.getTime())) {
            throw new common_1.BadRequestException('زمان ثبت نامعتبر است');
        }
        return date;
    }
    async assertUniqueAttendanceSecondForReservation(reservationId, reservation, recordedAt) {
        const existingEvents = await this.prisma.reservationEvent.findMany({
            where: { reservationId },
            select: { createdAt: true },
        });
        (0, reservation_event_util_1.assertUniqueAttendanceSecond)(recordedAt, reservation, existingEvents);
    }
    async checkIn(id, currentUser, dto) {
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
        if (reservation.status === client_1.ReservationStatus.Completed) {
            throw new common_1.BadRequestException('رزرو تکمیل‌شده است');
        }
        if (reservation.actualCheckInAt) {
            throw new common_1.BadRequestException('ورود این رزرو قبلاً ثبت شده است');
        }
        if (reservation.actualCheckOutAt) {
            throw new common_1.BadRequestException('این رزرو قبلاً خروج خورده است');
        }
        const recordedAt = this.resolveRecordedAt(dto?.recordedAt);
        await this.assertUniqueAttendanceSecondForReservation(id, reservation, recordedAt);
        const updated = await this.prisma.reservation.update({
            where: { id },
            data: { actualCheckInAt: recordedAt },
            include: reservationInclude,
        });
        await this.reservationEventsService.syncEventFromLegacyAttendance(id, client_1.ReservationEventType.CHECK_IN, recordedAt, currentUser.id);
        return updated;
    }
    async checkOut(id, currentUser, dto) {
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
        if (reservation.status === client_1.ReservationStatus.Completed) {
            throw new common_1.BadRequestException('رزرو تکمیل‌شده است');
        }
        if (!reservation.actualCheckInAt) {
            throw new common_1.BadRequestException('ابتدا باید ورود ثبت شود');
        }
        if (reservation.actualCheckOutAt) {
            throw new common_1.BadRequestException('خروج این رزرو قبلاً ثبت شده است');
        }
        const recordedAt = this.resolveRecordedAt(dto?.recordedAt);
        if (reservation.actualCheckInAt &&
            (0, date_util_1.isRecordedAtBeforeCheckInMinute)(recordedAt, reservation.actualCheckInAt)) {
            throw new common_1.BadRequestException('ساعت خروج نمی‌تواند قبل از ورود باشد');
        }
        await this.assertUniqueAttendanceSecondForReservation(id, reservation, recordedAt);
        const isStaff = isAdmin || isOwner;
        return this.performCheckOut(reservation, recordedAt, isStaff ? currentUser.id : undefined);
    }
    async assertCanManageAttendance(reservation, currentUser) {
        const isAdmin = currentUser.roles.includes(client_1.RoleName.Admin);
        const isOwner = currentUser.roles.includes(client_1.RoleName.MawkibOwner);
        if (!isAdmin && !isOwner) {
            throw new common_1.ForbiddenException('فقط مدیر یا مسئول موکب می‌تواند ساعت ورود/خروج را ویرایش کند');
        }
        if (isOwner && !isAdmin) {
            await this.mawkibsService.assertOwnerAccess(reservation.mawkibId, currentUser.id);
        }
    }
    async updateCheckIn(id, currentUser, dto) {
        const reservation = await this.findOneForUser(id, currentUser);
        await this.assertCanManageAttendance(reservation, currentUser);
        this.assertCanEditAttendance(reservation);
        if (!reservation.actualCheckInAt) {
            throw new common_1.BadRequestException('ورودی برای ویرایش ثبت نشده است');
        }
        const recordedAt = this.resolveRecordedAt(dto.recordedAt);
        if (reservation.actualCheckOutAt &&
            recordedAt > reservation.actualCheckOutAt) {
            throw new common_1.BadRequestException('ساعت ورود نمی‌تواند بعد از خروج باشد');
        }
        return this.prisma.reservation.update({
            where: { id },
            data: { actualCheckInAt: recordedAt },
            include: reservationInclude,
        });
    }
    async updateCheckOut(id, currentUser, dto) {
        const reservation = await this.findOneForUser(id, currentUser);
        await this.assertCanManageAttendance(reservation, currentUser);
        this.assertCanEditAttendance(reservation);
        if (!reservation.actualCheckInAt) {
            throw new common_1.BadRequestException('ابتدا باید ورود ثبت شود');
        }
        if (!reservation.actualCheckOutAt) {
            throw new common_1.BadRequestException('خروجی برای ویرایش ثبت نشده است');
        }
        const recordedAt = this.resolveRecordedAt(dto.recordedAt);
        if (reservation.actualCheckInAt &&
            (0, date_util_1.isRecordedAtBeforeCheckInMinute)(recordedAt, reservation.actualCheckInAt)) {
            throw new common_1.BadRequestException('ساعت خروج نمی‌تواند قبل از ورود باشد');
        }
        return this.performCheckOutUpdate(reservation, recordedAt);
    }
    async checkInGuest(trackingCode, dto) {
        const reservation = await this.findByTrackingCode(trackingCode);
        this.assertCanRecordAttendance(reservation);
        if (reservation.status === client_1.ReservationStatus.Completed) {
            throw new common_1.BadRequestException('رزرو تکمیل‌شده است');
        }
        if (reservation.actualCheckInAt) {
            throw new common_1.BadRequestException('ورود این رزرو قبلاً ثبت شده است');
        }
        if (reservation.actualCheckOutAt) {
            throw new common_1.BadRequestException('این رزرو قبلاً خروج خورده است');
        }
        const recordedAt = this.resolveRecordedAt(dto?.recordedAt);
        await this.assertUniqueAttendanceSecondForReservation(reservation.id, reservation, recordedAt);
        const updated = await this.prisma.reservation.update({
            where: { id: reservation.id },
            data: { actualCheckInAt: recordedAt },
            include: reservationInclude,
        });
        await this.reservationEventsService.syncEventFromLegacyAttendance(reservation.id, client_1.ReservationEventType.CHECK_IN, recordedAt, reservation.pilgrimUserId);
        return updated;
    }
    async checkOutGuest(trackingCode, dto) {
        const reservation = await this.findByTrackingCode(trackingCode);
        this.assertCanRecordAttendance(reservation);
        if (reservation.status === client_1.ReservationStatus.Completed) {
            throw new common_1.BadRequestException('رزرو تکمیل‌شده است');
        }
        if (!reservation.actualCheckInAt) {
            throw new common_1.BadRequestException('ابتدا باید ورود ثبت شود');
        }
        if (reservation.actualCheckOutAt) {
            throw new common_1.BadRequestException('خروج این رزرو قبلاً ثبت شده است');
        }
        const recordedAt = this.resolveRecordedAt(dto?.recordedAt);
        if (reservation.actualCheckInAt &&
            (0, date_util_1.isRecordedAtBeforeCheckInMinute)(recordedAt, reservation.actualCheckInAt)) {
            throw new common_1.BadRequestException('ساعت خروج نمی‌تواند قبل از ورود باشد');
        }
        await this.assertUniqueAttendanceSecondForReservation(reservation.id, reservation, recordedAt);
        return this.performCheckOut(reservation, recordedAt, reservation.pilgrimUserId);
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
    assertReservationEligibleForDeliveredItems(reservation) {
        if (reservation.status !== client_1.ReservationStatus.Confirmed &&
            reservation.status !== client_1.ReservationStatus.Completed) {
            throw new common_1.BadRequestException('فقط برای رزروهای تایید شده یا تکمیل شده می‌توان کالا ثبت کرد');
        }
    }
    async assertCanManageDeliveredItems(reservation, currentUser) {
        const isAdmin = currentUser.roles.includes(client_1.RoleName.Admin);
        const isOwner = currentUser.roles.includes(client_1.RoleName.MawkibOwner);
        if (!isAdmin && !isOwner) {
            throw new common_1.ForbiddenException('فقط مدیر یا مسئول موکب می‌تواند کالاهای تحویلی را مدیریت کند');
        }
        if (isOwner && !isAdmin) {
            await this.mawkibsService.assertOwnerAccess(reservation.mawkibId, currentUser.id);
        }
        this.assertReservationEligibleForDeliveredItems(reservation);
    }
    async createDeliveredItem(reservationId, dto, currentUser) {
        const reservation = await this.findOneForUser(reservationId, currentUser);
        await this.assertCanManageDeliveredItems(reservation, currentUser);
        await this.prisma.reservationDeliveredItem.create({
            data: {
                reservationId,
                itemName: dto.itemName.trim(),
                quantity: dto.quantity,
                description: dto.description?.trim() || null,
                status: client_1.ReservationDeliveredItemStatus.DeliveredToGuest,
                recordedByUserId: currentUser.id,
            },
        });
        return this.findOne(reservationId);
    }
    async updateDeliveredItem(reservationId, itemId, dto, currentUser) {
        const reservation = await this.findOneForUser(reservationId, currentUser);
        await this.assertCanManageDeliveredItems(reservation, currentUser);
        const item = await this.prisma.reservationDeliveredItem.findFirst({
            where: { id: itemId, reservationId },
        });
        if (!item) {
            throw new common_1.NotFoundException('رکورد کالا یافت نشد');
        }
        if (item.status !== client_1.ReservationDeliveredItemStatus.DeliveredToGuest) {
            throw new common_1.BadRequestException('فقط کالاهای تحویل‌داده‌شده قابل ویرایش هستند');
        }
        await this.prisma.reservationDeliveredItem.update({
            where: { id: itemId },
            data: {
                itemName: dto.itemName.trim(),
                quantity: dto.quantity,
                description: dto.description?.trim() || null,
            },
        });
        return this.findOne(reservationId);
    }
    async receiveDeliveredItem(reservationId, itemId, currentUser) {
        const reservation = await this.findOneForUser(reservationId, currentUser);
        await this.assertCanManageDeliveredItems(reservation, currentUser);
        const item = await this.prisma.reservationDeliveredItem.findFirst({
            where: { id: itemId, reservationId },
        });
        if (!item) {
            throw new common_1.NotFoundException('رکورد کالا یافت نشد');
        }
        if (item.status !== client_1.ReservationDeliveredItemStatus.DeliveredToGuest) {
            throw new common_1.BadRequestException('این کالا قبلاً تحویل گرفته شده است');
        }
        await this.prisma.reservationDeliveredItem.update({
            where: { id: itemId },
            data: {
                status: client_1.ReservationDeliveredItemStatus.ReceivedFromGuest,
                receivedAt: new Date(),
            },
        });
        return this.findOne(reservationId);
    }
    async removeDeliveredItem(reservationId, itemId, currentUser) {
        const reservation = await this.findOneForUser(reservationId, currentUser);
        await this.assertCanManageDeliveredItems(reservation, currentUser);
        const item = await this.prisma.reservationDeliveredItem.findFirst({
            where: { id: itemId, reservationId },
        });
        if (!item) {
            throw new common_1.NotFoundException('رکورد کالا یافت نشد');
        }
        await this.prisma.reservationDeliveredItem.delete({
            where: { id: itemId },
        });
        return this.findOne(reservationId);
    }
    async getAttendanceRoster(kind, user, mawkibId) {
        const isAdmin = user.roles.includes(client_1.RoleName.Admin);
        const isOwner = user.roles.includes(client_1.RoleName.MawkibOwner);
        if (!isAdmin && !isOwner) {
            throw new common_1.ForbiddenException('دسترسی مجاز نیست');
        }
        const today = (0, date_util_1.startOfAppDay)();
        const presenceFilter = kind === attendance_roster_dto_1.AttendanceRosterKind.ABSENT
            ? {
                in: [
                    client_1.ReservationPresenceState.NOT_ARRIVED,
                    client_1.ReservationPresenceState.TEMPORARILY_OUT,
                ],
            }
            : client_1.ReservationPresenceState.PRESENT;
        const mawkibWhere = mawkibId
            ? isAdmin
                ? { id: mawkibId }
                : { id: mawkibId, ownerUserId: user.id }
            : isAdmin
                ? undefined
                : { ownerUserId: user.id };
        const reservations = await this.prisma.reservation.findMany({
            where: {
                status: client_1.ReservationStatus.Confirmed,
                presenceState: presenceFilter,
                reservationDate: { lte: today },
                reservationEndDate: { gte: today },
                ...(mawkibWhere ? { mawkib: mawkibWhere } : {}),
            },
            select: {
                id: true,
                pilgrimMobile: true,
                actualCheckInAt: true,
                presenceState: true,
                reservationDate: true,
                plannedCheckInTime: true,
                createdAt: true,
                pilgrim: {
                    select: {
                        fullName: true,
                        nationalId: true,
                        mobileNumber: true,
                    },
                },
                events: {
                    where: {
                        eventType: {
                            in: [
                                client_1.ReservationEventType.CHECK_IN,
                                client_1.ReservationEventType.TEMP_IN,
                                client_1.ReservationEventType.TEMP_OUT,
                            ],
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    select: { eventType: true, createdAt: true },
                },
            },
        });
        const now = Date.now();
        const rows = reservations
            .map((reservation) => {
            const events = reservation.events;
            if (kind === attendance_roster_dto_1.AttendanceRosterKind.ABSENT) {
                const absentContext = (0, attendance_roster_util_1.resolveAbsentRosterContext)(reservation, events);
                if (!absentContext) {
                    return null;
                }
                const referenceAt = absentContext.referenceAt;
                const durationMs = referenceAt
                    ? Math.max(0, now - new Date(referenceAt).getTime())
                    : 0;
                return {
                    reservationId: reservation.id,
                    fullName: reservation.pilgrim.fullName,
                    mobile: reservation.pilgrimMobile?.trim() ||
                        reservation.pilgrim.mobileNumber?.trim() ||
                        '',
                    nationalId: reservation.pilgrim.nationalId?.trim() || null,
                    durationMs,
                    lastExitAt: absentContext.lastExitAt
                        ? new Date(absentContext.lastExitAt).toISOString()
                        : null,
                    absenceKind: absentContext.absenceKind,
                    registerEventType: absentContext.registerEventType,
                };
            }
            let referenceAt = events.find((e) => e.eventType === client_1.ReservationEventType.TEMP_IN ||
                e.eventType === client_1.ReservationEventType.CHECK_IN)?.createdAt ??
                reservation.actualCheckInAt ??
                null;
            const durationMs = referenceAt
                ? Math.max(0, now - new Date(referenceAt).getTime())
                : 0;
            return {
                reservationId: reservation.id,
                fullName: reservation.pilgrim.fullName,
                mobile: reservation.pilgrimMobile?.trim() ||
                    reservation.pilgrim.mobileNumber?.trim() ||
                    '',
                nationalId: reservation.pilgrim.nationalId?.trim() || null,
                durationMs,
                lastExitAt: null,
                absenceKind: null,
                registerEventType: null,
            };
        })
            .filter((row) => row != null)
            .sort((a, b) => b.durationMs - a.durationMs);
        return {
            kind,
            generatedAt: new Date().toISOString(),
            mawkibId: mawkibId ?? null,
            rows,
        };
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mawkibs_service_1.MawkibsService,
        users_service_1.UsersService,
        reservation_events_service_1.ReservationEventsService,
        meal_plans_service_1.MealPlansService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map