import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MawkibStatus,
  Prisma,
  ReservationDeliveredItemStatus,
  ReservationEventType,
  ReservationPresenceState,
  ReservationStatus,
  RoleName,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MawkibsService } from '../mawkibs/mawkibs.service';
import {
  CancelReservationDto,
  CreateReservationDto,
  CreateGuestReservationDto,
  ExtendReservationDto,
  RecordReservationAttendanceDto,
  SearchReservationDto,
  UpdateReservationStatusDto,
} from './dto/reservation.dto';
import {
  CreateReservationReviewDto,
  ReplyReservationReviewDto,
} from './dto/reservation-review.dto';
import {
  CreateReservationDeliveredItemDto,
  UpdateReservationDeliveredItemDto,
} from './dto/reservation-delivered-item.dto';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { ReservationEventsService } from './reservation-events.service';
import { assertUniqueAttendanceSecond } from './reservation-event.util';
import { parseDateOnly, formatDateOnly, formatDateOnlyInAppTz, startOfAppDay, APP_TIMEZONE, isRecordedAtBeforeCheckInMinute } from '../common/utils/date.util';
import { allocateNextReservationTrackingCode } from '../common/utils/reservation-code.util';
import {
  buildExactMobileLookupVariants,
  buildMobileSearchPatterns,
  isCompleteMobileNumber,
  mobileDigitMatches,
  mobilesAreExactlyEqual,
  normalizeMobileDigits,
} from '../common/utils/mobile-search.util';
import { lookupQueryVariants } from '../common/utils/lookup-query.util';
import {
  BLOCKING_RESERVATION_STATUSES,
  isExactReservationDuplicate,
} from './reservation-conflict.util';
import { assertHasGuestCount } from './reservation-guest-count.util';
import { resolvePlannedTimes } from './reservation-occupancy.util';
import {
  computeExtensionEndDate,
  computeExtensionStartDate,
  defaultExtensionEndDate,
} from './reservation-extend.util';
import {
  parseReservationIdLookup,
  rankReservationsByLookupQuery,
} from './reservation-lookup.util';
import { MealPlansService } from '../meal-plans/meal-plans.service';
import { AttendanceRosterKind } from './dto/attendance-roster.dto';
import { resolveAbsentRosterContext } from './attendance-roster.util';

const reviewUserSelect = {
  id: true,
  fullName: true,
} as const;

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
} satisfies Prisma.ReservationInclude;

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
} satisfies Prisma.ReservationInclude;

