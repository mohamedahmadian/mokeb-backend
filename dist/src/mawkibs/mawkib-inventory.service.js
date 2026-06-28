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
    getHorizonMeta(fromDate = new Date()) {
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
        const horizon = this.getHorizonMeta(new Date());
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
    async ensureInitialized(mawkibId) {
        const count = await this.prisma.mawkibDailyInventory.count({
            where: { mawkibId },
        });
        if (count === 0 || (await this.isInventoryStale(mawkibId))) {
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
        const horizon = this.getHorizonMeta(new Date());
        await this.ensureDayRows(mawkibId, (0, date_util_1.parseDateOnly)(horizon.minDate), (0, date_util_1.parseDateOnly)(horizon.maxDate));
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
    async applyEarlyCheckoutRelease(reservation) {
        const days = (0, reservation_occupancy_util_1.reservationDaysReleasedOnCheckout)(reservation);
        if (days.length === 0)
            return;
        await this.prisma.$transaction(async (tx) => {
            await this.applyDeltaToDays(tx, reservation.mawkibId, days, reservation.maleGuestCount, reservation.femaleGuestCount, -1);
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
        const horizon = this.getHorizonMeta(new Date());
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
                actualCheckOutAt: true,
                maleGuestCount: true,
                femaleGuestCount: true,
            },
        });
        await this.prisma.$transaction(async (tx) => {
            for (const reservation of confirmed) {
                const days = (0, reservation_occupancy_util_1.reservationOccupiedDays)(reservation);
                if (days.length === 0)
                    continue;
                await this.applyDeltaToDays(tx, reservation.mawkibId, days, reservation.maleGuestCount, reservation.femaleGuestCount, 1);
            }
        });
    }
    async getInventoryRange(mawkibId, startDate, endDate) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: mawkibId },
            select: { id: true, name: true, maleCapacity: true, femaleCapacity: true },
        });
        if (!mawkib) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        this.assertDateRangeWithinHorizon(startDate, endDate);
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
            horizon: this.getHorizonMeta(new Date()),
            days,
        };
    }
    async getSnapshotsForMawkibsOnDate(mawkibs, day = new Date()) {
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
        await this.ensureInitialized(mawkibId);
        await this.ensureDayRows(mawkibId, start, end);
        const rows = await this.prisma.mawkibDailyInventory.findMany({
            where: {
                mawkibId,
                date: { gte: start, lte: end },
            },
        });
        const rowByDate = new Map(rows.map((row) => [(0, date_util_1.formatDateOnly)(row.date), row]));
        let minMale = Number.POSITIVE_INFINITY;
        let minFemale = Number.POSITIVE_INFINITY;
        for (const day of (0, date_util_1.eachDateInRange)(start, end)) {
            const row = rowByDate.get((0, date_util_1.formatDateOnly)(day));
            const reservedMale = row?.reservedMale ?? 0;
            const reservedFemale = row?.reservedFemale ?? 0;
            minMale = Math.min(minMale, Math.max(0, maleCapacity - reservedMale));
            minFemale = Math.min(minFemale, Math.max(0, femaleCapacity - reservedFemale));
        }
        return {
            maleCapacity,
            femaleCapacity,
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