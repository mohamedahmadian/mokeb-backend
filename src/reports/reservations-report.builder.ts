import { MawkibStatus, Prisma, ReservationStatus } from '@prisma/client';
import {
  addDays,
  eachDateInRange,
  formatDateOnly,
  parseDateOnly,
  startOfAppDay,
} from '../common/utils/date.util';
import type { MawkibInventoryService } from '../mawkibs/mawkib-inventory.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { ReportCountItem } from './reports.service';
import type {
  ReservationsReportHighlights,
  ReservationsReportMawkibRow,
  ReservationsReportResponse,
} from './reservations-report.types';

function startOfLocalDay(date = new Date()): Date {
  return startOfAppDay(date);
}

function startOfLocalMonth(date = new Date()): Date {
  const d = startOfLocalDay(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function buildMonthlyBuckets(dates: { createdAt: Date }[]): ReportCountItem[] {
  const buckets = new Map<string, number>();
  const now = new Date();

  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets.set(key, 0);
  }

  for (const { createdAt } of dates) {
    const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return Array.from(buckets.entries()).map(([key, count]) => {
    const [year, month] = key.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    const label = date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
    });
    return { label, count };
  });
}

function computeHighlights(
  rows: ReservationsReportMawkibRow[],
): ReservationsReportHighlights {
  const withReservations = rows.filter((row) => row.reservationCount > 0);
  const mostReserved =
    withReservations.length > 0
      ? [...withReservations].sort(
          (a, b) => b.reservationCount - a.reservationCount,
        )[0]
      : null;
  const leastReserved =
    withReservations.length > 0
      ? [...withReservations].sort(
          (a, b) => a.reservationCount - b.reservationCount,
        )[0]
      : null;

  return {
    mostReserved,
    leastReserved,
    fullCapacityMawkibs: rows.filter(
      (row) => row.capacity > 0 && row.occupancyPercent >= 100,
    ),
    noReservationMawkibs: rows.filter((row) => row.reservationCount === 0),
  };
}

function buildBusyDays(
  reservations: {
    reservationDate: Date;
    reservationEndDate: Date;
    maleGuestCount: number;
    femaleGuestCount: number;
  }[],
  rangeStart: Date,
  rangeEnd: Date,
): ReportCountItem[] {
  const days = eachDateInRange(rangeStart, rangeEnd);
  const buckets = new Map<string, number>();

  for (const day of days) {
    buckets.set(formatDateOnly(day), 0);
  }

  for (const reservation of reservations) {
    const start = parseDateOnly(reservation.reservationDate);
    const end = parseDateOnly(reservation.reservationEndDate);
    const guests = reservation.maleGuestCount + reservation.femaleGuestCount;

    for (const day of days) {
      if (day >= start && day <= end) {
        const key = formatDateOnly(day);
        buckets.set(key, (buckets.get(key) ?? 0) + guests);
      }
    }
  }

  return Array.from(buckets.entries()).map(([key, count]) => {
    const date = parseDateOnly(key);
    const label = date.toLocaleDateString('fa-IR', {
      month: 'short',
      day: 'numeric',
    });
    return { label, count };
  });
}

