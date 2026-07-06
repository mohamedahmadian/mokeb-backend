"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReservationsReport = buildReservationsReport;
const client_1 = require("@prisma/client");
const date_util_1 = require("../common/utils/date.util");
const PRESENCE_STATE_LABELS = {
    NOT_ARRIVED: 'هنوز وارد نشده',
    PRESENT: 'حاضر در موکب',
    TEMPORARILY_OUT: 'خروج موقت',
    LEFT: 'خارج شده',
};
function emptyGuestCounts() {
    return { male: 0, female: 0 };
}
function addGuestCounts(target, maleGuestCount, femaleGuestCount) {
    target.male += maleGuestCount;
    target.female += femaleGuestCount;
}
function aggregatePresenceByMawkib(reservations) {
    const presentByMawkib = new Map();
    const temporarilyOutByMawkib = new Map();
    const breakdownCounts = new Map();
    let presentMaleGuests = 0;
    let presentFemaleGuests = 0;
    let temporarilyOutMaleGuests = 0;
    let temporarilyOutFemaleGuests = 0;
    let presentReservationCount = 0;
    let temporarilyOutReservationCount = 0;
    for (const reservation of reservations) {
        breakdownCounts.set(reservation.presenceState, (breakdownCounts.get(reservation.presenceState) ?? 0) + 1);
        if (reservation.presenceState === client_1.ReservationPresenceState.PRESENT) {
            presentReservationCount += 1;
            presentMaleGuests += reservation.maleGuestCount;
            presentFemaleGuests += reservation.femaleGuestCount;
            const entry = presentByMawkib.get(reservation.mawkibId) ?? emptyGuestCounts();
            addGuestCounts(entry, reservation.maleGuestCount, reservation.femaleGuestCount);
            presentByMawkib.set(reservation.mawkibId, entry);
            continue;
        }
        if (reservation.presenceState === client_1.ReservationPresenceState.TEMPORARILY_OUT) {
            temporarilyOutReservationCount += 1;
            temporarilyOutMaleGuests += reservation.maleGuestCount;
            temporarilyOutFemaleGuests += reservation.femaleGuestCount;
            const entry = temporarilyOutByMawkib.get(reservation.mawkibId) ?? emptyGuestCounts();
            addGuestCounts(entry, reservation.maleGuestCount, reservation.femaleGuestCount);
            temporarilyOutByMawkib.set(reservation.mawkibId, entry);
        }
    }
    const presenceBreakdown = [
        client_1.ReservationPresenceState.PRESENT,
        client_1.ReservationPresenceState.TEMPORARILY_OUT,
        client_1.ReservationPresenceState.NOT_ARRIVED,
        client_1.ReservationPresenceState.LEFT,
    ].map((state) => ({
        label: PRESENCE_STATE_LABELS[state],
        count: breakdownCounts.get(state) ?? 0,
    }));
    return {
        presentByMawkib,
        temporarilyOutByMawkib,
        presenceTotals: {
            presentMaleGuests,
            presentFemaleGuests,
            presentTotalGuests: presentMaleGuests + presentFemaleGuests,
            temporarilyOutMaleGuests,
            temporarilyOutFemaleGuests,
            temporarilyOutTotalGuests: temporarilyOutMaleGuests + temporarilyOutFemaleGuests,
            presentReservationCount,
            temporarilyOutReservationCount,
        },
        presenceBreakdown,
    };
}
function startOfLocalDay(date = new Date()) {
    return (0, date_util_1.startOfAppDay)(date);
}
function startOfLocalMonth(date = new Date()) {
    const d = startOfLocalDay(date);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}
