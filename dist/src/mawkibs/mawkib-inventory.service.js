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
var MawkibInventoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MawkibInventoryService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const date_util_1 = require("../common/utils/date.util");
const reservation_occupancy_util_1 = require("../reservations/reservation-occupancy.util");
const mawkib_inventory_constants_1 = require("./mawkib-inventory.constants");
function agentDebugLog(location, message, data, hypothesisId) {
    fetch('http://127.0.0.1:7929/ingest/64824c4b-ac44-41b9-87b8-d1ea5f1d3aa4', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '06086f',
        },
        body: JSON.stringify({
            sessionId: '06086f',
            location,
            message,
            data,
            hypothesisId,
            timestamp: Date.now(),
        }),
    }).catch(() => { });
}
let MawkibInventoryService = MawkibInventoryService_1 = class MawkibInventoryService {
    prisma;
    logger = new common_1.Logger(MawkibInventoryService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        void this.reconcileStaleInventoriesOnStartup();
        void this.reconcileOccupancyLogicRevision();
    }
    occupancyRevisionMarkerPath() {
        return (0, path_1.join)(process.cwd(), '.cache', 'inventory-occupancy-revision');
    }
    readStoredOccupancyRevision() {
        const path = this.occupancyRevisionMarkerPath();
        if (!(0, fs_1.existsSync)(path))
            return 0;
        const parsed = Number.parseInt((0, fs_1.readFileSync)(path, 'utf8').trim(), 10);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    writeStoredOccupancyRevision(revision) {
        const path = this.occupancyRevisionMarkerPath();
        (0, fs_1.mkdirSync)((0, path_1.join)(process.cwd(), '.cache'), { recursive: true });
        (0, fs_1.writeFileSync)(path, String(revision), 'utf8');
    }
    async reconcileOccupancyLogicRevision() {
        if (this.readStoredOccupancyRevision() >= mawkib_inventory_constants_1.MAWKIB_INVENTORY_OCCUPANCY_REVISION) {
            return;
        }
        try {
            const mawkibs = await this.prisma.mawkib.findMany({ select: { id: true } });
            let rebuilt = 0;
            for (const mawkib of mawkibs) {
                const confirmedCount = await this.prisma.reservation.count({
                    where: { mawkibId: mawkib.id, status: client_1.ReservationStatus.Confirmed },
                });
                if (confirmedCount === 0)
                    continue;
                await this.rebuildMawkibInventory(mawkib.id);
                rebuilt += 1;
            }
            this.writeStoredOccupancyRevision(mawkib_inventory_constants_1.MAWKIB_INVENTORY_OCCUPANCY_REVISION);
            if (rebuilt > 0) {
                this.logger.log(`Rebuilt inventory for ${rebuilt} mawkib(s) after occupancy logic revision ${mawkib_inventory_constants_1.MAWKIB_INVENTORY_OCCUPANCY_REVISION}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to rebuild inventory after occupancy logic change', error);
        }
    }
    async reconcileStaleInventoriesOnStartup() {
        try {
            const mawkibs = await this.prisma.mawkib.findMany({ select: { id: true } });
            let rebuilt = 0;
            for (const mawkib of mawkibs) {
                if (await this.isInventoryStale(mawkib.id)) {
                    await this.rebuildMawkibInventory(mawkib.id);
                    rebuilt += 1;
                }
            }
            if (rebuilt > 0) {
                this.logger.log(`Rebuilt inventory for ${rebuilt} mawkib(s) on startup`);
            }
        }
        catch (error) {
            this.logger.error('Failed to reconcile mawkib inventory on startup', error);
        }
    }
    async isInventoryStale(mawkibId) {
        const confirmedCount = await this.prisma.reservation.count({
            where: { mawkibId, status: client_1.ReservationStatus.Confirmed },
        });
        if (confirmedCount === 0)
            return false;
        const occupiedRows = await this.prisma.mawkibDailyInventory.count({
            where: {
                mawkibId,
                OR: [{ reservedMale: { gt: 0 } }, { reservedFemale: { gt: 0 } }],
            },
        });
        return occupiedRows === 0;
    }
    getHorizonMeta(fromDate = (0, date_util_1.startOfAppDay)()) {
        const minDate = (0, date_util_1.parseDateOnly)(fromDate);
        const maxDate = (0, date_util_1.addDays)(minDate, mawkib_inventory_constants_1.MAWKIB_INVENTORY_HORIZON_DAYS - 1);
        return {
            horizonDays: mawkib_inventory_constants_1.MAWKIB_INVENTORY_HORIZON_DAYS,
            minDate: (0, date_util_1.formatDateOnly)(minDate),
            maxDate: (0, date_util_1.formatDateOnly)(maxDate),
        };
    }
    assertDateRangeWithinHorizon(startDate, endDate) {
        const start = (0, date_util_1.parseDateOnly)(startDate);
        const end = (0, date_util_1.parseDateOnly)(endDate);
        const horizon = this.getHorizonMeta();
        if (end < start) {
            throw new common_1.BadRequestException('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد');
        }
        if (start < (0, date_util_1.parseDateOnly)(horizon.minDate)) {
            throw new common_1.BadRequestException(`تاریخ شروع نمی‌تواند قبل از امروز باشد. بازه مجاز: ${horizon.minDate} تا ${horizon.maxDate}`);
        }
        if (end > (0, date_util_1.parseDateOnly)(horizon.maxDate)) {
            throw new common_1.BadRequestException(`بازه درخواستی از محدوده ${horizon.horizonDays} روز آینده فراتر می‌رود. آخرین تاریخ مجاز: ${horizon.maxDate}`);
        }
    }
    assertDateRangeForMawkib(startDate, endDate, serviceStartDate, serviceEndDate) {
        const start = (0, date_util_1.parseDateOnly)(startDate);
        const end = (0, date_util_1.parseDateOnly)(endDate);
        if (end < start) {
            throw new common_1.BadRequestException('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد');
        }
        if (serviceStartDate && serviceEndDate) {
            const svcStart = (0, date_util_1.parseDateOnly)(serviceStartDate);
            const svcEnd = (0, date_util_1.parseDateOnly)(serviceEndDate);
            if (start < svcStart || end > svcEnd) {
                throw new common_1.BadRequestException(`بازه درخواستی باید در محدوده ارائه خدمت موکب باشد: ${(0, date_util_1.formatDateOnly)(svcStart)} تا ${(0, date_util_1.formatDateOnly)(svcEnd)}`);
            }
            return;
        }
        this.assertDateRangeWithinHorizon(startDate, endDate);
    }
    async ensureInitialized(mawkibId) {
        const count = await this.prisma.mawkibDailyInventory.count({
            where: { mawkibId },
        });
        const stale = count === 0 ? false : await this.isInventoryStale(mawkibId);
        agentDebugLog('mawkib-inventory.service.ts:ensureInitialized', 'ensureInitialized check', { mawkibId, rowCount: count, isStale: stale, willRebuild: count === 0 || stale }, 'H2');
        if (count === 0 || stale) {
            await this.rebuildMawkibInventory(mawkibId);
        }
    }
    async ensureDayRows(mawkibId, startDate, endDate) {
        const days = (0, date_util_1.eachDateInRange)(startDate, endDate);
        for (const day of days) {
            await this.prisma.mawkibDailyInventory.upsert({
                where: {
                    mawkibId_date: { mawkibId, date: day },
                },
                create: {
                    mawkibId,
                    date: day,
                    reservedMale: 0,
                    reservedFemale: 0,
                },
                update: {},
            });
        }
    }
    async seedHorizonForMawkib(mawkibId) {
        const horizon = this.getHorizonMeta();
        await this.ensureDayRows(mawkibId, (0, date_util_1.parseDateOnly)(horizon.minDate), (0, date_util_1.parseDateOnly)(horizon.maxDate));
    }
    aggregateOccupancyByDay(reservations, dayFilter) {
        const counts = new Map();
        for (const reservation of reservations) {
            for (const day of (0, reservation_occupancy_util_1.reservationOccupiedDays)(reservation)) {
                const key = (0, date_util_1.formatDateOnly)(day);
                if (dayFilter && !dayFilter.has(key))
                    continue;
                const entry = counts.get(key) ?? { male: 0, female: 0 };
                entry.male += reservation.maleGuestCount;
                entry.female += reservation.femaleGuestCount;
                counts.set(key, entry);
            }
        }
        return counts;
    }
    async applyAggregatedCountsToDays(tx, mawkibId, counts) {
        for (const [dateKey, occupancy] of counts) {
            const day = (0, date_util_1.parseDateOnly)(dateKey);
            await tx.mawkibDailyInventory.upsert({
                where: {
                    mawkibId_date: { mawkibId, date: day },
                },
                create: {
                    mawkibId,
                    date: day,
                    reservedMale: occupancy.male,
                    reservedFemale: occupancy.female,
                },
                update: {
                    reservedMale: occupancy.male,
                    reservedFemale: occupancy.female,
                },
            });
        }
    }
    async applyDeltaToDays(tx, mawkibId, days, maleGuestCount, femaleGuestCount, delta) {
        for (const day of days) {
            const row = await tx.mawkibDailyInventory.upsert({
                where: {
                    mawkibId_date: { mawkibId, date: day },
                },
                create: {
                    mawkibId,
                    date: day,
                    reservedMale: Math.max(0, delta * maleGuestCount),
                    reservedFemale: Math.max(0, delta * femaleGuestCount),
                },
                update: {
                    reservedMale: { increment: delta * maleGuestCount },
                    reservedFemale: { increment: delta * femaleGuestCount },
                },
            });
            if (row.reservedMale < 0 || row.reservedFemale < 0) {
                await tx.mawkibDailyInventory.update({
                    where: { id: row.id },
                    data: {
                        reservedMale: Math.max(0, row.reservedMale),
                        reservedFemale: Math.max(0, row.reservedFemale),
                    },
                });
            }
        }
    }
    async applyReservationOccupancy(reservation, delta) {
        const days = (0, reservation_occupancy_util_1.reservationOccupiedDays)(reservation);
        if (days.length === 0) {
            if (delta === 1) {
                throw new common_1.BadRequestException('بازه تاریخ رزرو برای به‌روزرسانی ظرفیت معتبر نیست');
            }
            return;
        }
        await this.ensureDayRows(reservation.mawkibId, days[0], days[days.length - 1]);
        await this.prisma.$transaction(async (tx) => {
            await this.applyDeltaToDays(tx, reservation.mawkibId, days, reservation.maleGuestCount, reservation.femaleGuestCount, delta);
        });
    }
    async applyEndDateChange(reservation, previousEndDate, newEndDate) {
        const { released, occupied } = (0, reservation_occupancy_util_1.occupancyDaysDeltaOnEndDateChange)(reservation.reservationDate, previousEndDate, newEndDate);
        if (released.length === 0 && occupied.length === 0)
            return;
        const allDays = [...released, ...occupied];
        await this.ensureDayRows(reservation.mawkibId, allDays[0], allDays[allDays.length - 1]);
        await this.prisma.$transaction(async (tx) => {
            if (released.length > 0) {
                await this.applyDeltaToDays(tx, reservation.mawkibId, released, reservation.maleGuestCount, reservation.femaleGuestCount, -1);
            }
            if (occupied.length > 0) {
                await this.applyDeltaToDays(tx, reservation.mawkibId, occupied, reservation.maleGuestCount, reservation.femaleGuestCount, 1);
            }
        });
    }
    async rebuildMawkibInventory(mawkibId) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: mawkibId },
            select: { id: true },
        });
        if (!mawkib) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        const horizon = this.getHorizonMeta();
        const rangeStart = (0, date_util_1.parseDateOnly)(horizon.minDate);
        const rangeEnd = (0, date_util_1.parseDateOnly)(horizon.maxDate);
        await this.ensureDayRows(mawkibId, rangeStart, rangeEnd);
        await this.prisma.mawkibDailyInventory.updateMany({
            where: {
                mawkibId,
                date: { gte: rangeStart, lte: rangeEnd },
            },
            data: { reservedMale: 0, reservedFemale: 0 },
        });
        const confirmed = await this.prisma.reservation.findMany({
            where: {
                mawkibId,
                status: client_1.ReservationStatus.Confirmed,
            },
            select: {
                mawkibId: true,
                reservationDate: true,
                reservationEndDate: true,
                maleGuestCount: true,
                femaleGuestCount: true,
            },
        });
        let estimatedUpserts = 0;
        for (const reservation of confirmed) {
            estimatedUpserts += (0, reservation_occupancy_util_1.reservationOccupiedDays)(reservation).length;
        }
        const horizonDayKeys = new Set((0, date_util_1.eachDateInRange)(rangeStart, rangeEnd).map((day) => (0, date_util_1.formatDateOnly)(day)));
        const aggregated = this.aggregateOccupancyByDay(confirmed, horizonDayKeys);
        const aggregatedUpserts = aggregated.size;
        agentDebugLog('mawkib-inventory.service.ts:rebuildMawkibInventory', 'rebuildMawkibInventory before transaction', {
            mawkibId,
            confirmedCount: confirmed.length,
            horizonDays: horizonDayKeys.size,
            estimatedUpserts,
            aggregatedUpserts,
        }, 'H1');
        const txStartedAt = Date.now();
        try {
            await this.prisma.$transaction(async (tx) => {
                await this.applyAggregatedCountsToDays(tx, mawkibId, aggregated);
            }, { timeout: mawkib_inventory_constants_1.MAWKIB_INVENTORY_REBUILD_TX_TIMEOUT_MS });
        }
        catch (error) {
            agentDebugLog('mawkib-inventory.service.ts:rebuildMawkibInventory', 'rebuildMawkibInventory transaction failed', {
                mawkibId,
                elapsedMs: Date.now() - txStartedAt,
                estimatedUpserts,
                aggregatedUpserts,
                errorCode: error.code ?? 'unknown',
            }, 'H1');
            throw error;
        }
        agentDebugLog('mawkib-inventory.service.ts:rebuildMawkibInventory', 'rebuildMawkibInventory transaction completed', {
            mawkibId,
            elapsedMs: Date.now() - txStartedAt,
            estimatedUpserts,
            aggregatedUpserts,
        }, 'H1');
    }
    async rebuildMawkibInventoryInRange(mawkibId, startDate, endDate) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: mawkibId },
            select: {
                id: true,
                serviceStartDate: true,
                serviceEndDate: true,
            },
        });
        if (!mawkib) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        this.assertDateRangeForMawkib(startDate, endDate, mawkib.serviceStartDate, mawkib.serviceEndDate);
        const rangeStart = (0, date_util_1.parseDateOnly)(startDate);
        const rangeEnd = (0, date_util_1.parseDateOnly)(endDate);
        const rangeDayKeys = new Set((0, date_util_1.eachDateInRange)(rangeStart, rangeEnd).map((day) => (0, date_util_1.formatDateOnly)(day)));
        await this.ensureDayRows(mawkibId, rangeStart, rangeEnd);
        await this.prisma.mawkibDailyInventory.updateMany({
            where: {
                mawkibId,
                date: { gte: rangeStart, lte: rangeEnd },
            },
            data: { reservedMale: 0, reservedFemale: 0 },
        });
        const confirmed = await this.prisma.reservation.findMany({
            where: {
                mawkibId,
                status: client_1.ReservationStatus.Confirmed,
            },
            select: {
                mawkibId: true,
                reservationDate: true,
                reservationEndDate: true,
                maleGuestCount: true,
                femaleGuestCount: true,
            },
        });
        let reservationsProcessed = 0;
        let estimatedUpserts = 0;
        const overlappingReservations = [];
        for (const reservation of confirmed) {
            if (!(0, reservation_occupancy_util_1.reservationOverlapsDateRange)(reservation, rangeStart, rangeEnd)) {
                continue;
            }
            const days = (0, reservation_occupancy_util_1.reservationOccupiedDays)(reservation).filter((day) => rangeDayKeys.has((0, date_util_1.formatDateOnly)(day)));
            if (days.length === 0)
                continue;
            reservationsProcessed += 1;
            estimatedUpserts += days.length;
            overlappingReservations.push(reservation);
        }
        const aggregated = this.aggregateOccupancyByDay(overlappingReservations, rangeDayKeys);
        const aggregatedUpserts = aggregated.size;
        agentDebugLog('mawkib-inventory.service.ts:rebuildMawkibInventoryInRange', 'rebuildMawkibInventoryInRange before transaction', {
            mawkibId,
            rangeDays: rangeDayKeys.size,
            confirmedCount: confirmed.length,
            reservationsProcessed,
            estimatedUpserts,
            aggregatedUpserts,
        }, 'H4');
        const txStartedAt = Date.now();
        try {
            await this.prisma.$transaction(async (tx) => {
                await this.applyAggregatedCountsToDays(tx, mawkibId, aggregated);
            }, { timeout: mawkib_inventory_constants_1.MAWKIB_INVENTORY_REBUILD_TX_TIMEOUT_MS });
        }
        catch (error) {
            agentDebugLog('mawkib-inventory.service.ts:rebuildMawkibInventoryInRange', 'rebuildMawkibInventoryInRange transaction failed', {
                mawkibId,
                elapsedMs: Date.now() - txStartedAt,
                estimatedUpserts,
                aggregatedUpserts,
                errorCode: error.code ?? 'unknown',
            }, 'H4');
            throw error;
        }
        agentDebugLog('mawkib-inventory.service.ts:rebuildMawkibInventoryInRange', 'rebuildMawkibInventoryInRange transaction completed', {
            mawkibId,
            elapsedMs: Date.now() - txStartedAt,
            estimatedUpserts,
            aggregatedUpserts,
        }, 'H4');
        return {
            mawkibId,
            startDate: (0, date_util_1.formatDateOnly)(rangeStart),
            endDate: (0, date_util_1.formatDateOnly)(rangeEnd),
            daysUpdated: rangeDayKeys.size,
            reservationsProcessed,
        };
    }
    async getInventoryRange(mawkibId, startDate, endDate) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: mawkibId },
            select: {
                id: true,
                name: true,
                maleCapacity: true,
                femaleCapacity: true,
                serviceStartDate: true,
                serviceEndDate: true,
            },
        });
        if (!mawkib) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        this.assertDateRangeForMawkib(startDate, endDate, mawkib.serviceStartDate, mawkib.serviceEndDate);
        const start = (0, date_util_1.parseDateOnly)(startDate);
        const end = (0, date_util_1.parseDateOnly)(endDate);
        await this.ensureInitialized(mawkibId);
        await this.ensureDayRows(mawkibId, start, end);
        const rows = await this.prisma.mawkibDailyInventory.findMany({
            where: {
                mawkibId,
                date: { gte: start, lte: end },
            },
            orderBy: { date: 'asc' },
        });
        const rowByDate = new Map(rows.map((row) => [(0, date_util_1.formatDateOnly)(row.date), row]));
        const days = (0, date_util_1.eachDateInRange)(start, end).map((day) => {
            const key = (0, date_util_1.formatDateOnly)(day);
            const row = rowByDate.get(key);
            const reservedMale = row?.reservedMale ?? 0;
            const reservedFemale = row?.reservedFemale ?? 0;
            return {
                date: key,
                maleCapacity: mawkib.maleCapacity,
                femaleCapacity: mawkib.femaleCapacity,
                reservedMale,
                reservedFemale,
                availableMale: Math.max(0, mawkib.maleCapacity - reservedMale),
                availableFemale: Math.max(0, mawkib.femaleCapacity - reservedFemale),
            };
        });
        return {
            mawkibId: mawkib.id,
            mawkibName: mawkib.name,
            startDate: (0, date_util_1.formatDateOnly)(start),
            endDate: (0, date_util_1.formatDateOnly)(end),
            horizon: this.getHorizonMeta(),
            days,
        };
    }
    async getSnapshotsForMawkibsOnDate(mawkibs, day = (0, date_util_1.startOfAppDay)()) {
        const result = new Map();
        if (mawkibs.length === 0)
            return result;
        const date = (0, date_util_1.parseDateOnly)(day);
        await Promise.all(mawkibs.map((m) => this.ensureInitialized(m.id)));
        await Promise.all(mawkibs.map((m) => this.ensureDayRows(m.id, date, date)));
        const rows = await this.prisma.mawkibDailyInventory.findMany({
            where: {
                mawkibId: { in: mawkibs.map((m) => m.id) },
                date,
            },
        });
        const rowByMawkibId = new Map(rows.map((row) => [row.mawkibId, row]));
        for (const mawkib of mawkibs) {
            const row = rowByMawkibId.get(mawkib.id);
            const reservedMale = row?.reservedMale ?? 0;
            const reservedFemale = row?.reservedFemale ?? 0;
            result.set(mawkib.id, {
                maleCapacity: mawkib.maleCapacity,
                femaleCapacity: mawkib.femaleCapacity,
                reservedMale,
                reservedFemale,
                availableMale: Math.max(0, mawkib.maleCapacity - reservedMale),
                availableFemale: Math.max(0, mawkib.femaleCapacity - reservedFemale),
            });
        }
        return result;
    }
    async getCapacitySnapshotFromInventory(mawkibId, day, maleCapacity, femaleCapacity) {
        const snapshots = await this.getSnapshotsForMawkibsOnDate([{ id: mawkibId, maleCapacity, femaleCapacity }], day);
        const snapshot = snapshots.get(mawkibId);
        if (!snapshot) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        return snapshot;
    }
    async getMinCapacityInRangeFromInventory(mawkibId, startDate, endDate, maleCapacity, femaleCapacity) {
        const start = (0, date_util_1.parseDateOnly)(startDate);
        const end = (0, date_util_1.parseDateOnly)(endDate);
        const occupancyDays = (0, date_util_1.eachOccupancyDayInStay)(start, end);
        if (occupancyDays.length === 0) {
            return {
                maleCapacity,
                femaleCapacity,
                reservedMale: 0,
                reservedFemale: 0,
                availableMale: maleCapacity,
                availableFemale: femaleCapacity,
            };
        }
        await this.ensureInitialized(mawkibId);
        await this.ensureDayRows(mawkibId, occupancyDays[0], occupancyDays[occupancyDays.length - 1]);
        const rows = await this.prisma.mawkibDailyInventory.findMany({
            where: {
                mawkibId,
                date: {
                    gte: occupancyDays[0],
                    lte: occupancyDays[occupancyDays.length - 1],
                },
            },
        });
        const rowByDate = new Map(rows.map((row) => [(0, date_util_1.formatDateOnly)(row.date), row]));
        let minMale = Number.POSITIVE_INFINITY;
        let minFemale = Number.POSITIVE_INFINITY;
        let maxReservedMale = 0;
        let maxReservedFemale = 0;
        for (const day of occupancyDays) {
            const row = rowByDate.get((0, date_util_1.formatDateOnly)(day));
            const reservedMale = row?.reservedMale ?? 0;
            const reservedFemale = row?.reservedFemale ?? 0;
            maxReservedMale = Math.max(maxReservedMale, reservedMale);
            maxReservedFemale = Math.max(maxReservedFemale, reservedFemale);
            minMale = Math.min(minMale, Math.max(0, maleCapacity - reservedMale));
            minFemale = Math.min(minFemale, Math.max(0, femaleCapacity - reservedFemale));
        }
        return {
            maleCapacity,
            femaleCapacity,
            reservedMale: maxReservedMale,
            reservedFemale: maxReservedFemale,
            availableMale: minMale === Number.POSITIVE_INFINITY ? 0 : minMale,
            availableFemale: minFemale === Number.POSITIVE_INFINITY ? 0 : minFemale,
        };
    }
};
exports.MawkibInventoryService = MawkibInventoryService;
exports.MawkibInventoryService = MawkibInventoryService = MawkibInventoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MawkibInventoryService);
//# sourceMappingURL=mawkib-inventory.service.js.map