import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MawkibStatus, Prisma, ReservationStatus, RoleName } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import {
  matchMawkibCitiesFromQuery,
  matchMawkibCountriesFromQuery,
} from './mawkib-search.utils';
import {
  AdminSearchMawkibDto,
  CreateMawkibDto,
  MAWKIB_AMENITY_FILTER_KEYS,
  MawkibCapacityFilter,
  MawkibInventoryQueryDto,
  SearchMawkibDto,
  UpdateMawkibDto,
} from './dto/mawkib.dto';
import { eachDateInRange, parseDateOnly } from '../common/utils/date.util';
import {
  MawkibCapacitySnapshot,
  totalAvailable,
} from '../common/types/capacity.types';
import { MawkibInventoryService } from './mawkib-inventory.service';

const mawkibInclude = {
  owner: { select: { id: true, fullName: true, mobileNumber: true, province: true, city: true } },
  _count: { select: { reservations: true } },
} satisfies Prisma.MawkibInclude;

@Injectable()
export class MawkibsService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: MawkibInventoryService,
  ) {}

  private applyAmenityFilters(
    where: Prisma.MawkibWhereInput,
    search?: Partial<Record<(typeof MAWKIB_AMENITY_FILTER_KEYS)[number], boolean>>,
  ) {
    if (!search) return;
    for (const key of MAWKIB_AMENITY_FILTER_KEYS) {
      if (search[key] === true) {
        where[key] = true;
      }
    }
  }

  private buildAdminWhere(search?: AdminSearchMawkibDto): Prisma.MawkibWhereInput {
    if (!search) return {};

    const where: Prisma.MawkibWhereInput = {};

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

  private filterByCapacityView<
    T extends { availableMaleCapacity: number; availableFemaleCapacity: number },
  >(items: T[], capacityFilter?: MawkibCapacityFilter): T[] {
    if (!capacityFilter || capacityFilter === MawkibCapacityFilter.All) {
      return items;
    }
    if (capacityFilter === MawkibCapacityFilter.Available) {
      return items.filter(
        (m) => m.availableMaleCapacity > 0 || m.availableFemaleCapacity > 0,
      );
    }
    return items.filter(
      (m) => m.availableMaleCapacity <= 0 && m.availableFemaleCapacity <= 0,
    );
  }

  /** Attach today's available capacity from mawkib_daily_inventory. */
  private async enrichWithTodayCapacity<
    T extends { id: number; maleCapacity: number; femaleCapacity: number },
  >(mawkibs: T[], day: Date | string = new Date()) {
    const snapshots = await this.inventoryService.getSnapshotsForMawkibsOnDate(
      mawkibs,
      day,
    );

    return mawkibs.map((mawkib) => {
      const snapshot = snapshots.get(mawkib.id)!;
      return {
        ...mawkib,
        availableMaleCapacity: snapshot.availableMale,
        availableFemaleCapacity: snapshot.availableFemale,
      };
    });
  }

  private hasReservationAvailabilitySearch(
    search?: Pick<
      SearchMawkibDto,
      | 'reservationDate'
      | 'reservationDateFrom'
      | 'reservationDateTo'
      | 'hasAvailability'
      | 'minAvailableMaleCapacity'
      | 'minAvailableFemaleCapacity'
    >,
  ) {
    if (!search) return false;
    return !!(
      search.reservationDate ||
      search.reservationDateFrom ||
      search.reservationDateTo ||
      search.hasAvailability ||
      search.minAvailableMaleCapacity !== undefined ||
      search.minAvailableFemaleCapacity !== undefined
    );
  }

  private async enrichAndFilterByAvailability<
    T extends {
      id: number;
      maleCapacity: number;
      femaleCapacity: number;
      maxReservationDays: number | null;
      serviceStartDate: Date | null;
      owner: { province: string | null; city: string | null };
    },
  >(
    mawkibs: T[],
    search: Pick<
      SearchMawkibDto,
      | 'reservationDate'
      | 'reservationDateFrom'
      | 'reservationDateTo'
      | 'hasAvailability'
      | 'minAvailableMaleCapacity'
      | 'minAvailableFemaleCapacity'
      | 'capacityFilter'
    >,
  ) {
    const rangeStart =
      search.reservationDateFrom ?? search.reservationDate ?? undefined;
    const rangeEnd =
      search.reservationDateTo ??
      search.reservationDateFrom ??
      search.reservationDate ??
      undefined;

    let enriched: (T & {
      availableMaleCapacity: number;
      availableFemaleCapacity: number;
    })[];

    if (rangeStart && rangeEnd) {
      enriched = await Promise.all(
        mawkibs.map(async (mawkib) => {
          const snapshot = await this.getMinCapacityInRange(
            mawkib.id,
            parseDateOnly(rangeStart),
            parseDateOnly(rangeEnd),
          );
          return {
            ...mawkib,
            availableMaleCapacity: snapshot.availableMale,
            availableFemaleCapacity: snapshot.availableFemale,
          };
        }),
      );
    } else if (rangeStart) {
      enriched = await this.enrichWithTodayCapacity(
        mawkibs,
        parseDateOnly(rangeStart),
      );
    } else {
      enriched = await this.enrichWithTodayCapacity(mawkibs);
    }

    return enriched.filter((m) => {
      if (rangeStart && m.maxReservationDays) {
        const dayCount = eachDateInRange(
          parseDateOnly(rangeStart),
          parseDateOnly(rangeEnd ?? rangeStart),
        ).length;
        if (dayCount > m.maxReservationDays) return false;
      }
      if (rangeStart && m.serviceStartDate) {
        const resStart = parseDateOnly(rangeStart);
        if (resStart < m.serviceStartDate) return false;
      }
      if (
        search.minAvailableMaleCapacity !== undefined &&
        m.maleCapacity < search.minAvailableMaleCapacity
      ) {
        return false;
      }
      if (
        search.minAvailableFemaleCapacity !== undefined &&
        m.femaleCapacity < search.minAvailableFemaleCapacity
      ) {
        return false;
      }
      if (
        search.minAvailableMaleCapacity !== undefined &&
        m.availableMaleCapacity < search.minAvailableMaleCapacity
      ) {
        return false;
      }
      if (
        search.minAvailableFemaleCapacity !== undefined &&
        m.availableFemaleCapacity < search.minAvailableFemaleCapacity
      ) {
        return false;
      }
      if (
        search.hasAvailability &&
        m.availableMaleCapacity <= 0 &&
        m.availableFemaleCapacity <= 0
      ) {
        return false;
      }
      if (search.capacityFilter === MawkibCapacityFilter.Available) {
        if (m.availableMaleCapacity <= 0 && m.availableFemaleCapacity <= 0) {
          return false;
        }
      }
      if (search.capacityFilter === MawkibCapacityFilter.Full) {
        if (m.availableMaleCapacity > 0 || m.availableFemaleCapacity > 0) {
          return false;
        }
      }
      return true;
    });
  }

  async findAll(search?: SearchMawkibDto) {
    const where: Prisma.MawkibWhereInput = {
      status: MawkibStatus.Approved,
      ...(search?.name && {
        name: { contains: search.name, mode: 'insensitive' },
      }),
    };

    if (search?.q?.trim()) {
      const term = search.q.trim();
      const matchedCities = matchMawkibCitiesFromQuery(term);
      const matchedCountries = matchMawkibCountriesFromQuery(term);
      const or: Prisma.MawkibWhereInput[] = [
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
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!this.hasReservationAvailabilitySearch(search)) {
      const enriched = await this.enrichWithTodayCapacity(mawkibs);
      return this.filterByCapacityView(enriched, search?.capacityFilter);
    }

    return this.enrichAndFilterByAvailability(mawkibs, search!);
  }

  async findAllAdmin(search?: AdminSearchMawkibDto) {
    const mawkibs = await this.prisma.mawkib.findMany({
      where: this.buildAdminWhere(search),
      include: mawkibInclude,
      orderBy: { createdAt: 'desc' },
    });

    const enriched = await this.enrichWithTodayCapacity(mawkibs);

    return this.filterByCapacityView(enriched, search?.capacityFilter);
  }

  async findByOwner(ownerUserId: number, search?: AdminSearchMawkibDto) {
    const mawkibs = await this.prisma.mawkib.findMany({
      where: {
        ownerUserId,
        ...this.buildAdminWhere(search),
      },
      include: mawkibInclude,
      orderBy: { createdAt: 'desc' },
    });

    if (this.hasReservationAvailabilitySearch(search)) {
      return this.enrichAndFilterByAvailability(mawkibs, search!);
    }

    const enriched = await this.enrichWithTodayCapacity(mawkibs);

    return this.filterByCapacityView(enriched, search?.capacityFilter);
  }

  async findOnePublic(id: number) {
    const mawkib = await this.prisma.mawkib.findFirst({
      where: { id, status: MawkibStatus.Approved },
      include: mawkibInclude,
    });

    if (!mawkib) {
      throw new NotFoundException('موکب یافت نشد');
    }

    const [enriched] = await this.enrichWithTodayCapacity([mawkib]);
    return enriched;
  }

  async findOne(id: number, userId?: number, isAdmin = true) {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id },
      include: mawkibInclude,
    });

    if (!mawkib) {
      throw new NotFoundException('موکب یافت نشد');
    }

    if (!isAdmin && userId && mawkib.ownerUserId !== userId) {
      throw new ForbiddenException('شما مجوز مشاهده این موکب را ندارید');
    }

    const [enriched] = await this.enrichWithTodayCapacity([mawkib]);
    return enriched;
  }

  async create(dto: CreateMawkibDto, actingUserId?: number, isAdmin = true) {
    const ownerUserId = isAdmin ? dto.ownerUserId : actingUserId;

    if (!ownerUserId) {
      throw new BadRequestException('مسئول موکب مشخص نشده است');
    }

    if (!isAdmin && dto.ownerUserId && dto.ownerUserId !== actingUserId) {
      throw new ForbiddenException('امکان ثبت موکب برای کاربر دیگر وجود ندارد');
    }

    const owner = await this.prisma.user.findUnique({
      where: { id: ownerUserId },
    });

    if (!owner) {
      throw new NotFoundException('مسئول موکب یافت نشد');
    }

    const {
      ownerUserId: _ownerUserId,
      serviceStartDate,
      serviceEndDate,
      status,
      ...fields
    } = dto;

    const created = await this.prisma.mawkib.create({
      data: {
        ...fields,
        serviceStartDate: serviceStartDate ? new Date(serviceStartDate) : undefined,
        serviceEndDate: serviceEndDate ? new Date(serviceEndDate) : undefined,
        status: isAdmin ? (status ?? MawkibStatus.Approved) : MawkibStatus.Pending,
        owner: { connect: { id: ownerUserId } },
      },
      include: mawkibInclude,
    });

    await this.inventoryService.seedHorizonForMawkib(created.id);
    return created;
  }

  async update(
    id: number,
    dto: UpdateMawkibDto,
    userId?: number,
    isAdmin = true,
  ) {
    const mawkib = await this.prisma.mawkib.findUnique({ where: { id } });

    if (!mawkib) {
      throw new NotFoundException('موکب یافت نشد');
    }

    if (!isAdmin) {
      if (mawkib.ownerUserId !== userId) {
        throw new ForbiddenException('شما مجوز ویرایش این موکب را ندارید');
      }
    }

    const ownerUserId = isAdmin ? dto.ownerUserId : undefined;
    const status = isAdmin ? dto.status : undefined;
    const {
      ownerUserId: _o,
      status: _s,
      serviceStartDate,
      serviceEndDate,
      ...fields
    } = dto;

    const data: Prisma.MawkibUpdateInput = {
      ...fields,
      ...(serviceStartDate !== undefined && {
        serviceStartDate: serviceStartDate ? new Date(serviceStartDate) : null,
      }),
      ...(serviceEndDate !== undefined && {
        serviceEndDate: serviceEndDate ? new Date(serviceEndDate) : null,
      }),
    };

    if (isAdmin) {
      if (status !== undefined) data.status = status;
      if (ownerUserId !== undefined) {
        const owner = await this.prisma.user.findUnique({
          where: { id: ownerUserId },
        });
        if (!owner) {
          throw new NotFoundException('مسئول موکب یافت نشد');
        }
        data.owner = { connect: { id: ownerUserId } };
      }
    }

    return this.prisma.mawkib.update({
      where: { id },
      data,
      include: mawkibInclude,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const reservationCount = await this.prisma.reservation.count({
      where: {
        mawkibId: id,
        status: { in: [ReservationStatus.Pending, ReservationStatus.Confirmed] },
      },
    });

    if (reservationCount > 0) {
      const updated = await this.prisma.mawkib.update({
        where: { id },
        data: { status: MawkibStatus.Rejected },
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

  async updateStatus(id: number, status: MawkibStatus) {
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

  async getCapacitySnapshotsForMawkibs(
    mawkibs: Array<{ id: number; maleCapacity: number; femaleCapacity: number }>,
    day?: Date | string,
  ) {
    return this.inventoryService.getSnapshotsForMawkibsOnDate(mawkibs, day);
  }

  async getInventoryRange(mawkibId: number, query: MawkibInventoryQueryDto) {
    return this.inventoryService.getInventoryRange(
      mawkibId,
      query.startDate,
      query.endDate,
    );
  }

  async getInventoryRangeForViewer(
    mawkibId: number,
    query: MawkibInventoryQueryDto,
    userId?: number,
    isAdmin = false,
  ) {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: mawkibId },
      select: { id: true, status: true, ownerUserId: true },
    });

    if (!mawkib) {
      throw new NotFoundException('موکب یافت نشد');
    }

    const isOwner = userId != null && mawkib.ownerUserId === userId;

    if (mawkib.status !== MawkibStatus.Approved && !isAdmin && !isOwner) {
      throw new NotFoundException('موکب یافت نشد');
    }

    return this.getInventoryRange(mawkibId, query);
  }

  async syncInventoryOnReservationConfirmed(reservation: {
    mawkibId: number;
    reservationDate: Date;
    reservationEndDate: Date;
    actualCheckOutAt: Date | null;
    maleGuestCount: number;
    femaleGuestCount: number;
  }) {
    await this.inventoryService.applyReservationOccupancy(reservation, 1);
  }

  async syncInventoryOnReservationCancelled(reservation: {
    mawkibId: number;
    reservationDate: Date;
    reservationEndDate: Date;
    actualCheckOutAt: Date | null;
    maleGuestCount: number;
    femaleGuestCount: number;
  }) {
    await this.inventoryService.applyReservationOccupancy(reservation, -1);
  }

  async syncInventoryOnEarlyCheckout(reservation: {
    mawkibId: number;
    reservationEndDate: Date;
    actualCheckOutAt: Date | null;
    maleGuestCount: number;
    femaleGuestCount: number;
  }) {
    await this.inventoryService.applyEarlyCheckoutRelease(reservation);
  }

  async getCapacitySnapshot(
    mawkibId: number,
    reservationDate?: Date | string,
  ): Promise<MawkibCapacitySnapshot> {
    /** Reads exclusively from mawkib_daily_inventory. */
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: mawkibId },
    });

    if (!mawkib) {
      throw new NotFoundException('موکب یافت نشد');
    }

    const dateFilter = parseDateOnly(reservationDate ?? new Date());

    return this.inventoryService.getCapacitySnapshotFromInventory(
      mawkibId,
      dateFilter,
      mawkib.maleCapacity,
      mawkib.femaleCapacity,
    );
  }

  async getMinCapacityInRange(
    mawkibId: number,
    startDate: Date | string,
    endDate: Date | string,
  ): Promise<MawkibCapacitySnapshot> {
    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);

    if (end < start) {
      throw new BadRequestException('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد');
    }

    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: mawkibId },
      select: { maleCapacity: true, femaleCapacity: true },
    });

    if (!mawkib) {
      throw new NotFoundException('موکب یافت نشد');
    }

    return this.inventoryService.getMinCapacityInRangeFromInventory(
      mawkibId,
      start,
      end,
      mawkib.maleCapacity,
      mawkib.femaleCapacity,
    );
  }

  /** @deprecated use getCapacitySnapshot */
  async getAvailableCapacity(mawkibId: number, reservationDate?: Date | string) {
    const snapshot = await this.getCapacitySnapshot(mawkibId, reservationDate);
    return totalAvailable(snapshot);
  }

  /** @deprecated use getMinCapacityInRange */
  async getMinAvailableCapacityInRange(
    mawkibId: number,
    startDate: Date | string,
    endDate: Date | string,
  ) {
    const snapshot = await this.getMinCapacityInRange(mawkibId, startDate, endDate);
    return totalAvailable(snapshot);
  }

  async assertGuestCountWithinMawkibCapacity(
    mawkibId: number,
    maleGuestCount: number,
    femaleGuestCount: number,
  ) {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: mawkibId },
      select: { maleCapacity: true, femaleCapacity: true },
    });

    if (!mawkib) {
      throw new NotFoundException('موکب یافت نشد');
    }

    if (maleGuestCount > mawkib.maleCapacity) {
      throw new BadRequestException(
        `تعداد آقایان (${maleGuestCount}) از ظرفیت کل موکب (${mawkib.maleCapacity} نفر) بیشتر است`,
      );
    }

    if (femaleGuestCount > mawkib.femaleCapacity) {
      throw new BadRequestException(
        `تعداد بانوان (${femaleGuestCount}) از ظرفیت کل موکب (${mawkib.femaleCapacity} نفر) بیشتر است`,
      );
    }
  }

  async assertCapacity(
    mawkibId: number,
    maleGuestCount: number,
    femaleGuestCount: number,
    reservationDate: Date | string,
  ) {
    await this.assertGuestCountWithinMawkibCapacity(
      mawkibId,
      maleGuestCount,
      femaleGuestCount,
    );

    const snapshot = await this.getCapacitySnapshot(mawkibId, reservationDate);

    if (maleGuestCount > snapshot.availableMale) {
      throw new BadRequestException(
        `ظرفیت آقایان کافی نیست. باقی‌مانده: ${snapshot.availableMale} نفر`,
      );
    }
    if (femaleGuestCount > snapshot.availableFemale) {
      throw new BadRequestException(
        `ظرفیت بانوان کافی نیست. باقی‌مانده: ${snapshot.availableFemale} نفر`,
      );
    }
  }

  async assertCapacityInRange(
    mawkibId: number,
    maleGuestCount: number,
    femaleGuestCount: number,
    startDate: Date | string,
    endDate: Date | string,
  ) {
    await this.assertGuestCountWithinMawkibCapacity(
      mawkibId,
      maleGuestCount,
      femaleGuestCount,
    );

    const snapshot = await this.getMinCapacityInRange(
      mawkibId,
      startDate,
      endDate,
    );

    if (maleGuestCount > snapshot.availableMale) {
      throw new BadRequestException(
        `ظرفیت آقایان کافی نیست. کمترین ظرفیت باقی‌مانده در بازه: ${snapshot.availableMale} نفر`,
      );
    }
    if (femaleGuestCount > snapshot.availableFemale) {
      throw new BadRequestException(
        `ظرفیت بانوان کافی نیست. کمترین ظرفیت باقی‌مانده در بازه: ${snapshot.availableFemale} نفر`,
      );
    }
  }

  async assertReservationServiceStart(
    mawkibId: number,
    reservationStart: Date | string,
  ) {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: mawkibId },
      select: { serviceStartDate: true },
    });

    if (!mawkib) {
      throw new NotFoundException('موکب یافت نشد');
    }

    if (!mawkib.serviceStartDate) return;

    const start = parseDateOnly(reservationStart);
    if (start < mawkib.serviceStartDate) {
      throw new BadRequestException(
        'تاریخ شروع رزرو نمی‌تواند قبل از تاریخ شروع خدمات موکب باشد',
      );
    }
  }

  async assertMaxReservationDays(
    mawkibId: number,
    startDate: Date | string,
    endDate: Date | string,
  ) {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: mawkibId },
      select: { maxReservationDays: true },
    });

    if (!mawkib?.maxReservationDays) return;

    const days = eachDateInRange(
      parseDateOnly(startDate),
      parseDateOnly(endDate),
    ).length;

    if (days > mawkib.maxReservationDays) {
      throw new BadRequestException(
        `حداکثر بازه رزرو برای این موکب ${mawkib.maxReservationDays} روز است`,
      );
    }
  }

  async assertOwnerAccess(mawkibId: number, userId: number) {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: mawkibId },
    });

    if (!mawkib) {
      throw new NotFoundException('موکب یافت نشد');
    }

    if (mawkib.ownerUserId !== userId) {
      throw new ForbiddenException('شما مالک این موکب نیستید');
    }

    return mawkib;
  }

  assertOnlineReservationAllowed(
    mawkib: { onlineReservationEnabled: boolean; ownerUserId: number },
    currentUser?: AuthUser,
  ) {
    if (mawkib.onlineReservationEnabled) {
      return;
    }

    if (!currentUser) {
      throw new BadRequestException('امکان رزرو آنلاین این موکب غیرفعال است');
    }

    const isAdmin = currentUser.roles.includes(RoleName.Admin);
    const isOwner =
      currentUser.roles.includes(RoleName.MawkibOwner) &&
      mawkib.ownerUserId === currentUser.id;

    if (isAdmin || isOwner) {
      return;
    }

    throw new BadRequestException('امکان رزرو آنلاین این موکب غیرفعال است');
  }
}
