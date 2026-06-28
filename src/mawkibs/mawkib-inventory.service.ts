import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Prisma, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  addDays,
  eachDateInRange,
  formatDateOnly,
  parseDateOnly,
} from '../common/utils/date.util';
import {
  reservationDaysReleasedOnCheckout,
  reservationOccupiedDays,
} from '../reservations/reservation-occupancy.util';
import { MAWKIB_INVENTORY_HORIZON_DAYS, MAWKIB_INVENTORY_OCCUPANCY_REVISION } from './mawkib-inventory.constants';
import type { MawkibCapacitySnapshot } from '../common/types/capacity.types';

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
  actualCheckOutAt: Date | null;
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

  getHorizonMeta(fromDate: Date | string = new Date()): MawkibInventoryHorizonMeta {
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
    const horizon = this.getHorizonMeta(new Date());

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

  async ensureInitialized(mawkibId: number) {
    const count = await this.prisma.mawkibDailyInventory.count({
      where: { mawkibId },
    });

    if (count === 0 || (await this.isInventoryStale(mawkibId))) {
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
    const horizon = this.getHorizonMeta(new Date());
    await this.ensureDayRows(
      mawkibId,
      parseDateOnly(horizon.minDate),
      parseDateOnly(horizon.maxDate),
    );
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

  async applyEarlyCheckoutRelease(
    reservation: Pick<
      ReservationInventoryShape,
      'mawkibId' | 'reservationEndDate' | 'actualCheckOutAt' | 'maleGuestCount' | 'femaleGuestCount'
    >,
  ) {
    const days = reservationDaysReleasedOnCheckout(reservation);
    if (days.length === 0) return;

    await this.prisma.$transaction(async (tx) => {
      await this.applyDeltaToDays(
        tx,
        reservation.mawkibId,
        days,
        reservation.maleGuestCount,
        reservation.femaleGuestCount,
        -1,
      );
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

    const horizon = this.getHorizonMeta(new Date());
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
        actualCheckOutAt: true,
        maleGuestCount: true,
        femaleGuestCount: true,
      },
    });

    await this.prisma.$transaction(async (tx) => {
      for (const reservation of confirmed) {
        const days = reservationOccupiedDays(reservation);
        if (days.length === 0) continue;

        await this.applyDeltaToDays(
          tx,
          reservation.mawkibId,
          days,
          reservation.maleGuestCount,
          reservation.femaleGuestCount,
          1,
        );
      }
    });
  }

  async getInventoryRange(
    mawkibId: number,
    startDate: Date | string,
    endDate: Date | string,
  ): Promise<MawkibInventoryRangeResult> {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: mawkibId },
      select: { id: true, name: true, maleCapacity: true, femaleCapacity: true },
    });

    if (!mawkib) {
      throw new NotFoundException('موکب یافت نشد');
    }

    this.assertDateRangeWithinHorizon(startDate, endDate);

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
      horizon: this.getHorizonMeta(new Date()),
      days,
    };
  }

  /** Read available capacity for many mawkibs on one day — inventory table only. */
  async getSnapshotsForMawkibsOnDate(
    mawkibs: MawkibCapacitySource[],
    day: Date | string = new Date(),
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

    await this.ensureInitialized(mawkibId);
    await this.ensureDayRows(mawkibId, start, end);

    const rows = await this.prisma.mawkibDailyInventory.findMany({
      where: {
        mawkibId,
        date: { gte: start, lte: end },
      },
    });

    const rowByDate = new Map(rows.map((row) => [formatDateOnly(row.date), row]));
    let minMale = Number.POSITIVE_INFINITY;
    let minFemale = Number.POSITIVE_INFINITY;

    for (const day of eachDateInRange(start, end)) {
      const row = rowByDate.get(formatDateOnly(day));
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
}
