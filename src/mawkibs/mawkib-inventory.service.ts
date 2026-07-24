import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Prisma, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  addDays,
  eachDateInRange,
  eachOccupancyDayInStay,
  formatDateOnly,
  parseDateOnly,
  startOfAppDay,
} from '../common/utils/date.util';
import {
  occupancyDaysDeltaOnEndDateChange,
  reservationOccupiedDays,
  reservationOverlapsDateRange,
} from '../reservations/reservation-occupancy.util';
import { MAWKIB_INVENTORY_HORIZON_DAYS, MAWKIB_INVENTORY_OCCUPANCY_REVISION, MAWKIB_INVENTORY_REBUILD_TX_TIMEOUT_MS } from './mawkib-inventory.constants';
import type { MawkibCapacitySnapshot } from '../common/types/capacity.types';

// #region agent log
function agentDebugLog(
  location: string,
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string,
) {
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
  }).catch(() => {});
}
// #endregion

type ReservationOccupancySource = {
  reservationDate: Date;
  reservationEndDate: Date;
  maleGuestCount: number;
  femaleGuestCount: number;
};

type DayOccupancyTotals = { male: number; female: number };

export type MawkibCapacitySource = {
  id: number;
  maleCapacity: number;
  femaleCapacity: number;
};

export interface MawkibInventoryHorizonMeta {
  horizonDays: number;
  minDate: string;
  maxDate: string;
}

export interface MawkibDailyInventoryItem {
  date: string;
  maleCapacity: number;
  femaleCapacity: number;
  reservedMale: number;
  reservedFemale: number;
  availableMale: number;
  availableFemale: number;
}

export interface MawkibInventoryRangeResult {
  mawkibId: number;
  mawkibName: string;
  startDate: string;
  endDate: string;
  horizon: MawkibInventoryHorizonMeta;
  days: MawkibDailyInventoryItem[];
}

type ReservationInventoryShape = {
  mawkibId: number;
  reservationDate: Date;
  reservationEndDate: Date;
  maleGuestCount: number;
  femaleGuestCount: number;
};

@Injectable()
export class MawkibInventoryService implements OnModuleInit {
  private readonly logger = new Logger(MawkibInventoryService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    void this.reconcileStaleInventoriesOnStartup();
    void this.reconcileOccupancyLogicRevision();
  }

  private occupancyRevisionMarkerPath(): string {
    return join(process.cwd(), '.cache', 'inventory-occupancy-revision');
  }