export async function buildReservationsReport(
  prisma: PrismaService,
  inventoryService: MawkibInventoryService,
  ownerUserId?: number,
): Promise<ReservationsReportResponse> {
  const scope: ReservationsReportResponse['scope'] = ownerUserId ? 'mine' : 'all';
  const reservationWhere: Prisma.ReservationWhereInput = ownerUserId
    ? { mawkib: { ownerUserId } }
    : {};

  const today = startOfLocalDay();
  const weekStart = addDays(today, -6);
  const monthStart = startOfLocalMonth();
  const lastMonthStart = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1),
  );
  const lastMonthEnd = addDays(monthStart, -1);

  const mawkibWhere: Prisma.MawkibWhereInput = {
    status: MawkibStatus.Approved,
    ...(ownerUserId ? { ownerUserId } : {}),
  };

  const [
    total,
    confirmedCount,
    pendingActiveCount,
    rejectedCount,
    cancelledCount,
    completedCount,
    expiredCount,
    todayCount,
    weekCount,
    monthCount,
    lastMonthCount,
    createdDates,
    activeReservations,
    overlapReservations,
    mawkibs,
    reservationCounts,
    confirmedCounts,
  ] = await Promise.all([
    prisma.reservation.count({ where: reservationWhere }),
    prisma.reservation.count({
      where: { ...reservationWhere, status: ReservationStatus.Confirmed },
    }),
    prisma.reservation.count({
      where: {
        ...reservationWhere,
        status: ReservationStatus.Pending,
        reservationEndDate: { gte: today },
      },
    }),
    prisma.reservation.count({
      where: {
        ...reservationWhere,
        status: ReservationStatus.Cancelled,
        cancellationNote: { not: null },
      },
    }),
    prisma.reservation.count({
      where: {
        ...reservationWhere,
        status: ReservationStatus.Cancelled,
        OR: [{ cancellationNote: null }, { cancellationNote: '' }],
      },
    }),
    prisma.reservation.count({
      where: { ...reservationWhere, status: ReservationStatus.Completed },
    }),
    prisma.reservation.count({
      where: {
        ...reservationWhere,
        status: ReservationStatus.Pending,
        reservationEndDate: { lt: today },
      },
    }),
    prisma.reservation.count({
      where: { ...reservationWhere, createdAt: { gte: today } },
    }),
    prisma.reservation.count({
      where: { ...reservationWhere, createdAt: { gte: weekStart } },
    }),
    prisma.reservation.count({
      where: { ...reservationWhere, createdAt: { gte: monthStart } },
    }),
    prisma.reservation.count({
      where: {
        ...reservationWhere,
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    }),
    prisma.reservation.findMany({
      where: reservationWhere,
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 8000,
    }),
    prisma.reservation.findMany({
      where: {
        ...reservationWhere,
        status: {
          in: [
            ReservationStatus.Confirmed,
            ReservationStatus.Pending,
            ReservationStatus.Completed,
          ],
        },
      },
      select: {
        maleGuestCount: true,
        femaleGuestCount: true,
      },
    }),
    prisma.reservation.findMany({
      where: {
        ...reservationWhere,
        status: {
          in: [ReservationStatus.Confirmed, ReservationStatus.Pending],
        },
        reservationEndDate: { gte: today },
        reservationDate: { lte: addDays(today, 13) },
      },
      select: {
        reservationDate: true,
        reservationEndDate: true,
        maleGuestCount: true,
        femaleGuestCount: true,
      },
    }),
    prisma.mawkib.findMany({
      where: mawkibWhere,
      select: {
        id: true,
        name: true,
        maleCapacity: true,
        femaleCapacity: true,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.reservation.groupBy({
      by: ['mawkibId'],
      where: {
        ...reservationWhere,
        status: { not: ReservationStatus.Cancelled },
      },
      _count: { id: true },
    }),
    prisma.reservation.groupBy({
      by: ['mawkibId'],
      where: {
        ...reservationWhere,
        status: {
          in: [ReservationStatus.Confirmed, ReservationStatus.Completed],
        },
      },
      _count: { id: true },
    }),
  ]);

  const monthGrowthPercent =
    lastMonthCount > 0
      ? Math.round(((monthCount - lastMonthCount) / lastMonthCount) * 100)
      : monthCount > 0
        ? 100
        : null;

  let totalMaleGuests = 0;
  let totalFemaleGuests = 0;
  for (const r of activeReservations) {
    totalMaleGuests += r.maleGuestCount;
    totalFemaleGuests += r.femaleGuestCount;
  }

  const snapshots = await inventoryService.getSnapshotsForMawkibsOnDate(
    mawkibs.map((m) => ({
      id: m.id,
      maleCapacity: m.maleCapacity,
      femaleCapacity: m.femaleCapacity,
    })),
    today,
  );

  let totalCapacity = 0;
  let occupiedCapacity = 0;
  let todayMaleGuests = 0;
  let todayFemaleGuests = 0;

  const reservationCountMap = new Map(
    reservationCounts.map((row) => [row.mawkibId, row._count.id]),
  );
  const confirmedCountMap = new Map(
    confirmedCounts.map((row) => [row.mawkibId, row._count.id]),
  );

  const mawkibRows: ReservationsReportMawkibRow[] = mawkibs.map((mawkib) => {
    const capacity = mawkib.maleCapacity + mawkib.femaleCapacity;
    totalCapacity += capacity;

    const snapshot = snapshots.get(mawkib.id);
    const maleOccupied = snapshot
      ? Math.max(0, mawkib.maleCapacity - snapshot.availableMale)
      : 0;
    const femaleOccupied = snapshot
      ? Math.max(0, mawkib.femaleCapacity - snapshot.availableFemale)
      : 0;
    const occupied = maleOccupied + femaleOccupied;
    occupiedCapacity += occupied;
    todayMaleGuests += maleOccupied;
    todayFemaleGuests += femaleOccupied;

    const occupancyPercent =
      capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;

    return {
      mawkibId: mawkib.id,
      mawkibName: mawkib.name,
      capacity,
      reservationCount: reservationCountMap.get(mawkib.id) ?? 0,
      confirmedCount: confirmedCountMap.get(mawkib.id) ?? 0,
      occupancyPercent,
    };
  });

  mawkibRows.sort((a, b) => b.reservationCount - a.reservationCount);

  const remainingCapacity = Math.max(0, totalCapacity - occupiedCapacity);
  const occupancyPercent =
    totalCapacity > 0
      ? Math.round((occupiedCapacity / totalCapacity) * 100)
      : 0;

  const staySamples = await prisma.reservation.findMany({
    where: {
      ...reservationWhere,
      status: {
        in: [ReservationStatus.Confirmed, ReservationStatus.Completed],
      },
    },
    select: { reservationDate: true, reservationEndDate: true },
    take: 5000,
  });

  let averageStayDays = 0;
  if (staySamples.length > 0) {
    const totalDays = staySamples.reduce((sum, item) => {
      const start = parseDateOnly(item.reservationDate).getTime();
      const end = parseDateOnly(item.reservationEndDate).getTime();
      const days = Math.max(1, Math.round((end - start) / 86_400_000) + 1);
      return sum + days;
    }, 0);
    averageStayDays = Math.round((totalDays / staySamples.length) * 10) / 10;
  }

  const busyDays = buildBusyDays(
    overlapReservations,
    today,
    addDays(today, 13),
  );

  return {
    scope,
    summary: {
      total,
      confirmedCount,
      pendingCount: pendingActiveCount,
      rejectedCount,
      cancelledCount,
      completedCount,
      expiredCount,
      todayCount,
      weekCount,
      monthCount,
      monthGrowthPercent,
      totalMaleGuests,
      totalFemaleGuests,
      todayMaleGuests,
      todayFemaleGuests,
      averageStayDays,
      pendingActionCount: pendingActiveCount,
    },
    capacity: {
      totalCapacity,
      occupiedCapacity,
      remainingCapacity,
      occupancyPercent,
    },
    statusBreakdown: [
      { label: 'تأیید شده', count: confirmedCount + completedCount },
      { label: 'در انتظار', count: pendingActiveCount },
      { label: 'رد شده', count: rejectedCount },
      { label: 'لغو شده', count: cancelledCount },
      { label: 'منقضی شده', count: expiredCount },
    ],
    genderBreakdown: [
      { label: 'آقایان', count: totalMaleGuests },
      { label: 'بانوان', count: totalFemaleGuests },
    ],
    todayGenderBreakdown: [
      { label: 'آقایان', count: todayMaleGuests },
      { label: 'بانوان', count: todayFemaleGuests },
    ],
    mawkibRows,
    highlights: computeHighlights(mawkibRows),
    busyDays,
    monthlyReservations: buildMonthlyBuckets(createdDates),
  };
}
