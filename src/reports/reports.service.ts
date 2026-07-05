import { Injectable } from '@nestjs/common';
import { MawkibCity, MawkibCountry, MawkibStatus, Prisma, RegistrationRequestStatus, RoleName, UserGender } from '@prisma/client';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { formatDateOnly, addDays, parseDateOnly, eachDateInRange, startOfAppDay, formatDateOnlyInAppTz } from '../common/utils/date.util';
import { MawkibInventoryService } from '../mawkibs/mawkib-inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { buildReservationsReport } from './reservations-report.builder';
import type { ReservationsReportResponse } from './reservations-report.types';

export interface ReportCountItem {
  label: string;
  count: number;
}

export interface PilgrimReportResponse {
  scope: 'all' | 'mine';
  summary: {
    total: number;
    maleCount: number;
    femaleCount: number;
    unknownGenderCount: number;
    activeCount: number;
    inactiveCount: number;
    withNationalIdCount: number;
    withProfileImageCount: number;
    withNationalIdCardCount: number;
    todayRegistrationCount: number;
    weekRegistrationCount: number;
    monthRegistrationCount: number;
  };
  genderBreakdown: ReportCountItem[];
  statusBreakdown: ReportCountItem[];
  profileCompletion: ReportCountItem[];
  byProvince: ReportCountItem[];
  byCity: ReportCountItem[];
  monthlyRegistrations: ReportCountItem[];
  weeklyRegistrations: ReportCountItem[];
}

export interface MawkibOwnersReportResponse {
  summary: {
    total: number;
    activeCount: number;
    inactiveCount: number;
    maleCount: number;
    femaleCount: number;
    unknownGenderCount: number;
    withMawkibCount: number;
  };
  genderBreakdown: ReportCountItem[];
  byProvince: ReportCountItem[];
  byCity: ReportCountItem[];
}

export interface MawkibTodayGuestItem {
  mawkibId: number;
  mawkibName: string;
  maleGuests: number;
  femaleGuests: number;
  totalGuests: number;
  maleCapacity: number;
  femaleCapacity: number;
}