  private readStoredOccupancyRevision(): number {
    const path = this.occupancyRevisionMarkerPath();
    if (!existsSync(path)) return 0;
    const parsed = Number.parseInt(readFileSync(path, 'utf8').trim(), 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private writeStoredOccupancyRevision(revision: number) {
    const path = this.occupancyRevisionMarkerPath();
    mkdirSync(join(process.cwd(), '.cache'), { recursive: true });
    writeFileSync(path, String(revision), 'utf8');
  }

  /** Rebuild inventory once when day-occupancy rules change. */
  private async reconcileOccupancyLogicRevision() {
    if (this.readStoredOccupancyRevision() >= MAWKIB_INVENTORY_OCCUPANCY_REVISION) {
      return;
    }

    try {
      const mawkibs = await this.prisma.mawkib.findMany({ select: { id: true } });
      let rebuilt = 0;

      for (const mawkib of mawkibs) {
        const confirmedCount = await this.prisma.reservation.count({
          where: { mawkibId: mawkib.id, status: ReservationStatus.Confirmed },
        });

        if (confirmedCount === 0) continue;

        await this.rebuildMawkibInventory(mawkib.id);
        rebuilt += 1;
      }

      this.writeStoredOccupancyRevision(MAWKIB_INVENTORY_OCCUPANCY_REVISION);

      if (rebuilt > 0) {
        this.logger.log(
          `Rebuilt inventory for ${rebuilt} mawkib(s) after occupancy logic revision ${MAWKIB_INVENTORY_OCCUPANCY_REVISION}`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to rebuild inventory after occupancy logic change', error);
    }
  }

  private async reconcileStaleInventoriesOnStartup() {
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
    } catch (error) {
      this.logger.error('Failed to reconcile mawkib inventory on startup', error);
    }
  }

  private async isInventoryStale(mawkibId: number): Promise<boolean> {
    const confirmedCount = await this.prisma.reservation.count({
      where: { mawkibId, status: ReservationStatus.Confirmed },
    });

    if (confirmedCount === 0) return false;

    const occupiedRows = await this.prisma.mawkibDailyInventory.count({
      where: {
        mawkibId,
        OR: [{ reservedMale: { gt: 0 } }, { reservedFemale: { gt: 0 } }],
      },
    });

    return occupiedRows === 0;
  }

  getHorizonMeta(fromDate: Date | string = startOfAppDay()): MawkibInventoryHorizonMeta {
    const minDate = parseDateOnly(fromDate);
    const maxDate = addDays(minDate, MAWKIB_INVENTORY_HORIZON_DAYS - 1);

    return {
      horizonDays: MAWKIB_INVENTORY_HORIZON_DAYS,
      minDate: formatDateOnly(minDate),
      maxDate: formatDateOnly(maxDate),
    };
  }

  assertDateRangeWithinHorizon(startDate: Date | string, endDate: Date | string) {
    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);
    const horizon = this.getHorizonMeta();

    if (end < start) {
      throw new BadRequestException('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد');
    }

    if (start < parseDateOnly(horizon.minDate)) {
      throw new BadRequestException(
        `تاریخ شروع نمی‌تواند قبل از امروز باشد. بازه مجاز: ${horizon.minDate} تا ${horizon.maxDate}`,
      );
    }

    if (end > parseDateOnly(horizon.maxDate)) {
      throw new BadRequestException(
        `بازه درخواستی از محدوده ${horizon.horizonDays} روز آینده فراتر می‌رود. آخرین تاریخ مجاز: ${horizon.maxDate}`,
      );
    }
  }

  assertDateRangeForMawkib(
    startDate: Date | string,
    endDate: Date | string,
    serviceStartDate: Date | null,
    serviceEndDate: Date | null,
  ) {
    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);

    if (end < start) {
      throw new BadRequestException('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد');
    }

    if (serviceStartDate && serviceEndDate) {
      const svcStart = parseDateOnly(serviceStartDate);
      const svcEnd = parseDateOnly(serviceEndDate);

      if (start < svcStart || end > svcEnd) {
        throw new BadRequestException(
          `بازه درخواستی باید در محدوده ارائه خدمت موکب باشد: ${formatDateOnly(svcStart)} تا ${formatDateOnly(svcEnd)}`,
        );
      }
      return;
    }

    this.assertDateRangeWithinHorizon(startDate, endDate);
  }

  async ensureInitialized(mawkibId: number) {
    const count = await this.prisma.mawkibDailyInventory.count({
      where: { mawkibId },
    });
    const stale = count === 0 ? false : await this.isInventoryStale(mawkibId);

    // #region agent log
    agentDebugLog(
      'mawkib-inventory.service.ts:ensureInitialized',
      'ensureInitialized check',
      { mawkibId, rowCount: count, isStale: stale, willRebuild: count === 0 || stale },
      'H2',
    );
    // #endregion

    if (count === 0 || stale) {
      await this.rebuildMawkibInventory(mawkibId);
    }
  }

  async ensureDayRows(mawkibId: number, startDate: Date, endDate: Date) {
    const days = eachDateInRange(startDate, endDate);

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

  async seedHorizonForMawkib(mawkibId: number) {
    const horizon = this.getHorizonMeta();
    await this.ensureDayRows(
      mawkibId,
      parseDateOnly(horizon.minDate),
      parseDateOnly(horizon.maxDate),
    );
  }

  private aggregateOccupancyByDay(
    reservations: ReservationOccupancySource[],
    dayFilter?: Set<string>,
  ): Map<string, DayOccupancyTotals> {
    const counts = new Map<string, DayOccupancyTotals>();

    for (const reservation of reservations) {
      for (const day of reservationOccupiedDays(reservation)) {
        const key = formatDateOnly(day);
        if (dayFilter && !dayFilter.has(key)) continue;

        const entry = counts.get(key) ?? { male: 0, female: 0 };
        entry.male += reservation.maleGuestCount;
        entry.female += reservation.femaleGuestCount;
        counts.set(key, entry);
      }
    }

    return counts;
  }

  private async applyAggregatedCountsToDays(
    tx: Prisma.TransactionClient,
    mawkibId: number,
    counts: Map<string, DayOccupancyTotals>,
  ) {
    for (const [dateKey, occupancy] of counts) {
      const day = parseDateOnly(dateKey);
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

  private async applyDeltaToDays(
    tx: Prisma.TransactionClient,
    mawkibId: number,
    days: Date[],
    maleGuestCount: number,
    femaleGuestCount: number,
    delta: 1 | -1,
  ) {
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

  async applyReservationOccupancy(
    reservation: ReservationInventoryShape,
    delta: 1 | -1,
  ) {
    const days = reservationOccupiedDays(reservation);

    if (days.length === 0) {
      if (delta === 1) {
        throw new BadRequestException(
          'بازه تاریخ رزرو برای به‌روزرسانی ظرفیت معتبر نیست',
        );
      }
      return;
    }

    await this.ensureDayRows(
      reservation.mawkibId,
      days[0],
      days[days.length - 1],
    );

    await this.prisma.$transaction(async (tx) => {
      await this.applyDeltaToDays(
        tx,
        reservation.mawkibId,
        days,
        reservation.maleGuestCount,
        reservation.femaleGuestCount,
        delta,
      );
    });
  }

  async applyEndDateChange(
    reservation: Pick<
      ReservationInventoryShape,
      | 'mawkibId'
      | 'reservationDate'
      | 'maleGuestCount'
      | 'femaleGuestCount'
    >,
    previousEndDate: Date | string,
    newEndDate: Date | string,
  ) {
    const { released, occupied } = occupancyDaysDeltaOnEndDateChange(
      reservation.reservationDate,
      previousEndDate,
      newEndDate,
    );

    if (released.length === 0 && occupied.length === 0) return;

    const allDays = [...released, ...occupied];
    await this.ensureDayRows(
      reservation.mawkibId,
      allDays[0],
      allDays[allDays.length - 1],
    );

    await this.prisma.$transaction(async (tx) => {
      if (released.length > 0) {
        await this.applyDeltaToDays(
          tx,
          reservation.mawkibId,
          released,
          reservation.maleGuestCount,
          reservation.femaleGuestCount,
          -1,
        );
      }

      if (occupied.length > 0) {
        await this.applyDeltaToDays(
          tx,
          reservation.mawkibId,
          occupied,
          reservation.maleGuestCount,
          reservation.femaleGuestCount,
          1,
        );
      }
    });
  }

  async rebuildMawkibInventory(mawkibId: number) {
    /** Sole reservation scan path — rebuilds inventory rows from Confirmed reservations. */
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: mawkibId },
      select: { id: true },
    });

    if (!mawkib) {
      throw new NotFoundException('موکب یافت نشد');
    }

    const horizon = this.getHorizonMeta();
    const rangeStart = parseDateOnly(horizon.minDate);
    const rangeEnd = parseDateOnly(horizon.maxDate);

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
        status: ReservationStatus.Confirmed,
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
      estimatedUpserts += reservationOccupiedDays(reservation).length;
    }

    const horizonDayKeys = new Set(
      eachDateInRange(rangeStart, rangeEnd).map((day) => formatDateOnly(day)),
    );
    const aggregated = this.aggregateOccupancyByDay(confirmed, horizonDayKeys);
    const aggregatedUpserts = aggregated.size;

    // #region agent log
    agentDebugLog(
      'mawkib-inventory.service.ts:rebuildMawkibInventory',
      'rebuildMawkibInventory before transaction',
      {
        mawkibId,
        confirmedCount: confirmed.length,
        horizonDays: horizonDayKeys.size,
        estimatedUpserts,
        aggregatedUpserts,
      },
      'H1',
    );
    // #endregion

    const txStartedAt = Date.now();
    try {
      await this.prisma.$transaction(
        async (tx) => {
          await this.applyAggregatedCountsToDays(tx, mawkibId, aggregated);
        },
        { timeout: MAWKIB_INVENTORY_REBUILD_TX_TIMEOUT_MS },
      );
    } catch (error) {
      // #region agent log
      agentDebugLog(
        'mawkib-inventory.service.ts:rebuildMawkibInventory',
        'rebuildMawkibInventory transaction failed',
        {
          mawkibId,
          elapsedMs: Date.now() - txStartedAt,
          estimatedUpserts,
          aggregatedUpserts,
          errorCode: (error as { code?: string }).code ?? 'unknown',
        },
        'H1',
      );
      // #endregion
      throw error;
    }

    // #region agent log
    agentDebugLog(
      'mawkib-inventory.service.ts:rebuildMawkibInventory',
      'rebuildMawkibInventory transaction completed',
      {
        mawkibId,
        elapsedMs: Date.now() - txStartedAt,
        estimatedUpserts,
        aggregatedUpserts,
      },
      'H1',
    );
    // #endregion
  }

  async rebuildMawkibInventoryInRange(
    mawkibId: number,
    startDate: Date | string,
    endDate: Date | string,
  ) {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: mawkibId },
      select: {
        id: true,
        serviceStartDate: true,
        serviceEndDate: true,
      },
    });

    if (!mawkib) {
      throw new NotFoundException('موکب یافت نشد');
    }

    this.assertDateRangeForMawkib(
      startDate,
      endDate,
      mawkib.serviceStartDate,
      mawkib.serviceEndDate,
    );

    const rangeStart = parseDateOnly(startDate);
    const rangeEnd = parseDateOnly(endDate);
    const rangeDayKeys = new Set(
      eachDateInRange(rangeStart, rangeEnd).map((day) => formatDateOnly(day)),
    );

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
        status: ReservationStatus.Confirmed,
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
    const overlappingReservations: ReservationOccupancySource[] = [];

    for (const reservation of confirmed) {
      if (!reservationOverlapsDateRange(reservation, rangeStart, rangeEnd)) {
        continue;
      }
      const days = reservationOccupiedDays(reservation).filter((day) =>
        rangeDayKeys.has(formatDateOnly(day)),
      );
      if (days.length === 0) continue;
      reservationsProcessed += 1;
      estimatedUpserts += days.length;
      overlappingReservations.push(reservation);
    }

    const aggregated = this.aggregateOccupancyByDay(
      overlappingReservations,
      rangeDayKeys,
    );
    const aggregatedUpserts = aggregated.size;

    // #region agent log
    agentDebugLog(
      'mawkib-inventory.service.ts:rebuildMawkibInventoryInRange',
      'rebuildMawkibInventoryInRange before transaction',
      {
        mawkibId,
        rangeDays: rangeDayKeys.size,
        confirmedCount: confirmed.length,
        reservationsProcessed,
        estimatedUpserts,
        aggregatedUpserts,
      },
      'H4',
    );
    // #endregion

    const txStartedAt = Date.now();
    try {
      await this.prisma.$transaction(
        async (tx) => {
          await this.applyAggregatedCountsToDays(tx, mawkibId, aggregated);
        },
        { timeout: MAWKIB_INVENTORY_REBUILD_TX_TIMEOUT_MS },
      );
    } catch (error) {
      // #region agent log
      agentDebugLog(
        'mawkib-inventory.service.ts:rebuildMawkibInventoryInRange',
        'rebuildMawkibInventoryInRange transaction failed',
        {
          mawkibId,
          elapsedMs: Date.now() - txStartedAt,
          estimatedUpserts,
          aggregatedUpserts,
          errorCode: (error as { code?: string }).code ?? 'unknown',
        },
        'H4',
      );
      // #endregion
      throw error;
    }

    // #region agent log
    agentDebugLog(
      'mawkib-inventory.service.ts:rebuildMawkibInventoryInRange',
      'rebuildMawkibInventoryInRange transaction completed',
      {
        mawkibId,
        elapsedMs: Date.now() - txStartedAt,
        estimatedUpserts,
        aggregatedUpserts,
      },
      'H4',
    );
    // #endregion

    return {
      mawkibId,
      startDate: formatDateOnly(rangeStart),
      endDate: formatDateOnly(rangeEnd),
      daysUpdated: rangeDayKeys.size,
      reservationsProcessed,
    };
  }

  async getInventoryRange(
    mawkibId: number,
    startDate: Date | string,
    endDate: Date | string,
  ): Promise<MawkibInventoryRangeResult> {
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
      throw new NotFoundException('موکب یافت نشد');
    }

    this.assertDateRangeForMawkib(
      startDate,
      endDate,
      mawkib.serviceStartDate,
      mawkib.serviceEndDate,
    );

    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);

    await this.ensureInitialized(mawkibId);
    await this.ensureDayRows(mawkibId, start, end);

    const rows = await this.prisma.mawkibDailyInventory.findMany({
      where: {
        mawkibId,
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
    });

    const rowByDate = new Map(rows.map((row) => [formatDateOnly(row.date), row]));

    const days = eachDateInRange(start, end).map((day) => {
      const key = formatDateOnly(day);
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
      startDate: formatDateOnly(start),
      endDate: formatDateOnly(end),
      horizon: this.getHorizonMeta(),
      days,
    };
  }

  /** Read available capacity for many mawkibs on one day — inventory table only. */
  async getSnapshotsForMawkibsOnDate(
    mawkibs: MawkibCapacitySource[],
    day: Date | string = startOfAppDay(),
  ): Promise<Map<number, MawkibCapacitySnapshot>> {
    const result = new Map<number, MawkibCapacitySnapshot>();
    if (mawkibs.length === 0) return result;

    const date = parseDateOnly(day);

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

  async getCapacitySnapshotFromInventory(
    mawkibId: number,
    day: Date | string,
    maleCapacity: number,
    femaleCapacity: number,
  ) {
    const snapshots = await this.getSnapshotsForMawkibsOnDate(
      [{ id: mawkibId, maleCapacity, femaleCapacity }],
      day,
    );
    const snapshot = snapshots.get(mawkibId);
    if (!snapshot) {
      throw new NotFoundException('موکب یافت نشد');
    }
    return snapshot;
  }

  async getMinCapacityInRangeFromInventory(
    mawkibId: number,
    startDate: Date | string,
    endDate: Date | string,
    maleCapacity: number,
    femaleCapacity: number,
  ) {
    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);
    const occupancyDays = eachOccupancyDayInStay(start, end);

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
    await this.ensureDayRows(
      mawkibId,
      occupancyDays[0],
      occupancyDays[occupancyDays.length - 1],
    );

    const rows = await this.prisma.mawkibDailyInventory.findMany({
      where: {
        mawkibId,
        date: {
          gte: occupancyDays[0],
          lte: occupancyDays[occupancyDays.length - 1],
        },
      },
    });

    const rowByDate = new Map(rows.map((row) => [formatDateOnly(row.date), row]));
    let minMale = Number.POSITIVE_INFINITY;
    let minFemale = Number.POSITIVE_INFINITY;
    let maxReservedMale = 0;
    let maxReservedFemale = 0;

    for (const day of occupancyDays) {
      const row = rowByDate.get(formatDateOnly(day));
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
}