export interface PaginatedReservationsResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private mawkibsService: MawkibsService,
    private usersService: UsersService,
    private reservationEventsService: ReservationEventsService,
    private mealPlansService: MealPlansService,
  ) {}

  private async maybeGenerateMealPlans(reservation: {
    id: number;
    mawkibId: number;
    reservationDate: Date;
    reservationEndDate: Date;
  }) {
    await this.mealPlansService.autoGenerateForNewReservation({
      reservationId: reservation.id,
      mawkibId: reservation.mawkibId,
      reservationDate: reservation.reservationDate,
      reservationEndDate: reservation.reservationEndDate,
    });
  }

  private statusAuditFields(userId: number): {
    lastStatusUpdatedByUserId: number;
    lastStatusUpdatedAt: Date;
  } {
    return {
      lastStatusUpdatedByUserId: userId,
      lastStatusUpdatedAt: new Date(),
    };
  }

  private appendWhereAnd(
    where: Prisma.ReservationWhereInput,
    clause: Prisma.ReservationWhereInput,
  ) {
    const existingAnd = where.AND
      ? Array.isArray(where.AND)
        ? where.AND
        : [where.AND]
      : [];
    where.AND = [...existingAnd, clause];
  }

  private buildReservationLookupOrConditions(
    query: string,
    exact = false,
  ): Prisma.ReservationWhereInput[] {
    const variants = lookupQueryVariants(query);
    const seen = new Set<string>();
    const conditions: Prisma.ReservationWhereInput[] = [];

    for (const q of variants) {
      if (!q || seen.has(q)) continue;
      seen.add(q);
      conditions.push(...this.buildReservationLookupOrConditionsForQuery(q, exact));
    }

    return conditions;
  }

  private buildReservationLookupOrConditionsForQuery(
    query: string,
    exact = false,
  ): Prisma.ReservationWhereInput[] {
    const q = query.trim();
    const conditions: Prisma.ReservationWhereInput[] = [];

    if (exact) {
      const id = parseReservationIdLookup(q);
      if (id != null) {
        conditions.push({ id });
      }

      conditions.push({
        trackingCode: { equals: q, mode: 'insensitive' },
      });

      const mobileVariants = buildExactMobileLookupVariants(q);
      if (mobileVariants.length > 0) {
        conditions.push(
          { pilgrimMobile: { in: mobileVariants } },
          {
            pilgrim: {
              mobileNumber: { in: mobileVariants },
            },
          },
        );
      }

      conditions.push({
        pilgrim: {
          nationalId: { equals: q, mode: 'insensitive' },
        },
      });

      return conditions;
    }

    const id = parseReservationIdLookup(q);
    if (id != null) {
      conditions.push({ id });
      conditions.push(
        { trackingCode: { equals: q, mode: 'insensitive' } },
        { trackingCode: { endsWith: `-${q}`, mode: 'insensitive' } },
      );
    }

    conditions.push(
      { trackingCode: { contains: q, mode: 'insensitive' } },
      { pilgrimMobile: { contains: q, mode: 'insensitive' } },
      {
        pilgrim: {
          mobileNumber: { contains: q, mode: 'insensitive' },
        },
      },
      {
        pilgrim: {
          nationalId: { contains: q, mode: 'insensitive' },
        },
      },
    );

    const digits = normalizeMobileDigits(q);
    if (digits && digits !== q) {
      conditions.push(
        { pilgrimMobile: { contains: digits, mode: 'insensitive' } },
        {
          pilgrim: {
            mobileNumber: { contains: digits, mode: 'insensitive' },
          },
        },
        {
          pilgrim: {
            nationalId: { contains: digits, mode: 'insensitive' },
          },
        },
      );
    }

    for (const pattern of buildMobileSearchPatterns(q)) {
      if (pattern === q || pattern === digits) continue;
      conditions.push(
        { pilgrimMobile: { contains: pattern, mode: 'insensitive' } },
        {
          pilgrim: {
            mobileNumber: { contains: pattern, mode: 'insensitive' },
          },
        },
      );
    }

    return conditions;
  }

  private buildSearchWhere(
    search?: SearchReservationDto,
  ): Prisma.ReservationWhereInput {
    if (!search) return {};

    const where: Prisma.ReservationWhereInput = {};
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
      const fromDate = search.createdAtFrom ?? search.createdAtTo!;
      const toDate = search.createdAtTo ?? search.createdAtFrom!;
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
        OR: this.buildReservationLookupOrConditions(
          lookupQuery,
          search.lookupExact,
        ),
      });
    } else if (search.trackingCode) {
      where.trackingCode = {
        contains: search.trackingCode.trim(),
        mode: 'insensitive',
      };
    }

    if (
      !lookupQuery &&
      (search.pilgrimName ||
        search.pilgrimMobile ||
        search.pilgrimNationalId)
    ) {
      const pilgrimFilters: Prisma.ReservationWhereInput[] = [];

      if (search.pilgrimName) {
        pilgrimFilters.push({
          pilgrim: {
            fullName: { contains: search.pilgrimName, mode: 'insensitive' },
          },
        });
      }

      if (search.pilgrimMobile) {
        const patterns = buildMobileSearchPatterns(search.pilgrimMobile);
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
      } else {
        const existingAnd = where.AND
          ? Array.isArray(where.AND)
            ? where.AND
            : [where.AND]
          : [];
        where.AND = [...existingAnd, ...pilgrimFilters];
      }
    }
    if (search.guestCountMin || search.guestCountMax) {
      // فیلتر بر اساس مجموع نفرات — پس از واکشی اعمال می‌شود
    }

    return where;
  }

  private filterByGuestCountTotal<
    T extends { maleGuestCount: number; femaleGuestCount: number },
  >(items: T[], search?: SearchReservationDto): T[] {
    if (!search?.guestCountMin && !search?.guestCountMax) return items;
    return items.filter((item) => {
      const total = item.maleGuestCount + item.femaleGuestCount;
      if (search.guestCountMin && total < search.guestCountMin) return false;
      if (search.guestCountMax && total > search.guestCountMax) return false;
      return true;
    });
  }

  private sortByCreatedAt<
    T extends { reservationDate: Date; createdAt: Date },
  >(items: T[], search?: SearchReservationDto): T[] {
    const order = search?.sortOrder ?? 'desc';
    return [...items].sort((a, b) => {
      const createdDiff = a.createdAt.getTime() - b.createdAt.getTime();
      if (createdDiff !== 0) {
        return order === 'asc' ? createdDiff : -createdDiff;
      }

      const dateDiff =
        a.reservationDate.getTime() - b.reservationDate.getTime();
      return order === 'asc' ? dateDiff : -dateDiff;
    });
  }

  private applyLookupRanking<
    T extends {
      id: number;
      trackingCode: string;
      pilgrimMobile: string;
      pilgrim: { mobileNumber: string; nationalId?: string | null };
    },
  >(items: T[], search?: SearchReservationDto): T[] {
    const lookupQuery = search?.lookupQuery?.trim();
    if (!lookupQuery) return items;

    const ranked = rankReservationsByLookupQuery(
      items,
      lookupQuery,
      search?.lookupExact,
    );
    if (search?.lookupSingle) {
      return ranked.length > 0 ? [ranked[0]] : [];
    }
    return ranked;
  }

  private applyListPagination<T>(
    items: T[],
    search?: SearchReservationDto,
  ): T[] | PaginatedReservationsResult<T> {
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

  async findAllAdmin(search?: SearchReservationDto) {
    const items = await this.prisma.reservation.findMany({
      where: this.buildSearchWhere(search),
      include: reservationInclude,
      orderBy: { createdAt: 'desc' },
    });
    const filtered = this.sortByCreatedAt(
      this.applyLookupRanking(
        this.filterReservationsByMobileSearch(
          this.filterByGuestCountTotal(items, search),
          search,
        ),
        search,
      ),
      search,
    );
    return this.applyListPagination(filtered, search);
  }

  async findByPilgrim(pilgrimUserId: number, search?: SearchReservationDto) {
    const items = await this.prisma.reservation.findMany({
      where: {
        pilgrimUserId,
        ...this.buildSearchWhere(search),
      },
      include: reservationInclude,
      orderBy: { createdAt: 'desc' },
    });
    const filtered = this.sortByCreatedAt(
      this.applyLookupRanking(
        this.filterReservationsByMobileSearch(
          this.filterByGuestCountTotal(items, search),
          search,
        ),
        search,
      ),
      search,
    );
    return this.applyListPagination(filtered, search);
  }

  async findByMawkibOwner(ownerUserId: number, search?: SearchReservationDto) {
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
      orderBy: { createdAt: 'desc' },
    });
    const filtered = this.sortByCreatedAt(
      this.applyLookupRanking(
        this.filterReservationsByMobileSearch(
          this.filterByGuestCountTotal(items, search),
          search,
        ),
        search,
      ),
      search,
    );
    return this.applyListPagination(filtered, search);
  }

  async getPendingCountsByMawkib(user: AuthUser) {
    const isAdmin = user.roles.includes(RoleName.Admin);
    const isMawkibOwner = user.roles.includes(RoleName.MawkibOwner);

    if (!isAdmin && !isMawkibOwner) {
      throw new ForbiddenException('شما مجوز دسترسی به این اطلاعات را ندارید');
    }

    const where: Prisma.ReservationWhereInput = {
      status: ReservationStatus.Pending,
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

  private pickReservationForPilgrimCard<
    T extends {
      status: ReservationStatus;
      reservationDate: Date;
    },
  >(reservations: T[]): T | null {
    const statusPriority: Record<ReservationStatus, number> = {
      [ReservationStatus.Confirmed]: 0,
      [ReservationStatus.Completed]: 1,
      [ReservationStatus.Pending]: 2,
      [ReservationStatus.Cancelled]: 99,
    };

    const eligible = reservations.filter(
      (item) => item.status !== ReservationStatus.Cancelled,
    );
    if (eligible.length === 0) return null;

    return [...eligible].sort((a, b) => {
      const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
      if (priorityDiff !== 0) return priorityDiff;
      return b.reservationDate.getTime() - a.reservationDate.getTime();
    })[0];
  }

  async findLatestForPilgrimCard(
    pilgrimUserId: number,
    user: AuthUser,
    ownerScope = false,
  ) {
    const isAdmin = user.roles.includes(RoleName.Admin);
    const isMawkibOwner = user.roles.includes(RoleName.MawkibOwner);

    if (!isAdmin && !isMawkibOwner) {
      throw new ForbiddenException('شما مجوز دسترسی به این اطلاعات را ندارید');
    }

    const search: SearchReservationDto = { pilgrimUserId, all: true };
    const useOwnerScope = ownerScope
      ? isMawkibOwner
      : !isAdmin && isMawkibOwner;

    const result = useOwnerScope
      ? await this.findByMawkibOwner(user.id, search)
      : await this.findAllAdmin(search);

    const reservations = Array.isArray(result) ? result : [];
    return this.pickReservationForPilgrimCard(reservations);
  }

  private filterReservationsByMobileSearch<
    T extends {
      pilgrimMobile: string;
      pilgrim: { mobileNumber: string };
    },
  >(items: T[], search?: SearchReservationDto): T[] {
    if (search?.lookupQuery?.trim()) return items;
    if (!search?.pilgrimMobile?.trim()) return items;

    const searchDigits = normalizeMobileDigits(search.pilgrimMobile);
    return items.filter(
      (item) =>
        mobileDigitMatches(searchDigits, item.pilgrimMobile) ||
        mobileDigitMatches(searchDigits, item.pilgrim.mobileNumber),
    );
  }

  async findOne(id: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: reservationInclude,
    });

    if (!reservation) {
      throw new NotFoundException('رزرو یافت نشد');
    }

    return reservation;
  }

  async findByTrackingCode(trackingCode: string) {
    const code = trackingCode.trim();
    if (!code) {
      throw new BadRequestException('کد رزرو الزامی است');
    }

    const reservation = await this.prisma.reservation.findUnique({
      where: { trackingCode: code },
      include: reservationInclude,
    });

    if (!reservation) {
      throw new NotFoundException('رزروی با این کد یافت نشد');
    }

    return reservation;
  }

  async findRecentByMobileForGuest(mobileNumber: string) {
    const mobile = mobileNumber.trim();
    if (!mobile) {
      throw new BadRequestException('شماره موبایل الزامی است');
    }

    const patterns = buildMobileSearchPatterns(mobile);
    if (patterns.length === 0) {
      throw new BadRequestException('شماره موبایل نامعتبر است');
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

    const searchDigits = normalizeMobileDigits(mobile);
    const matched = reservations.filter(
      (reservation) =>
        mobileDigitMatches(searchDigits, reservation.pilgrimMobile) ||
        mobileDigitMatches(searchDigits, reservation.pilgrim.mobileNumber),
    );

    if (matched.length === 0) {
      throw new NotFoundException('رزروی با این شماره موبایل یافت نشد');
    }

    return matched.slice(0, 2);
  }

  async findRecentByExactMobileForGuest(mobileNumber: string) {
    const mobile = mobileNumber.trim();
    if (!mobile) {
      throw new BadRequestException('شماره موبایل الزامی است');
    }

    if (!isCompleteMobileNumber(mobile)) {
      throw new BadRequestException('شماره موبایل باید به‌صورت کامل وارد شود');
    }

    const lookupVariants = buildExactMobileLookupVariants(mobile);
    if (lookupVariants.length === 0) {
      throw new BadRequestException('شماره موبایل نامعتبر است');
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

    const matched = reservations.filter(
      (reservation) =>
        mobilesAreExactlyEqual(mobile, reservation.pilgrimMobile) ||
        mobilesAreExactlyEqual(mobile, reservation.pilgrim.mobileNumber),
    );

    if (matched.length === 0) {
      throw new NotFoundException('رزروی با این شماره موبایل یافت نشد');
    }

    return matched.slice(0, 2);
  }

  async findOneForUser(id: number, currentUser: AuthUser) {
    const reservation = await this.findOne(id);
    const isAdmin = currentUser.roles.includes(RoleName.Admin);
    const isOwner = currentUser.roles.includes(RoleName.MawkibOwner);

    if (isAdmin) {
      return reservation;
    }

    if (isOwner) {
      await this.mawkibsService.assertOwnerAccess(
        reservation.mawkibId,
        currentUser.id,
      );
      return reservation;
    }

    if (
      reservation.pilgrimUserId !== currentUser.id &&
      reservation.reservedByUserId !== currentUser.id
    ) {
      throw new ForbiddenException('شما مجوز مشاهده این رزرو را ندارید');
    }

    return reservation;
  }

  private async assertTrackingCodeAvailable(trackingCode: string) {
    const existing = await this.prisma.reservation.findUnique({
      where: { trackingCode },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException('این کد رزرو قبلاً ثبت شده است');
    }
  }

  private async createWithTrackingCode(
    data: Omit<Prisma.ReservationUncheckedCreateInput, 'trackingCode'>,
    options?: {
      customTrackingCode?: string;
      allowCustomTrackingCode?: boolean;
    },
    include: Prisma.ReservationInclude = reservationInclude,
  ) {
    assertHasGuestCount(data.maleGuestCount, data.femaleGuestCount);

    const trimmedCustom = options?.customTrackingCode?.trim();

    if (trimmedCustom) {
      if (!options?.allowCustomTrackingCode) {
        throw new ForbiddenException('شما مجوز تعیین کد رزرو را ندارید');
      }

      if (trimmedCustom.length > 64) {
        throw new BadRequestException('کد رزرو حداکثر ۶۴ کاراکتر می‌تواند باشد');
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
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new BadRequestException('این کد رزرو قبلاً ثبت شده است');
        }
        throw error;
      }
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const trackingCode = await allocateNextReservationTrackingCode(
          this.prisma,
        );
        return await this.prisma.reservation.create({
          data: {
            ...data,
            trackingCode,
          },
          include,
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          continue;
        }
        throw error;
      }
    }

    throw new BadRequestException('خطا در تولید شناسه رزرو');
  }

  private async assertNoConflictingReservation(params: {
    pilgrimUserId: number;
    mawkibId: number;
    reservationDate: Date;
    reservationEndDate: Date;
    maleGuestCount: number;
    femaleGuestCount: number;
    excludeReservationId?: number;
  }) {
    const conflict = await this.prisma.reservation.findFirst({
      where: {
        pilgrimUserId: params.pilgrimUserId,
        status: { in: BLOCKING_RESERVATION_STATUSES },
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

    if (isExactReservationDuplicate(conflict, candidate)) {
      this.throwReservationConflict(conflict, true);
    }

    this.throwReservationConflict(conflict, false);
  }

  private throwReservationConflict(
    conflict: {
      trackingCode: string;
      reservationDate: Date;
      reservationEndDate: Date;
      mawkib: { name: string } | null;
    },
    exactDuplicate: boolean,
  ) {
    const conflictPayload = {
      trackingCode: conflict.trackingCode,
      mawkibName: conflict.mawkib?.name ?? null,
      reservationDate: formatDateOnly(conflict.reservationDate),
      reservationEndDate: formatDateOnly(conflict.reservationEndDate),
    };

    const message = exactDuplicate
      ? 'متاسفانه این رزرو با رزروهای قبلی شما در سامانه تداخل دارد'
      : `این زائر در بازه تاریخ انتخابی رزرو فعال دیگری دارد (کد: ${conflict.trackingCode}${conflict.mawkib?.name ? ` — ${conflict.mawkib.name}` : ''})`;

    throw new BadRequestException({
      message,
      error: 'ReservationConflict',
      conflict: conflictPayload,
    });
  }

  async create(dto: CreateReservationDto, currentUser: AuthUser) {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: dto.mawkibId },
    });

    if (!mawkib || mawkib.status !== MawkibStatus.Approved) {
      throw new BadRequestException('موکب یافت نشد یا تایید نشده است');
    }

    this.mawkibsService.assertOnlineReservationAllowed(mawkib, currentUser);

    const isAdmin = currentUser.roles.includes(RoleName.Admin);
    const isOwner = currentUser.roles.includes(RoleName.MawkibOwner);

    if (!isAdmin && isOwner) {
      await this.mawkibsService.assertOwnerAccess(dto.mawkibId, currentUser.id);
    }

    const reservationDate = parseDateOnly(dto.reservationDate);
    const reservationEndDate = parseDateOnly(
      dto.reservationEndDate ?? dto.reservationDate,
    );

    if (reservationEndDate < reservationDate) {
      throw new BadRequestException(
        'تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد',
      );
    }

    await this.mawkibsService.assertReservationServiceStart(
      dto.mawkibId,
      reservationDate,
    );

    await this.mawkibsService.assertMaxReservationDays(
      dto.mawkibId,
      reservationDate,
      reservationEndDate,
    );

    const skipCapacity = dto.skipCapacityCheck === true && (isAdmin || isOwner);

    if (dto.skipCapacityCheck === true && !isAdmin && !isOwner) {
      throw new ForbiddenException(
        'شما مجوز ثبت رزرو بدون بررسی ظرفیت را ندارید',
      );
    }

    if (dto.trackingCode && !isAdmin && !isOwner) {
      throw new ForbiddenException('شما مجوز تعیین کد رزرو را ندارید');
    }

    if (!skipCapacity) {
      await this.mawkibsService.assertCapacityInRange(
        dto.mawkibId,
        dto.maleGuestCount,
        dto.femaleGuestCount,
        reservationDate,
        reservationEndDate,
      );
    }

    let pilgrimUserId: number;

    if (dto.pilgrimUserId) {
      const pilgrim = await this.prisma.user.findUnique({
        where: { id: dto.pilgrimUserId },
      });
      if (!pilgrim) {
        throw new NotFoundException('زائر یافت نشد');
      }
      pilgrimUserId = pilgrim.id;
    } else {
      const pilgrim = await this.prisma.user.findUnique({
        where: { mobileNumber: dto.pilgrimMobile },
      });
      if (!pilgrim) {
        throw new NotFoundException(
          'زائر با این شماره موبایل یافت نشد. ابتدا کاربر را ثبت کنید',
        );
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

    const plannedTimes = resolvePlannedTimes(dto, mawkib);

    const autoConfirmed = isAdmin || isOwner;
    const checkInOnConfirm = autoConfirmed
      ? this.resolveActualCheckInOnConfirm(mawkib, null)
      : undefined;

    const reservation = await this.createWithTrackingCode(
      {
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
          ? ReservationStatus.Confirmed
          : ReservationStatus.Pending,
        ...(autoConfirmed ? this.statusAuditFields(currentUser.id) : {}),
        ...(checkInOnConfirm ? { actualCheckInAt: checkInOnConfirm } : {}),
      },
      {
        customTrackingCode: dto.trackingCode,
        allowCustomTrackingCode: isAdmin || isOwner,
      },
    );

    await this.syncCheckInEventOnConfirm(
      reservation.id,
      checkInOnConfirm,
      currentUser.id,
    );

    if (reservation.status === ReservationStatus.Confirmed) {
      await this.mawkibsService.syncInventoryOnReservationConfirmed(
        reservation,
      );
    }

    await this.maybeGenerateMealPlans(reservation);

    return reservation;
  }

  async createGuest(dto: CreateGuestReservationDto) {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: dto.mawkibId },
    });

    if (!mawkib || mawkib.status !== MawkibStatus.Approved) {
      throw new BadRequestException('موکب یافت نشد یا تایید نشده است');
    }

    this.mawkibsService.assertOnlineReservationAllowed(mawkib);

    const reservationDate = parseDateOnly(dto.reservationDate);
    const reservationEndDate = parseDateOnly(
      dto.reservationEndDate ?? dto.reservationDate,
    );

    if (reservationEndDate < reservationDate) {
      throw new BadRequestException(
        'تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد',
      );
    }

    await this.mawkibsService.assertReservationServiceStart(
      dto.mawkibId,
      reservationDate,
    );

    await this.mawkibsService.assertMaxReservationDays(
      dto.mawkibId,
      reservationDate,
      reservationEndDate,
    );

    await this.mawkibsService.assertCapacityInRange(
      dto.mawkibId,
      dto.maleGuestCount,
      dto.femaleGuestCount,
      reservationDate,
      reservationEndDate,
    );

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

    const plannedTimes = resolvePlannedTimes(dto, mawkib);

    const autoApproved = mawkib.autoApprovePilgrimReservations === true;
    const initialStatus = autoApproved
      ? ReservationStatus.Confirmed
      : ReservationStatus.Pending;
    const checkInOnConfirm =
      initialStatus === ReservationStatus.Confirmed
        ? this.resolveActualCheckInOnConfirm(mawkib, null)
        : undefined;

    const reservation = await this.createWithTrackingCode(
      {
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
      },
      undefined,
      {
        mawkib: {
          select: {
            id: true,
            name: true,
            defaultCheckInTime: true,
            defaultCheckOutTime: true,
          },
        },
      },
    );

    await this.syncCheckInEventOnConfirm(
      reservation.id,
      checkInOnConfirm,
      pilgrim.id,
    );

    if (reservation.status === ReservationStatus.Confirmed) {
      await this.mawkibsService.syncInventoryOnReservationConfirmed(
        reservation,
      );
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

  async updateStatus(
    id: number,
    dto: UpdateReservationStatusDto,
    currentUser: AuthUser,
  ) {
    const reservation = await this.findOne(id);
    const isAdmin = currentUser.roles.includes(RoleName.Admin);
    const isOwner = currentUser.roles.includes(RoleName.MawkibOwner);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('شما مجوز تغییر وضعیت رزرو را ندارید');
    }

    if (isOwner && !isAdmin) {
      await this.mawkibsService.assertOwnerAccess(
        reservation.mawkibId,
        currentUser.id,
      );
    }

    if (
      dto.status === ReservationStatus.Confirmed &&
      reservation.status !== ReservationStatus.Pending
    ) {
      throw new BadRequestException('فقط رزروهای در انتظار قابل تایید هستند');
    }

    if (dto.status === ReservationStatus.Confirmed) {
      const endDate =
        reservation.reservationEndDate ?? reservation.reservationDate;

      await this.assertNoConflictingReservation({
        pilgrimUserId: reservation.pilgrimUserId,
        mawkibId: reservation.mawkibId,
        reservationDate: reservation.reservationDate,
        reservationEndDate: endDate,
        maleGuestCount: reservation.maleGuestCount,
        femaleGuestCount: reservation.femaleGuestCount,
        excludeReservationId: reservation.id,
      });

      await this.mawkibsService.assertCapacityInRange(
        reservation.mawkibId,
        reservation.maleGuestCount,
        reservation.femaleGuestCount,
        reservation.reservationDate,
        endDate,
      );
    }

    let checkInOnConfirm: Date | undefined;
    if (
      dto.status === ReservationStatus.Confirmed &&
      reservation.status === ReservationStatus.Pending
    ) {
      const mawkibSettings = await this.prisma.mawkib.findUnique({
        where: { id: reservation.mawkibId },
        select: { recordCheckInOnReservationConfirm: true },
      });
      if (mawkibSettings) {
        checkInOnConfirm = this.resolveActualCheckInOnConfirm(
          mawkibSettings,
          reservation.actualCheckInAt,
        );
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

    await this.syncCheckInEventOnConfirm(
      updated.id,
      checkInOnConfirm,
      currentUser.id,
    );

    if (
      dto.status === ReservationStatus.Confirmed &&
      reservation.status === ReservationStatus.Pending
    ) {
      await this.mawkibsService.syncInventoryOnReservationConfirmed(updated);
    }

    return updated;
  }

  async cancel(id: number, dto: CancelReservationDto, currentUser: AuthUser) {
    const reservation = await this.findOne(id);
    const isAdmin = currentUser.roles.includes(RoleName.Admin);
    const isOwner = currentUser.roles.includes(RoleName.MawkibOwner);
    const isPilgrim = currentUser.roles.includes(RoleName.Pilgrim);

    if (reservation.status === ReservationStatus.Cancelled) {
      throw new BadRequestException('این رزرو قبلاً لغو شده است');
    }

    if (reservation.status === ReservationStatus.Completed) {
      throw new BadRequestException('رزرو تکمیل‌شده قابل لغو نیست');
    }

    this.assertConfirmedReservationStillActive(reservation);

    if (isAdmin) {
      // full access
    } else if (isPilgrim && !isAdmin && !isOwner) {
      if (reservation.pilgrimUserId !== currentUser.id) {
        throw new ForbiddenException(
          'فقط رزروهای خودتان را می‌توانید لغو کنید',
        );
      }
    } else if (isOwner && !isAdmin) {
      await this.mawkibsService.assertOwnerAccess(
        reservation.mawkibId,
        currentUser.id,
      );
    } else {
      throw new ForbiddenException('شما مجوز لغو این رزرو را ندارید');
    }

    const note = dto.note?.trim() || undefined;
    const isStaffCancel = isAdmin || isOwner;

    if (reservation.status === ReservationStatus.Confirmed) {
      await this.mawkibsService.syncInventoryOnReservationCancelled(
        reservation,
      );
    }

    return this.prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.Cancelled,
        cancellationNote: note,
        ...(isStaffCancel ? this.statusAuditFields(currentUser.id) : {}),
      },
      include: reservationInclude,
    });
  }

  async extend(
    sourceId: number,
    dto: ExtendReservationDto,
    currentUser: AuthUser,
  ) {
    const source = await this.findOne(sourceId);
    const isAdmin = currentUser.roles.includes(RoleName.Admin);
    const isOwner = currentUser.roles.includes(RoleName.MawkibOwner);
    const isPilgrimOnly =
      currentUser.roles.includes(RoleName.Pilgrim) && !isAdmin && !isOwner;

    if (
      source.status !== ReservationStatus.Confirmed &&
      source.status !== ReservationStatus.Completed
    ) {
      throw new BadRequestException(
        'فقط رزروهای تایید شده یا تکمیل‌شده قابل تمدید هستند',
      );
    }

    if (isAdmin) {
      // full access
    } else if (isOwner) {
      await this.mawkibsService.assertOwnerAccess(
        source.mawkibId,
        currentUser.id,
      );
    } else if (isPilgrimOnly) {
      if (source.pilgrimUserId !== currentUser.id) {
        throw new ForbiddenException(
          'فقط رزروهای خودتان را می‌توانید تمدید کنید',
        );
      }
    } else {
      throw new ForbiddenException('شما مجوز تمدید این رزرو را ندارید');
    }

    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: source.mawkibId },
    });

    if (!mawkib || mawkib.status !== MawkibStatus.Approved) {
      throw new BadRequestException('موکب یافت نشد یا تایید نشده است');
    }

    this.mawkibsService.assertOnlineReservationAllowed(mawkib, currentUser);

    const extensionStartStr = computeExtensionStartDate(
      source.reservationEndDate ?? source.reservationDate,
    );
    const extensionStart = parseDateOnly(extensionStartStr);

    let extensionEnd: Date;

    if (isPilgrimOnly) {
      if (dto.reservationEndDate || dto.stayDays) {
        throw new BadRequestException(
          'زائر نمی‌تواند بازه تمدید را به‌صورت دستی تنظیم کند',
        );
      }
      extensionEnd = parseDateOnly(
        defaultExtensionEndDate(
          source.reservationEndDate,
          mawkib.defaultReservationDays,
        ),
      );
    } else {
      if (dto.reservationEndDate) {
        extensionEnd = parseDateOnly(dto.reservationEndDate);
      } else if (dto.stayDays) {
        extensionEnd = parseDateOnly(
          computeExtensionEndDate(extensionStartStr, dto.stayDays),
        );
      } else {
        extensionEnd = parseDateOnly(
          defaultExtensionEndDate(
            source.reservationEndDate,
            mawkib.defaultReservationDays,
          ),
        );
      }
    }

    if (extensionEnd < extensionStart) {
      throw new BadRequestException(
        'تاریخ پایان تمدید نمی‌تواند قبل از تاریخ شروع باشد',
      );
    }

    await this.mawkibsService.assertReservationServiceStart(
      source.mawkibId,
      extensionStart,
    );

    await this.mawkibsService.assertMaxReservationDays(
      source.mawkibId,
      extensionStart,
      extensionEnd,
    );

    await this.mawkibsService.assertCapacityInRange(
      source.mawkibId,
      source.maleGuestCount,
      source.femaleGuestCount,
      extensionStart,
      extensionEnd,
    );

    await this.assertNoConflictingReservation({
      pilgrimUserId: source.pilgrimUserId,
      mawkibId: source.mawkibId,
      reservationDate: extensionStart,
      reservationEndDate: extensionEnd,
      maleGuestCount: source.maleGuestCount,
      femaleGuestCount: source.femaleGuestCount,
      excludeReservationId: sourceId,
    });

    const plannedTimes = resolvePlannedTimes(
      {
        plannedCheckInTime: source.plannedCheckInTime ?? undefined,
        plannedCheckOutTime: source.plannedCheckOutTime ?? undefined,
      },
      mawkib,
    );

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
        ? ReservationStatus.Confirmed
        : ReservationStatus.Pending,
      ...(autoConfirmed ? this.statusAuditFields(currentUser.id) : {}),
      ...(checkInOnConfirm ? { actualCheckInAt: checkInOnConfirm } : {}),
    });

    await this.syncCheckInEventOnConfirm(
      reservation.id,
      checkInOnConfirm,
      currentUser.id,
    );

    if (reservation.status === ReservationStatus.Confirmed) {
      await this.mawkibsService.syncInventoryOnReservationConfirmed(
        reservation,
      );
    }

    await this.maybeGenerateMealPlans(reservation);

    return reservation;
  }

  async remove(id: number) {
    const reservation = await this.findOne(id);

    if (reservation.status === ReservationStatus.Confirmed) {
      await this.mawkibsService.syncInventoryOnReservationCancelled(
        reservation,
      );
    }

    await this.prisma.reservation.delete({ where: { id: reservation.id } });
    return { id, message: 'رزرو با موفقیت حذف شد' };
  }

  private resolveActualCheckInOnConfirm(
    mawkib: { recordCheckInOnReservationConfirm?: boolean | null },
    actualCheckInAt?: Date | null,
  ): Date | undefined {
    if (
      mawkib.recordCheckInOnReservationConfirm === true &&
      !actualCheckInAt
    ) {
      return new Date();
    }
    return undefined;
  }

  private async syncCheckInEventOnConfirm(
    reservationId: number,
    checkInAt: Date | undefined,
    userId: number,
  ) {
    if (!checkInAt) return;

    await this.reservationEventsService.syncEventFromLegacyAttendance(
      reservationId,
      ReservationEventType.CHECK_IN,
      checkInAt,
      userId,
    );
  }

  private assertConfirmedReservationStillActive(reservation: {
    status: ReservationStatus;
    reservationEndDate: Date;
  }) {
    if (reservation.status !== ReservationStatus.Confirmed) return;

    if (parseDateOnly(reservation.reservationEndDate) < startOfAppDay()) {
      throw new BadRequestException(
        'تاریخ پایان اقامت این رزرو گذشته است؛ امکان لغو وجود ندارد. رزرو را تکمیل کنید یا از وظیفه تکمیل خودکار استفاده کنید.',
      );
    }
  }

  private extractAppTimeString(date: Date): string {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: APP_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date);
    const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
    const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  }

  private resolveCheckoutEndDate(recordedAt: Date): Date {
    return parseDateOnly(formatDateOnlyInAppTz(recordedAt));
  }

  private assertCheckoutEndDateValid(
    reservation: { reservationDate: Date; reservationEndDate: Date },
    newEndDate: Date,
  ) {
    const stayStart = parseDateOnly(reservation.reservationDate);
    const plannedEnd = parseDateOnly(reservation.reservationEndDate);

    if (newEndDate < stayStart) {
      throw new BadRequestException(
        'تاریخ خروج نمی‌تواند قبل از شروع اقامت باشد',
      );
    }

    if (newEndDate > plannedEnd) {
      throw new BadRequestException(
        'تاریخ خروج نمی‌تواند بعد از پایان برنامه‌ریزی‌شده اقامت باشد',
      );
    }
  }

  private async performCheckOut(
    reservation: {
      id: number;
      mawkibId: number;
      reservationDate: Date;
      reservationEndDate: Date;
      maleGuestCount: number;
      femaleGuestCount: number;
      actualCheckInAt: Date | null;
      actualCheckOutAt: Date | null;
      status: ReservationStatus;
    },
    recordedAt: Date,
    auditUserId?: number,
  ) {
    if (!reservation.actualCheckInAt) {
      throw new BadRequestException('ابتدا باید ورود ثبت شود');
    }

    if (
      reservation.actualCheckOutAt ||
      reservation.status === ReservationStatus.Completed
    ) {
      throw new BadRequestException('خروج این رزرو قبلاً ثبت شده است');
    }

    if (
      reservation.actualCheckInAt &&
      isRecordedAtBeforeCheckInMinute(recordedAt, reservation.actualCheckInAt)
    ) {
      throw new BadRequestException('ساعت خروج نمی‌تواند قبل از ورود باشد');
    }

    const oldEndDate = reservation.reservationEndDate;
    const newEndDate = this.resolveCheckoutEndDate(recordedAt);
    this.assertCheckoutEndDateValid(reservation, newEndDate);

    await this.mawkibsService.syncInventoryOnEndDateChange(
      {
        mawkibId: reservation.mawkibId,
        reservationDate: reservation.reservationDate,
        maleGuestCount: reservation.maleGuestCount,
        femaleGuestCount: reservation.femaleGuestCount,
      },
      oldEndDate,
      newEndDate,
    );

    return this.prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        actualCheckOutAt: recordedAt,
        reservationEndDate: newEndDate,
        plannedCheckOutTime: this.extractAppTimeString(recordedAt),
        status: ReservationStatus.Completed,
        ...(auditUserId ? this.statusAuditFields(auditUserId) : {}),
      },
      include: reservationInclude,
    }).then(async (updated) => {
      if (auditUserId) {
        await this.reservationEventsService.syncEventFromLegacyAttendance(
          reservation.id,
          ReservationEventType.EARLY_CHECKOUT,
          recordedAt,
          auditUserId,
        );
      }

      const mealPlanResult =
        await this.mealPlansService.cancelMealPlansAfterCheckoutDate(
          reservation.id,
          newEndDate,
        );

      return {
        ...updated,
        mealPlanNotice: mealPlanResult.notice,
      };
    });
  }

  private async performCheckOutUpdate(
    reservation: {
      id: number;
      mawkibId: number;
      reservationDate: Date;
      reservationEndDate: Date;
      maleGuestCount: number;
      femaleGuestCount: number;
      actualCheckInAt: Date | null;
    },
    recordedAt: Date,
  ) {
    if (!reservation.actualCheckInAt) {
      throw new BadRequestException('ابتدا باید ورود ثبت شود');
    }

    if (
      reservation.actualCheckInAt &&
      isRecordedAtBeforeCheckInMinute(recordedAt, reservation.actualCheckInAt)
    ) {
      throw new BadRequestException('ساعت خروج نمی‌تواند قبل از ورود باشد');
    }

    const oldEndDate = reservation.reservationEndDate;
    const newEndDate = this.resolveCheckoutEndDate(recordedAt);

    if (newEndDate < parseDateOnly(reservation.reservationDate)) {
      throw new BadRequestException(
        'تاریخ خروج نمی‌تواند قبل از شروع اقامت باشد',
      );
    }

    await this.mawkibsService.syncInventoryOnEndDateChange(
      {
        mawkibId: reservation.mawkibId,
        reservationDate: reservation.reservationDate,
        maleGuestCount: reservation.maleGuestCount,
        femaleGuestCount: reservation.femaleGuestCount,
      },
      oldEndDate,
      newEndDate,
    );

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

  private assertCanRecordAttendance(reservation: {
    status: ReservationStatus;
    actualCheckInAt: Date | null;
    actualCheckOutAt: Date | null;
  }) {
    if (reservation.status === ReservationStatus.Cancelled) {
      throw new BadRequestException('رزرو لغوشده قابل ثبت ورود/خروج نیست');
    }
    if (reservation.status === ReservationStatus.Pending) {
      throw new BadRequestException(
        'تا زمان تایید رزرو، امکان ثبت ورود یا خروج وجود ندارد',
      );
    }
  }

  private assertCanEditAttendance(reservation: { status: ReservationStatus }) {
    if (reservation.status === ReservationStatus.Cancelled) {
      throw new BadRequestException('رزرو لغوشده قابل ویرایش ورود/خروج نیست');
    }
    if (reservation.status === ReservationStatus.Pending) {
      throw new BadRequestException(
        'تا زمان تایید رزرو، امکان ویرایش ورود یا خروج وجود ندارد',
      );
    }
  }

  private resolveRecordedAt(recordedAt?: string): Date {
    if (!recordedAt) return new Date();
    const date = new Date(recordedAt);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('زمان ثبت نامعتبر است');
    }
    return date;
  }

  private async assertUniqueAttendanceSecondForReservation(
    reservationId: number,
    reservation: {
      actualCheckInAt: Date | null;
      actualCheckOutAt: Date | null;
    },
    recordedAt: Date,
  ): Promise<void> {
    const existingEvents = await this.prisma.reservationEvent.findMany({
      where: { reservationId },
      select: { createdAt: true },
    });
    assertUniqueAttendanceSecond(recordedAt, reservation, existingEvents);
  }

  async checkIn(
    id: number,
    currentUser: AuthUser,
    dto?: RecordReservationAttendanceDto,
  ) {
    const reservation = await this.findOneForUser(id, currentUser);
    const isAdmin = currentUser.roles.includes(RoleName.Admin);
    const isOwner = currentUser.roles.includes(RoleName.MawkibOwner);
    const isPilgrim =
      currentUser.roles.includes(RoleName.Pilgrim) && !isAdmin && !isOwner;

    if (isPilgrim && reservation.pilgrimUserId !== currentUser.id) {
      throw new ForbiddenException('فقط رزروهای خودتان را می‌توانید ثبت کنید');
    }

    if (isOwner && !isAdmin) {
      await this.mawkibsService.assertOwnerAccess(
        reservation.mawkibId,
        currentUser.id,
      );
    }

    this.assertCanRecordAttendance(reservation);

    if (reservation.status === ReservationStatus.Completed) {
      throw new BadRequestException('رزرو تکمیل‌شده است');
    }

    if (reservation.actualCheckInAt) {
      throw new BadRequestException('ورود این رزرو قبلاً ثبت شده است');
    }

    if (reservation.actualCheckOutAt) {
      throw new BadRequestException('این رزرو قبلاً خروج خورده است');
    }

    const recordedAt = this.resolveRecordedAt(dto?.recordedAt);

    await this.assertUniqueAttendanceSecondForReservation(
      id,
      reservation,
      recordedAt,
    );

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { actualCheckInAt: recordedAt },
      include: reservationInclude,
    });

    await this.reservationEventsService.syncEventFromLegacyAttendance(
      id,
      ReservationEventType.CHECK_IN,
      recordedAt,
      currentUser.id,
    );

    return updated;
  }

  async checkOut(
    id: number,
    currentUser: AuthUser,
    dto?: RecordReservationAttendanceDto,
  ) {
    const reservation = await this.findOneForUser(id, currentUser);
    const isAdmin = currentUser.roles.includes(RoleName.Admin);
    const isOwner = currentUser.roles.includes(RoleName.MawkibOwner);
    const isPilgrim =
      currentUser.roles.includes(RoleName.Pilgrim) && !isAdmin && !isOwner;

    if (isPilgrim && reservation.pilgrimUserId !== currentUser.id) {
      throw new ForbiddenException('فقط رزروهای خودتان را می‌توانید ثبت کنید');
    }

    if (isOwner && !isAdmin) {
      await this.mawkibsService.assertOwnerAccess(
        reservation.mawkibId,
        currentUser.id,
      );
    }

    this.assertCanRecordAttendance(reservation);

    if (reservation.status === ReservationStatus.Completed) {
      throw new BadRequestException('رزرو تکمیل‌شده است');
    }

    if (!reservation.actualCheckInAt) {
      throw new BadRequestException('ابتدا باید ورود ثبت شود');
    }

    if (reservation.actualCheckOutAt) {
      throw new BadRequestException('خروج این رزرو قبلاً ثبت شده است');
    }

    const recordedAt = this.resolveRecordedAt(dto?.recordedAt);
    if (
      reservation.actualCheckInAt &&
      isRecordedAtBeforeCheckInMinute(recordedAt, reservation.actualCheckInAt)
    ) {
      throw new BadRequestException('ساعت خروج نمی‌تواند قبل از ورود باشد');
    }

    await this.assertUniqueAttendanceSecondForReservation(
      id,
      reservation,
      recordedAt,
    );

    const isStaff = isAdmin || isOwner;

    return this.performCheckOut(
      reservation,
      recordedAt,
      isStaff ? currentUser.id : undefined,
    );
  }

  private async assertCanManageAttendance(
    reservation: { mawkibId: number },
    currentUser: AuthUser,
  ) {
    const isAdmin = currentUser.roles.includes(RoleName.Admin);
    const isOwner = currentUser.roles.includes(RoleName.MawkibOwner);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'فقط مدیر یا مسئول موکب می‌تواند ساعت ورود/خروج را ویرایش کند',
      );
    }

    if (isOwner && !isAdmin) {
      await this.mawkibsService.assertOwnerAccess(
        reservation.mawkibId,
        currentUser.id,
      );
    }
  }

  async updateCheckIn(
    id: number,
    currentUser: AuthUser,
    dto: RecordReservationAttendanceDto,
  ) {
    const reservation = await this.findOneForUser(id, currentUser);
    await this.assertCanManageAttendance(reservation, currentUser);
    this.assertCanEditAttendance(reservation);

    if (!reservation.actualCheckInAt) {
      throw new BadRequestException('ورودی برای ویرایش ثبت نشده است');
    }

    const recordedAt = this.resolveRecordedAt(dto.recordedAt);

    if (
      reservation.actualCheckOutAt &&
      recordedAt > reservation.actualCheckOutAt
    ) {
      throw new BadRequestException('ساعت ورود نمی‌تواند بعد از خروج باشد');
    }

    return this.prisma.reservation.update({
      where: { id },
      data: { actualCheckInAt: recordedAt },
      include: reservationInclude,
    });
  }

  async updateCheckOut(
    id: number,
    currentUser: AuthUser,
    dto: RecordReservationAttendanceDto,
  ) {
    const reservation = await this.findOneForUser(id, currentUser);
    await this.assertCanManageAttendance(reservation, currentUser);
    this.assertCanEditAttendance(reservation);

    if (!reservation.actualCheckInAt) {
      throw new BadRequestException('ابتدا باید ورود ثبت شود');
    }

    if (!reservation.actualCheckOutAt) {
      throw new BadRequestException('خروجی برای ویرایش ثبت نشده است');
    }

    const recordedAt = this.resolveRecordedAt(dto.recordedAt);

    if (
      reservation.actualCheckInAt &&
      isRecordedAtBeforeCheckInMinute(recordedAt, reservation.actualCheckInAt)
    ) {
      throw new BadRequestException('ساعت خروج نمی‌تواند قبل از ورود باشد');
    }

    return this.performCheckOutUpdate(reservation, recordedAt);
  }

  async checkInGuest(
    trackingCode: string,
    dto?: RecordReservationAttendanceDto,
  ) {
    const reservation = await this.findByTrackingCode(trackingCode);
    this.assertCanRecordAttendance(reservation);

    if (reservation.status === ReservationStatus.Completed) {
      throw new BadRequestException('رزرو تکمیل‌شده است');
    }

    if (reservation.actualCheckInAt) {
      throw new BadRequestException('ورود این رزرو قبلاً ثبت شده است');
    }

    if (reservation.actualCheckOutAt) {
      throw new BadRequestException('این رزرو قبلاً خروج خورده است');
    }

    const recordedAt = this.resolveRecordedAt(dto?.recordedAt);

    await this.assertUniqueAttendanceSecondForReservation(
      reservation.id,
      reservation,
      recordedAt,
    );

    const updated = await this.prisma.reservation.update({
      where: { id: reservation.id },
      data: { actualCheckInAt: recordedAt },
      include: reservationInclude,
    });

    await this.reservationEventsService.syncEventFromLegacyAttendance(
      reservation.id,
      ReservationEventType.CHECK_IN,
      recordedAt,
      reservation.pilgrimUserId,
    );

    return updated;
  }

  async checkOutGuest(
    trackingCode: string,
    dto?: RecordReservationAttendanceDto,
  ) {
    const reservation = await this.findByTrackingCode(trackingCode);
    this.assertCanRecordAttendance(reservation);

    if (reservation.status === ReservationStatus.Completed) {
      throw new BadRequestException('رزرو تکمیل‌شده است');
    }

    if (!reservation.actualCheckInAt) {
      throw new BadRequestException('ابتدا باید ورود ثبت شود');
    }

    if (reservation.actualCheckOutAt) {
      throw new BadRequestException('خروج این رزرو قبلاً ثبت شده است');
    }

    const recordedAt = this.resolveRecordedAt(dto?.recordedAt);
    if (
      reservation.actualCheckInAt &&
      isRecordedAtBeforeCheckInMinute(recordedAt, reservation.actualCheckInAt)
    ) {
      throw new BadRequestException('ساعت خروج نمی‌تواند قبل از ورود باشد');
    }

    await this.assertUniqueAttendanceSecondForReservation(
      reservation.id,
      reservation,
      recordedAt,
    );

    return this.performCheckOut(
      reservation,
      recordedAt,
      reservation.pilgrimUserId,
    );
  }

  private assertCanReviewReservation(
    reservation: { status: ReservationStatus; pilgrimUserId: number },
    userId: number,
  ) {
    if (reservation.pilgrimUserId !== userId) {
      throw new ForbiddenException('فقط زائر این رزرو می‌تواند نظر ثبت کند');
    }

    if (
      reservation.status !== ReservationStatus.Confirmed &&
      reservation.status !== ReservationStatus.Completed
    ) {
      throw new BadRequestException(
        'فقط برای رزروهای تایید شده یا تکمیل شده می‌توانید نظر ثبت کنید',
      );
    }
  }

  async createReview(
    reservationId: number,
    dto: CreateReservationReviewDto,
    currentUser: AuthUser,
  ) {
    const reservation = await this.findOneForUser(reservationId, currentUser);
    this.assertCanReviewReservation(reservation, currentUser.id);

    const existing = await this.prisma.reservationReview.findUnique({
      where: { reservationId },
    });

    if (existing) {
      throw new BadRequestException('برای این رزرو قبلاً نظر ثبت شده است');
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

  async updateReview(
    reservationId: number,
    dto: CreateReservationReviewDto,
    currentUser: AuthUser,
  ) {
    const reservation = await this.findOneForUser(reservationId, currentUser);
    this.assertCanReviewReservation(reservation, currentUser.id);

    const review = await this.prisma.reservationReview.findUnique({
      where: { reservationId },
    });

    if (!review) {
      throw new NotFoundException('نظری برای این رزرو ثبت نشده است');
    }

    if (review.authorUserId !== currentUser.id) {
      throw new ForbiddenException('فقط نویسنده نظر می‌تواند آن را ویرایش کند');
    }

    if (review.adminReply) {
      throw new BadRequestException(
        'پس از دریافت پاسخ مدیریت، امکان ویرایش نظر وجود ندارد',
      );
    }

    await this.prisma.reservationReview.update({
      where: { reservationId },
      data: { content: dto.content.trim() },
    });

    return this.findOne(reservationId);
  }

  async replyToReview(
    reservationId: number,
    dto: ReplyReservationReviewDto,
    currentUser: AuthUser,
  ) {
    const isAdmin = currentUser.roles.includes(RoleName.Admin);
    const isOwner = currentUser.roles.includes(RoleName.MawkibOwner);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'فقط مدیر یا مسئول موکب می‌تواند به نظر پاسخ دهد',
      );
    }

    await this.findOneForUser(reservationId, currentUser);

    const review = await this.prisma.reservationReview.findUnique({
      where: { reservationId },
    });

    if (!review) {
      throw new NotFoundException('نظری برای این رزرو ثبت نشده است');
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

  private assertReservationEligibleForDeliveredItems(reservation: {
    status: ReservationStatus;
  }) {
    if (
      reservation.status !== ReservationStatus.Confirmed &&
      reservation.status !== ReservationStatus.Completed
    ) {
      throw new BadRequestException(
        'فقط برای رزروهای تایید شده یا تکمیل شده می‌توان کالا ثبت کرد',
      );
    }
  }

  private async assertCanManageDeliveredItems(
    reservation: { mawkibId: number; status: ReservationStatus },
    currentUser: AuthUser,
  ) {
    const isAdmin = currentUser.roles.includes(RoleName.Admin);
    const isOwner = currentUser.roles.includes(RoleName.MawkibOwner);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'فقط مدیر یا مسئول موکب می‌تواند کالاهای تحویلی را مدیریت کند',
      );
    }

    if (isOwner && !isAdmin) {
      await this.mawkibsService.assertOwnerAccess(
        reservation.mawkibId,
        currentUser.id,
      );
    }

    this.assertReservationEligibleForDeliveredItems(reservation);
  }

  async createDeliveredItem(
    reservationId: number,
    dto: CreateReservationDeliveredItemDto,
    currentUser: AuthUser,
  ) {
    const reservation = await this.findOneForUser(reservationId, currentUser);
    await this.assertCanManageDeliveredItems(reservation, currentUser);

    await this.prisma.reservationDeliveredItem.create({
      data: {
        reservationId,
        itemName: dto.itemName.trim(),
        quantity: dto.quantity,
        description: dto.description?.trim() || null,
        status: ReservationDeliveredItemStatus.DeliveredToGuest,
        recordedByUserId: currentUser.id,
      },
    });

    return this.findOne(reservationId);
  }

  async updateDeliveredItem(
    reservationId: number,
    itemId: number,
    dto: UpdateReservationDeliveredItemDto,
    currentUser: AuthUser,
  ) {
    const reservation = await this.findOneForUser(reservationId, currentUser);
    await this.assertCanManageDeliveredItems(reservation, currentUser);

    const item = await this.prisma.reservationDeliveredItem.findFirst({
      where: { id: itemId, reservationId },
    });

    if (!item) {
      throw new NotFoundException('رکورد کالا یافت نشد');
    }

    if (item.status !== ReservationDeliveredItemStatus.DeliveredToGuest) {
      throw new BadRequestException(
        'فقط کالاهای تحویل‌داده‌شده قابل ویرایش هستند',
      );
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

  async receiveDeliveredItem(
    reservationId: number,
    itemId: number,
    currentUser: AuthUser,
  ) {
    const reservation = await this.findOneForUser(reservationId, currentUser);
    await this.assertCanManageDeliveredItems(reservation, currentUser);

    const item = await this.prisma.reservationDeliveredItem.findFirst({
      where: { id: itemId, reservationId },
    });

    if (!item) {
      throw new NotFoundException('رکورد کالا یافت نشد');
    }

    if (item.status !== ReservationDeliveredItemStatus.DeliveredToGuest) {
      throw new BadRequestException('این کالا قبلاً تحویل گرفته شده است');
    }

    await this.prisma.reservationDeliveredItem.update({
      where: { id: itemId },
      data: {
        status: ReservationDeliveredItemStatus.ReceivedFromGuest,
        receivedAt: new Date(),
      },
    });

    return this.findOne(reservationId);
  }

  async removeDeliveredItem(
    reservationId: number,
    itemId: number,
    currentUser: AuthUser,
  ) {
    const reservation = await this.findOneForUser(reservationId, currentUser);
    await this.assertCanManageDeliveredItems(reservation, currentUser);

    const item = await this.prisma.reservationDeliveredItem.findFirst({
      where: { id: itemId, reservationId },
    });

    if (!item) {
      throw new NotFoundException('رکورد کالا یافت نشد');
    }

    await this.prisma.reservationDeliveredItem.delete({
      where: { id: itemId },
    });

    return this.findOne(reservationId);
  }

  async getAttendanceRoster(
    kind: AttendanceRosterKind,
    user: AuthUser,
    mawkibId?: number,
  ) {
    const isAdmin = user.roles.includes(RoleName.Admin);
    const isOwner = user.roles.includes(RoleName.MawkibOwner);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('دسترسی مجاز نیست');
    }

    const today = startOfAppDay();
    const presenceFilter =
      kind === AttendanceRosterKind.ABSENT
        ? {
            in: [
              ReservationPresenceState.NOT_ARRIVED,
              ReservationPresenceState.TEMPORARILY_OUT,
            ],
          }
        : ReservationPresenceState.PRESENT;

    const mawkibWhere = mawkibId
      ? isAdmin
        ? { id: mawkibId }
        : { id: mawkibId, ownerUserId: user.id }
      : isAdmin
        ? undefined
        : { ownerUserId: user.id };

    const reservations = await this.prisma.reservation.findMany({
      where: {
        status: ReservationStatus.Confirmed,
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
                ReservationEventType.CHECK_IN,
                ReservationEventType.TEMP_IN,
                ReservationEventType.TEMP_OUT,
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

        if (kind === AttendanceRosterKind.ABSENT) {
          const absentContext = resolveAbsentRosterContext(reservation, events);
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
            mobile:
              reservation.pilgrimMobile?.trim() ||
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

        let referenceAt: Date | null =
          events.find(
            (e) =>
              e.eventType === ReservationEventType.TEMP_IN ||
              e.eventType === ReservationEventType.CHECK_IN,
          )?.createdAt ??
          reservation.actualCheckInAt ??
          null;

        const durationMs = referenceAt
          ? Math.max(0, now - new Date(referenceAt).getTime())
          : 0;

        return {
          reservationId: reservation.id,
          fullName: reservation.pilgrim.fullName,
          mobile:
            reservation.pilgrimMobile?.trim() ||
            reservation.pilgrim.mobileNumber?.trim() ||
            '',
          nationalId: reservation.pilgrim.nationalId?.trim() || null,
          durationMs,
          lastExitAt: null,
          absenceKind: null,
          registerEventType: null,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row != null)
      .sort((a, b) => b.durationMs - a.durationMs);

    return {
      kind,
      generatedAt: new Date().toISOString(),
      mawkibId: mawkibId ?? null,
      rows,
    };
  }
}