export interface MawkibsReportResponse {
  scope: 'all' | 'mine';
  summary: {
    total: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    totalMaleCapacity: number;
    totalFemaleCapacity: number;
    onlineReservationEnabledCount: number;
    todayMaleGuests: number;
    todayFemaleGuests: number;
    todayTotalGuests: number;
    pendingRegistrationRequestCount: number;
    rejectedRegistrationRequestCount: number;
  };
  statusBreakdown: ReportCountItem[];
  approvalScopeTotal: number;
  byProvince: ReportCountItem[];
  byCity: ReportCountItem[];
  todayDate: string;
  todayGuestByMawkib: MawkibTodayGuestItem[];
}

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: MawkibInventoryService,
  ) {}

  private resolveOwnerScope(user: AuthUser): number | undefined {
    const isAdmin = user.roles.includes(RoleName.Admin);
    if (isAdmin) return undefined;
    if (user.roles.includes(RoleName.MawkibOwner)) return user.id;
    return undefined;
  }

  private pilgrimWhere(ownerUserId?: number): Prisma.UserWhereInput {
    return {
      roles: { some: { role: { name: RoleName.Pilgrim } } },
      ...(ownerUserId
        ? {
            pilgrimReservations: {
              some: { mawkib: { ownerUserId } },
            },
          }
        : {}),
    };
  }

  private mapUserGroupBy(
    rows: { province?: string | null; city?: string | null; _count: { id: number } }[],
    field: 'province' | 'city',
    emptyLabel = 'نامشخص',
  ): ReportCountItem[] {
    return rows
      .filter((row) => row._count.id > 0)
      .map((row) => ({
        label: (field === 'province' ? row.province : row.city)?.trim() || emptyLabel,
        count: row._count.id,
      }));
  }

  private buildMonthlyRegistrations(
    dates: { createdAt: Date }[],
  ): ReportCountItem[] {
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

  private startOfLocalDay(date = new Date()): Date {
    return startOfAppDay(date);
  }

  private startOfLocalMonth(date = new Date()): Date {
    const d = this.startOfLocalDay(date);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  }

  private async buildWeeklyRegistrationCounts(
    where: Prisma.UserWhereInput,
    rangeStart: Date,
    rangeEnd: Date,
  ): Promise<ReportCountItem[]> {
    const days = eachDateInRange(rangeStart, rangeEnd);
    const counts = await Promise.all(
      days.map((day) => {
        const nextDay = addDays(day, 1);
        return this.prisma.user.count({
          where: {
            ...where,
            createdAt: { gte: day, lt: nextDay },
          },
        });
      }),
    );

    return days.map((day, index) => {
      const weekday = day.toLocaleDateString('fa-IR', { weekday: 'short' });
      const datePart = day.toLocaleDateString('fa-IR', {
        month: 'short',
        day: 'numeric',
      });

      return {
        label: `${weekday}\n${datePart}`,
        count: counts[index],
      };
    });
  }

  async getPilgrimReport(user: AuthUser): Promise<PilgrimReportResponse> {
    const ownerUserId = this.resolveOwnerScope(user);
    const where = this.pilgrimWhere(ownerUserId);
    const today = this.startOfLocalDay();
    const weekStart = addDays(today, -6);
    const monthStart = this.startOfLocalMonth();

    const [
      total,
      maleCount,
      femaleCount,
      unknownGenderCount,
      activeCount,
      inactiveCount,
      withNationalIdCount,
      withProfileImageCount,
      withNationalIdCardCount,
      todayRegistrationCount,
      weekRegistrationCount,
      monthRegistrationCount,
      provinceGroups,
      cityGroups,
      registrationDates,
    ] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.count({ where: { ...where, gender: UserGender.Male } }),
      this.prisma.user.count({ where: { ...where, gender: UserGender.Female } }),
      this.prisma.user.count({ where: { ...where, gender: null } }),
      this.prisma.user.count({ where: { ...where, isActive: true } }),
      this.prisma.user.count({ where: { ...where, isActive: false } }),
      this.prisma.user.count({
        where: { ...where, nationalId: { not: null } },
      }),
      this.prisma.user.count({
        where: { ...where, imageUrl: { not: null } },
      }),
      this.prisma.user.count({
        where: { ...where, nationalIdCardImageUrl: { not: null } },
      }),
      this.prisma.user.count({
        where: { ...where, createdAt: { gte: today } },
      }),
      this.prisma.user.count({
        where: { ...where, createdAt: { gte: weekStart } },
      }),
      this.prisma.user.count({
        where: { ...where, createdAt: { gte: monthStart } },
      }),
      this.prisma.user.groupBy({
        by: ['province'],
        where: { ...where, province: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      this.prisma.user.groupBy({
        by: ['city'],
        where: { ...where, city: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      this.prisma.user.findMany({
        where,
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5000,
      }),
    ]);

    const weeklyRegistrations = await this.buildWeeklyRegistrationCounts(
      where,
      weekStart,
      today,
    );

    return {
      scope: ownerUserId ? 'mine' : 'all',
      summary: {
        total,
        maleCount,
        femaleCount,
        unknownGenderCount,
        activeCount,
        inactiveCount,
        withNationalIdCount,
        withProfileImageCount,
        withNationalIdCardCount,
        todayRegistrationCount,
        weekRegistrationCount,
        monthRegistrationCount,
      },
      genderBreakdown: [
        { label: 'آقایان', count: maleCount },
        { label: 'بانوان', count: femaleCount },
        { label: 'بدون جنسیت', count: unknownGenderCount },
      ],
      statusBreakdown: [
        { label: 'فعال', count: activeCount },
        { label: 'غیرفعال', count: inactiveCount },
      ],
      profileCompletion: [
        { label: 'کد ملی ثبت‌شده', count: withNationalIdCount },
        { label: 'عکس پروفایل', count: withProfileImageCount },
        { label: 'عکس کارت ملی', count: withNationalIdCardCount },
      ],
      byProvince: this.mapUserGroupBy(provinceGroups, 'province'),
      byCity: this.mapUserGroupBy(cityGroups, 'city'),
      monthlyRegistrations: this.buildMonthlyRegistrations(registrationDates),
      weeklyRegistrations,
    };
  }

  async getMawkibOwnersReport(user: AuthUser): Promise<MawkibOwnersReportResponse> {
    if (!user.roles.includes(RoleName.Admin)) {
      return {
        summary: {
          total: 0,
          activeCount: 0,
          inactiveCount: 0,
          maleCount: 0,
          femaleCount: 0,
          unknownGenderCount: 0,
          withMawkibCount: 0,
        },
        genderBreakdown: [],
        byProvince: [],
        byCity: [],
      };
    }

    const where: Prisma.UserWhereInput = {
      roles: { some: { role: { name: RoleName.MawkibOwner } } },
    };

    const [
      total,
      activeCount,
      inactiveCount,
      maleCount,
      femaleCount,
      unknownGenderCount,
      withMawkibCount,
      provinceGroups,
      cityGroups,
    ] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.count({ where: { ...where, isActive: true } }),
      this.prisma.user.count({ where: { ...where, isActive: false } }),
      this.prisma.user.count({ where: { ...where, gender: UserGender.Male } }),
      this.prisma.user.count({ where: { ...where, gender: UserGender.Female } }),
      this.prisma.user.count({ where: { ...where, gender: null } }),
      this.prisma.user.count({
        where: { ...where, ownedMawkibs: { some: {} } },
      }),
      this.prisma.user.groupBy({
        by: ['province'],
        where: { ...where, province: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      this.prisma.user.groupBy({
        by: ['city'],
        where: { ...where, city: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      summary: {
        total,
        activeCount,
        inactiveCount,
        maleCount,
        femaleCount,
        unknownGenderCount,
        withMawkibCount,
      },
      genderBreakdown: [
        { label: 'آقایان', count: maleCount },
        { label: 'بانوان', count: femaleCount },
        { label: 'بدون جنسیت', count: unknownGenderCount },
      ],
      byProvince: this.mapUserGroupBy(provinceGroups, 'province'),
      byCity: this.mapUserGroupBy(cityGroups, 'city'),
    };
  }

  async getMawkibsReport(user: AuthUser): Promise<MawkibsReportResponse> {
    const ownerUserId = this.resolveOwnerScope(user);
    const where: Prisma.MawkibWhereInput = ownerUserId
      ? { ownerUserId }
      : {};
    const registrationRequestWhere: Prisma.MawkibRegistrationRequestWhereInput =
      ownerUserId ? { ownerUserId } : {};

    const [mawkibs, statusGroups, pendingRegistrationRequests, rejectedRegistrationRequests] =
      await Promise.all([
        this.prisma.mawkib.findMany({
          where,
          select: {
            id: true,
            name: true,
            status: true,
            country: true,
            mawkibCity: true,
            maleCapacity: true,
            femaleCapacity: true,
            onlineReservationEnabled: true,
          },
        }),
        this.prisma.mawkib.groupBy({
          by: ['status'],
          where,
          _count: { _all: true },
        }),
        this.prisma.mawkibRegistrationRequest.count({
          where: {
            ...registrationRequestWhere,
            status: RegistrationRequestStatus.Pending,
          },
        }),
        this.prisma.mawkibRegistrationRequest.count({
          where: {
            ...registrationRequestWhere,
            status: RegistrationRequestStatus.Rejected,
          },
        }),
      ]);

    const statusCount = new Map<MawkibStatus, number>(
      statusGroups.map((row) => [row.status, row._count._all]),
    );

    const today = startOfAppDay();
    const todayDate = formatDateOnlyInAppTz(new Date());
    const capacitySources = mawkibs.map((m) => ({
      id: m.id,
      maleCapacity: m.maleCapacity,
      femaleCapacity: m.femaleCapacity,
    }));
    const snapshots = await this.inventoryService.getSnapshotsForMawkibsOnDate(
      capacitySources,
      today,
    );

    let todayMaleGuests = 0;
    let todayFemaleGuests = 0;

    const todayGuestByMawkib: MawkibTodayGuestItem[] = mawkibs.map((mawkib) => {
      const snapshot = snapshots.get(mawkib.id);
      const maleGuests = snapshot
        ? Math.max(0, mawkib.maleCapacity - snapshot.availableMale)
        : 0;
      const femaleGuests = snapshot
        ? Math.max(0, mawkib.femaleCapacity - snapshot.availableFemale)
        : 0;
      todayMaleGuests += maleGuests;
      todayFemaleGuests += femaleGuests;
      return {
        mawkibId: mawkib.id,
        mawkibName: mawkib.name,
        maleGuests,
        femaleGuests,
        totalGuests: maleGuests + femaleGuests,
        maleCapacity: mawkib.maleCapacity,
        femaleCapacity: mawkib.femaleCapacity,
      };
    });

    todayGuestByMawkib.sort((a, b) => b.totalGuests - a.totalGuests);

    const countryMap = new Map<string, number>();
    const cityMap = new Map<string, number>();

    const countryLabels: Record<MawkibCountry, string> = {
      Iran: 'ایران',
      Iraq: 'عراق',
    };

    const cityLabels: Record<MawkibCity, string> = {
      Mashhad: 'مشهد',
      Qom: 'قم',
      Najaf: 'نجف',
      Karbala: 'کربلا',
    };

    let totalMaleCapacity = 0;
    let totalFemaleCapacity = 0;
    let onlineReservationEnabledCount = 0;

    for (const mawkib of mawkibs) {
      totalMaleCapacity += mawkib.maleCapacity;
      totalFemaleCapacity += mawkib.femaleCapacity;
      if (mawkib.onlineReservationEnabled) onlineReservationEnabledCount += 1;

      const country = countryLabels[mawkib.country] ?? 'نامشخص';
      const city = mawkib.mawkibCity
        ? cityLabels[mawkib.mawkibCity]
        : 'نامشخص';
      countryMap.set(country, (countryMap.get(country) ?? 0) + 1);
      cityMap.set(city, (cityMap.get(city) ?? 0) + 1);
    }

    const toSortedItems = (map: Map<string, number>) =>
      Array.from(map.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const statusLabels: Record<MawkibStatus, string> = {
      Approved: 'تایید شده',
      Pending: 'در انتظار',
      Rejected: 'رد شده',
    };

    const approvedCount = statusCount.get(MawkibStatus.Approved) ?? 0;
    const pendingMawkibCount = statusCount.get(MawkibStatus.Pending) ?? 0;
    const rejectedMawkibCount = statusCount.get(MawkibStatus.Rejected) ?? 0;
    const pendingCount = pendingMawkibCount + pendingRegistrationRequests;
    const rejectedCount = rejectedMawkibCount + rejectedRegistrationRequests;
    const approvalScopeTotal =
      mawkibs.length + pendingRegistrationRequests + rejectedRegistrationRequests;

    return {
      scope: ownerUserId ? 'mine' : 'all',
      summary: {
        total: mawkibs.length,
        approvedCount,
        pendingCount,
        rejectedCount,
        pendingRegistrationRequestCount: pendingRegistrationRequests,
        rejectedRegistrationRequestCount: rejectedRegistrationRequests,
        totalMaleCapacity,
        totalFemaleCapacity,
        onlineReservationEnabledCount,
        todayMaleGuests,
        todayFemaleGuests,
        todayTotalGuests: todayMaleGuests + todayFemaleGuests,
      },
      statusBreakdown: (['Approved', 'Pending', 'Rejected'] as MawkibStatus[]).map(
        (status) => ({
          label: statusLabels[status],
          count:
            status === MawkibStatus.Approved
              ? approvedCount
              : status === MawkibStatus.Pending
                ? pendingCount
                : rejectedCount,
        }),
      ),
      approvalScopeTotal,
      byProvince: toSortedItems(countryMap),
      byCity: toSortedItems(cityMap),
      todayDate,
      todayGuestByMawkib,
    };
  }

  async getReservationsReport(user: AuthUser): Promise<ReservationsReportResponse> {
    const ownerUserId = this.resolveOwnerScope(user);
    return buildReservationsReport(this.prisma, this.inventoryService, ownerUserId);
  }
}