function buildMonthlyBuckets(dates) {
    const buckets = new Map();
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
function computeHighlights(rows) {
    const withReservations = rows.filter((row) => row.reservationCount > 0);
    const mostReserved = withReservations.length > 0
        ? [...withReservations].sort((a, b) => b.reservationCount - a.reservationCount)[0]
        : null;
    const leastReserved = withReservations.length > 0
        ? [...withReservations].sort((a, b) => a.reservationCount - b.reservationCount)[0]
        : null;
    const mostPresent = rows.length > 0
        ? [...rows].sort((a, b) => b.presentTotalGuests - a.presentTotalGuests)[0]
        : null;
    return {
        mostReserved,
        leastReserved,
        mostPresent: mostPresent?.presentTotalGuests ? mostPresent : null,
        fullCapacityMawkibs: rows.filter((row) => row.capacity > 0 && row.occupancyPercent >= 100),
        noReservationMawkibs: rows.filter((row) => row.reservationCount === 0),
    };
}
function buildBusyDays(reservations, rangeStart, rangeEnd) {
    const days = (0, date_util_1.eachDateInRange)(rangeStart, rangeEnd);
    const buckets = new Map();
    for (const day of days) {
        buckets.set((0, date_util_1.formatDateOnly)(day), 0);
    }
    for (const reservation of reservations) {
        const start = (0, date_util_1.parseDateOnly)(reservation.reservationDate);
        const end = (0, date_util_1.parseDateOnly)(reservation.reservationEndDate);
        const guests = reservation.maleGuestCount + reservation.femaleGuestCount;
        for (const day of days) {
            if (day >= start && day <= end) {
                const key = (0, date_util_1.formatDateOnly)(day);
                buckets.set(key, (buckets.get(key) ?? 0) + guests);
            }
        }
    }
    return Array.from(buckets.entries()).map(([key, count]) => {
        const date = (0, date_util_1.parseDateOnly)(key);
        const label = date.toLocaleDateString('fa-IR', {
            month: 'short',
            day: 'numeric',
        });
        return { label, count };
    });
}
async function buildReservationsReport(prisma, inventoryService, ownerUserId) {
    const scope = ownerUserId ? 'mine' : 'all';
    const reservationWhere = ownerUserId
        ? { mawkib: { ownerUserId } }
        : {};
    const today = startOfLocalDay();
    const weekStart = (0, date_util_1.addDays)(today, -6);
    const monthStart = startOfLocalMonth();
    const lastMonthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
    const lastMonthEnd = (0, date_util_1.addDays)(monthStart, -1);
    const mawkibWhere = {
        status: client_1.MawkibStatus.Approved,
        ...(ownerUserId ? { ownerUserId } : {}),
    };
    const [total, confirmedCount, pendingActiveCount, rejectedCount, cancelledCount, completedCount, expiredCount, todayCount, weekCount, monthCount, lastMonthCount, createdDates, activeReservations, overlapReservations, mawkibs, reservationCounts, confirmedCounts, presenceReservations,] = await Promise.all([
        prisma.reservation.count({ where: reservationWhere }),
        prisma.reservation.count({
            where: { ...reservationWhere, status: client_1.ReservationStatus.Confirmed },
        }),
        prisma.reservation.count({
            where: {
                ...reservationWhere,
                status: client_1.ReservationStatus.Pending,
                reservationEndDate: { gte: today },
            },
        }),
        prisma.reservation.count({
            where: {
                ...reservationWhere,
                status: client_1.ReservationStatus.Cancelled,
                cancellationNote: { not: null },
            },
        }),
        prisma.reservation.count({
            where: {
                ...reservationWhere,
                status: client_1.ReservationStatus.Cancelled,
                OR: [{ cancellationNote: null }, { cancellationNote: '' }],
            },
        }),
        prisma.reservation.count({
            where: { ...reservationWhere, status: client_1.ReservationStatus.Completed },
        }),
        prisma.reservation.count({
            where: {
                ...reservationWhere,
                status: client_1.ReservationStatus.Pending,
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
                        client_1.ReservationStatus.Confirmed,
                        client_1.ReservationStatus.Pending,
                        client_1.ReservationStatus.Completed,
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
                    in: [client_1.ReservationStatus.Confirmed, client_1.ReservationStatus.Pending],
                },
                reservationEndDate: { gte: today },
                reservationDate: { lte: (0, date_util_1.addDays)(today, 13) },
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
                status: { not: client_1.ReservationStatus.Cancelled },
            },
            _count: { id: true },
        }),
        prisma.reservation.groupBy({
            by: ['mawkibId'],
            where: {
                ...reservationWhere,
                status: {
                    in: [client_1.ReservationStatus.Confirmed, client_1.ReservationStatus.Completed],
                },
            },
            _count: { id: true },
        }),
        prisma.reservation.findMany({
            where: {
                ...reservationWhere,
                status: client_1.ReservationStatus.Confirmed,
            },
            select: {
                mawkibId: true,
                maleGuestCount: true,
                femaleGuestCount: true,
                presenceState: true,
            },
        }),
    ]);
    const { presentByMawkib, presenceTotals, presenceBreakdown, } = aggregatePresenceByMawkib(presenceReservations);
    const monthGrowthPercent = lastMonthCount > 0
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
    const snapshots = await inventoryService.getSnapshotsForMawkibsOnDate(mawkibs.map((m) => ({
        id: m.id,
        maleCapacity: m.maleCapacity,
        femaleCapacity: m.femaleCapacity,
    })), today);
    let totalCapacity = 0;
    let occupiedCapacity = 0;
    let todayMaleGuests = 0;
    let todayFemaleGuests = 0;
    const reservationCountMap = new Map(reservationCounts.map((row) => [row.mawkibId, row._count.id]));
    const confirmedCountMap = new Map(confirmedCounts.map((row) => [row.mawkibId, row._count.id]));
    const mawkibRows = mawkibs.map((mawkib) => {
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
        const occupancyPercent = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
        const presentCounts = presentByMawkib.get(mawkib.id) ?? emptyGuestCounts();
        const presentTotalGuests = presentCounts.male + presentCounts.female;
        return {
            mawkibId: mawkib.id,
            mawkibName: mawkib.name,
            capacity,
            reservationCount: reservationCountMap.get(mawkib.id) ?? 0,
            confirmedCount: confirmedCountMap.get(mawkib.id) ?? 0,
            occupancyPercent,
            presentMaleGuests: presentCounts.male,
            presentFemaleGuests: presentCounts.female,
            presentTotalGuests,
        };
    });
    mawkibRows.sort((a, b) => b.reservationCount - a.reservationCount);
    const remainingCapacity = Math.max(0, totalCapacity - occupiedCapacity);
    const occupancyPercent = totalCapacity > 0
        ? Math.round((occupiedCapacity / totalCapacity) * 100)
        : 0;
    const staySamples = await prisma.reservation.findMany({
        where: {
            ...reservationWhere,
            status: {
                in: [client_1.ReservationStatus.Confirmed, client_1.ReservationStatus.Completed],
            },
        },
        select: { reservationDate: true, reservationEndDate: true },
        take: 5000,
    });
    let averageStayDays = 0;
    if (staySamples.length > 0) {
        const totalDays = staySamples.reduce((sum, item) => {
            const start = (0, date_util_1.parseDateOnly)(item.reservationDate).getTime();
            const end = (0, date_util_1.parseDateOnly)(item.reservationEndDate).getTime();
            const days = Math.max(1, Math.round((end - start) / 86_400_000) + 1);
            return sum + days;
        }, 0);
        averageStayDays = Math.round((totalDays / staySamples.length) * 10) / 10;
    }
    const busyDays = buildBusyDays(overlapReservations, today, (0, date_util_1.addDays)(today, 13));
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
        presence: presenceTotals,
        presenceBreakdown,
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
//# sourceMappingURL=reservations-report.builder.js.map