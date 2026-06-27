import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MawkibStatus, Prisma, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  matchMawkibCitiesFromQuery,
  matchMawkibCountriesFromQuery,
} from './mawkib-search.utils';
import {
  AdminSearchMawkibDto,
  CreateMawkibDto,
  MawkibCapacityFilter,
  SearchMawkibDto,
  UpdateMawkibDto,
} from './dto/mawkib.dto';
import { eachDateInRange, parseDateOnly } from '../common/utils/date.util';
import {
  MawkibCapacitySnapshot,
  totalAvailable,
} from '../common/types/capacity.types';
import { reservationOccupiesDay } from '../reservations/reservation-occupancy.util';

const mawkibInclude = {
  owner: { select: { id: true, fullName: true, mobileNumber: true, province: true, city: true } },
  _count: { select: { reservations: true } },
} satisfies Prisma.MawkibInclude;

@Injectable()
export class MawkibsService {
  constructor(private prisma: PrismaService) {}

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
    if (search.ownerName || search.province || search.city) {
      where.owner = {
        ...(search.ownerName && {
          fullName: { contains: search.ownerName, mode: 'insensitive' },
        }),
        ...(search.province && {
          province: { contains: search.province, mode: 'insensitive' },
        }),
        ...(search.city && {
          city: { contains: search.city, mode: 'insensitive' },
        }),
      };
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

  private hasAvailabilitySearchParams(
    search?: Pick<
      SearchMawkibDto,
      | 'reservationDate'
      | 'reservationDateFrom'
      | 'reservationDateTo'
      | 'hasAvailability'
      | 'minAvailableMaleCapacity'
      | 'minAvailableFemaleCapacity'
      | 'province'
      | 'city'
      | 'capacityFilter'
      | 'serviceStartFrom'
      | 'serviceStartTo'
      | 'serviceEndFrom'
      | 'serviceEndTo'
    >,
  ) {
    if (!search) return false;
    return !!(
      search.reservationDate ||
      search.reservationDateFrom ||
      search.reservationDateTo ||
      search.hasAvailability ||
      search.minAvailableMaleCapacity !== undefined ||
      search.minAvailableFemaleCapacity !== undefined ||
      search.province ||
      search.city ||
      search.capacityFilter ||
      search.serviceStartFrom ||
      search.serviceStartTo ||
      search.serviceEndFrom ||
      search.serviceEndTo
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
      | 'province'
      | 'city'
    >,
  ) {
    const rangeStart =
      search.reservationDateFrom ?? search.reservationDate ?? undefined;
    const rangeEnd =
      search.reservationDateTo ??
      search.reservationDateFrom ??
      search.reservationDate ??
      undefined;

    const enriched = await Promise.all(
      mawkibs.map(async (mawkib) => {
        let snapshot: MawkibCapacitySnapshot;
        if (rangeStart && rangeEnd) {
          snapshot = await this.getMinCapacityInRange(
            mawkib.id,
            parseDateOnly(rangeStart),
            parseDateOnly(rangeEnd),
          );
        } else if (rangeStart) {
          snapshot = await this.getCapacitySnapshot(mawkib.id, parseDateOnly(rangeStart));
        } else {
          snapshot = await this.getCapacitySnapshot(mawkib.id);
        }
        return {
          ...mawkib,
          availableMaleCapacity: snapshot.availableMale,
          availableFemaleCapacity: snapshot.availableFemale,
        };
      }),
    );

    return enriched.filter((m) => {
      if (search.province && m.owner.province !== search.province) return false;
      if (search.city && m.owner.city !== search.city) return false;
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

    const mawkibs = await this.prisma.mawkib.findMany({
      where,
      include: {
        owner: {
          select: { id: true, fullName: true, mobileNumber: true, province: true, city: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!this.hasAvailabilitySearchParams(search)) {
      return mawkibs;
    }

    return this.enrichAndFilterByAvailability(mawkibs, search!);
  }

  async findAllAdmin(search?: AdminSearchMawkibDto) {
    const mawkibs = await this.prisma.mawkib.findMany({
      where: this.buildAdminWhere(search),
      include: mawkibInclude,
      orderBy: { createdAt: 'desc' },
    });

    const enriched = await Promise.all(
      mawkibs.map(async (mawkib) => {
        const snapshot = await this.getCapacitySnapshot(mawkib.id);
        return {
          ...mawkib,
          availableMaleCapacity: snapshot.availableMale,
          availableFemaleCapacity: snapshot.availableFemale,
        };
      }),
    );

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

    if (this.hasAvailabilitySearchParams(search)) {
      return this.enrichAndFilterByAvailability(mawkibs, search!);
    }

    const enriched = await Promise.all(
      mawkibs.map(async (mawkib) => {
        const snapshot = await this.getCapacitySnapshot(mawkib.id);
        return {
          ...mawkib,
          availableMaleCapacity: snapshot.availableMale,
          availableFemaleCapacity: snapshot.availableFemale,
        };
      }),
    );

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

    const snapshot = await this.getCapacitySnapshot(mawkib.id);

    return {
      ...mawkib,
      availableMaleCapacity: snapshot.availableMale,
      availableFemaleCapacity: snapshot.availableFemale,
    };
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

    const snapshot = await this.getCapacitySnapshot(mawkib.id);

    return {
      ...mawkib,
      availableMaleCapacity: snapshot.availableMale,
      availableFemaleCapacity: snapshot.availableFemale,
    };
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

    return this.prisma.mawkib.create({
      data: {
        ...fields,
        serviceStartDate: serviceStartDate ? new Date(serviceStartDate) : undefined,
        serviceEndDate: serviceEndDate ? new Date(serviceEndDate) : undefined,
        status: isAdmin ? (status ?? MawkibStatus.Approved) : MawkibStatus.Pending,
        owner: { connect: { id: ownerUserId } },
      },
      include: mawkibInclude,
    });
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

  async getCapacitySnapshot(
    mawkibId: number,
    reservationDate?: Date | string,
  ): Promise<MawkibCapacitySnapshot> {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: mawkibId },
    });

    if (!mawkib) {
      throw new NotFoundException('موکب یافت نشد');
    }

    const dateFilter = parseDateOnly(reservationDate ?? new Date());

    const candidates = await this.prisma.reservation.findMany({
      where: {
        mawkibId,
        status: ReservationStatus.Confirmed,
        reservationDate: { lte: dateFilter },
        OR: [
          { reservationEndDate: { gt: dateFilter } },
          { actualCheckOutAt: { not: null } },
        ],
      },
      select: {
        reservationDate: true,
        reservationEndDate: true,
        actualCheckOutAt: true,
        maleGuestCount: true,
        femaleGuestCount: true,
      },
    });

    let reservedMale = 0;
    let reservedFemale = 0;

    for (const reservation of candidates) {
      if (!reservationOccupiesDay(reservation, dateFilter)) continue;
      reservedMale += reservation.maleGuestCount;
      reservedFemale += reservation.femaleGuestCount;
    }

    return {
      maleCapacity: mawkib.maleCapacity,
      femaleCapacity: mawkib.femaleCapacity,
      availableMale: Math.max(0, mawkib.maleCapacity - reservedMale),
      availableFemale: Math.max(0, mawkib.femaleCapacity - reservedFemale),
    };
  }

  /** @deprecated use getCapacitySnapshot */
  async getAvailableCapacity(mawkibId: number, reservationDate?: Date | string) {
    const snapshot = await this.getCapacitySnapshot(mawkibId, reservationDate);
    return totalAvailable(snapshot);
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

    const days = eachDateInRange(start, end);
    let minMale = Number.POSITIVE_INFINITY;
    let minFemale = Number.POSITIVE_INFINITY;
    let maleCapacity = 0;
    let femaleCapacity = 0;

    for (const day of days) {
      const snapshot = await this.getCapacitySnapshot(mawkibId, day);
      maleCapacity = snapshot.maleCapacity;
      femaleCapacity = snapshot.femaleCapacity;
      minMale = Math.min(minMale, snapshot.availableMale);
      minFemale = Math.min(minFemale, snapshot.availableFemale);
    }

    return {
      maleCapacity,
      femaleCapacity,
      availableMale: minMale === Number.POSITIVE_INFINITY ? 0 : minMale,
      availableFemale: minFemale === Number.POSITIVE_INFINITY ? 0 : minFemale,
    };
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
}
