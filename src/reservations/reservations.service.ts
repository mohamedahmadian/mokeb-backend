import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MawkibStatus,
  Prisma,
  ReservationStatus,
  RoleName,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MawkibsService } from '../mawkibs/mawkibs.service';
import {
  CancelReservationDto,
  CreateReservationDto,
  CreateGuestReservationDto,
  SearchReservationDto,
  UpdateReservationStatusDto,
} from './dto/reservation.dto';
import {
  CreateReservationReviewDto,
  ReplyReservationReviewDto,
} from './dto/reservation-review.dto';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { parseDateOnly } from '../common/utils/date.util';
import { generateReservationTrackingCode } from '../common/utils/reservation-code.util';
import {
  buildMobileSearchPatterns,
  mobileDigitMatches,
  normalizeMobileDigits,
} from '../common/utils/mobile-search.util';
import {
  BLOCKING_RESERVATION_STATUSES,
  isExactReservationDuplicate,
} from './reservation-conflict.util';
import { resolvePlannedTimes } from './reservation-occupancy.util';

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
      defaultCheckInTime: true,
      defaultCheckOutTime: true,
    },
  },
  pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
  reservedBy: { select: { id: true, fullName: true, mobileNumber: true } },
  review: {
    include: {
      author: { select: reviewUserSelect },
      repliedBy: { select: reviewUserSelect },
    },
  },
} satisfies Prisma.ReservationInclude;

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private mawkibsService: MawkibsService,
    private usersService: UsersService,
  ) {}

  private buildSearchWhere(
    search?: SearchReservationDto,
  ): Prisma.ReservationWhereInput {
    if (!search) return {};

    const where: Prisma.ReservationWhereInput = {};

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
    if (search.pilgrimUserId) {
      where.pilgrimUserId = search.pilgrimUserId;
    }
    if (search.trackingCode) {
      where.trackingCode = {
        contains: search.trackingCode.trim(),
        mode: 'insensitive',
      };
    }
    if (search.pilgrimName || search.pilgrimMobile) {
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

  private filterByGuestCountTotal<T extends { maleGuestCount: number; femaleGuestCount: number }>(
    items: T[],
    search?: SearchReservationDto,
  ): T[] {
    if (!search?.guestCountMin && !search?.guestCountMax) return items;
    return items.filter((item) => {
      const total = item.maleGuestCount + item.femaleGuestCount;
      if (search.guestCountMin && total < search.guestCountMin) return false;
      if (search.guestCountMax && total > search.guestCountMax) return false;
      return true;
    });
  }

  async findAllAdmin(search?: SearchReservationDto) {
    const items = await this.prisma.reservation.findMany({
      where: this.buildSearchWhere(search),
      include: reservationInclude,
      orderBy: { createdAt: 'desc' },
    });
    return this.filterReservationsByMobileSearch(
      this.filterByGuestCountTotal(items, search),
      search,
    );
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
    return this.filterReservationsByMobileSearch(
      this.filterByGuestCountTotal(items, search),
      search,
    );
  }

  async findByMawkibOwner(ownerUserId: number, search?: SearchReservationDto) {
    const mawkibs = await this.prisma.mawkib.findMany({
      where: { ownerUserId },
      select: { id: true },
    });

    const mawkibIds = mawkibs.map((m) => m.id);

    if (search?.mawkibId && !mawkibIds.includes(search.mawkibId)) {
      return [];
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
    let filtered = this.filterByGuestCountTotal(items, search);

    return this.filterReservationsByMobileSearch(filtered, search);
  }

  private filterReservationsByMobileSearch<
    T extends {
      pilgrimMobile: string;
      pilgrim: { mobileNumber: string };
    },
  >(items: T[], search?: SearchReservationDto): T[] {
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

    const guestInclude = {
      mawkib: { select: { id: true, name: true, address: true } },
      pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
      reservedBy: { select: { id: true, fullName: true, mobileNumber: true } },
    } satisfies Prisma.ReservationInclude;

    const reservations = await this.prisma.reservation.findMany({
      where: {
        OR: patterns.flatMap((pattern) => [
          { pilgrimMobile: { contains: pattern, mode: 'insensitive' } },
          { pilgrim: { mobileNumber: { contains: pattern, mode: 'insensitive' } } },
        ]),
      },
      include: guestInclude,
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

  private async createWithTrackingCode(
    data: Omit<Prisma.ReservationUncheckedCreateInput, 'trackingCode'>,
    include: Prisma.ReservationInclude = reservationInclude,
  ) {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.prisma.reservation.create({
          data: {
            ...data,
            trackingCode: generateReservationTrackingCode(),
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
        reservationDate: { lte: params.reservationEndDate },
        reservationEndDate: { gte: params.reservationDate },
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
      throw new BadRequestException(
        'رزرو تکراری با همین موکب، بازه تاریخ و تعداد نفرات برای این زائر وجود دارد',
      );
    }

    throw new BadRequestException(
      `این زائر در بازه تاریخ انتخابی رزرو فعال دیگری دارد (کد: ${conflict.trackingCode}${conflict.mawkib?.name ? ` — ${conflict.mawkib.name}` : ''})`,
    );
  }

  async create(dto: CreateReservationDto, currentUser: AuthUser) {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: dto.mawkibId },
    });

    if (!mawkib || mawkib.status !== MawkibStatus.Approved) {
      throw new BadRequestException('موکب یافت نشد یا تایید نشده است');
    }

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
      throw new BadRequestException('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد');
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

    return this.createWithTrackingCode({
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
      status: isAdmin ? ReservationStatus.Confirmed : ReservationStatus.Pending,
    });
  }

  async createGuest(dto: CreateGuestReservationDto) {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: dto.mawkibId },
    });

    if (!mawkib || mawkib.status !== MawkibStatus.Approved) {
      throw new BadRequestException('موکب یافت نشد یا تایید نشده است');
    }

    const reservationDate = parseDateOnly(dto.reservationDate);
    const reservationEndDate = parseDateOnly(
      dto.reservationEndDate ?? dto.reservationDate,
    );

    if (reservationEndDate < reservationDate) {
      throw new BadRequestException('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد');
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
        companions: dto.companions?.trim() || undefined,
        status: ReservationStatus.Pending,
      },
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

    return {
      message:
        'درخواست رزرو شما ثبت شد و پس از بررسی مدیریت، نتیجه اعلام خواهد شد',
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

    return this.prisma.reservation.update({
      where: { id },
      data: { status: dto.status },
      include: reservationInclude,
    });
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

    if (isAdmin) {
      // full access
    } else if (isPilgrim && !isAdmin && !isOwner) {
      if (reservation.pilgrimUserId !== currentUser.id) {
        throw new ForbiddenException('فقط رزروهای خودتان را می‌توانید لغو کنید');
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

    return this.prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.Cancelled,
        cancellationNote: note,
      },
      include: reservationInclude,
    });
  }

  async remove(id: number) {
    const reservation = await this.findOne(id);
    await this.prisma.reservation.delete({ where: { id: reservation.id } });
    return { id, message: 'رزرو با موفقیت حذف شد' };
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

  async checkIn(id: number, currentUser: AuthUser) {
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

    if (reservation.actualCheckInAt) {
      throw new BadRequestException('ورود این رزرو قبلاً ثبت شده است');
    }

    if (reservation.actualCheckOutAt) {
      throw new BadRequestException('این رزرو قبلاً خروج خورده است');
    }

    return this.prisma.reservation.update({
      where: { id },
      data: { actualCheckInAt: new Date() },
      include: reservationInclude,
    });
  }

  async checkOut(id: number, currentUser: AuthUser) {
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

    if (!reservation.actualCheckInAt) {
      throw new BadRequestException('ابتدا باید ورود ثبت شود');
    }

    if (reservation.actualCheckOutAt) {
      throw new BadRequestException('خروج این رزرو قبلاً ثبت شده است');
    }

    return this.prisma.reservation.update({
      where: { id },
      data: {
        actualCheckOutAt: new Date(),
        status: ReservationStatus.Completed,
      },
      include: reservationInclude,
    });
  }

  async checkInGuest(trackingCode: string) {
    const reservation = await this.findByTrackingCode(trackingCode);
    this.assertCanRecordAttendance(reservation);

    if (reservation.actualCheckInAt) {
      throw new BadRequestException('ورود این رزرو قبلاً ثبت شده است');
    }

    if (reservation.actualCheckOutAt) {
      throw new BadRequestException('این رزرو قبلاً خروج خورده است');
    }

    return this.prisma.reservation.update({
      where: { id: reservation.id },
      data: { actualCheckInAt: new Date() },
      include: reservationInclude,
    });
  }

  async checkOutGuest(trackingCode: string) {
    const reservation = await this.findByTrackingCode(trackingCode);
    this.assertCanRecordAttendance(reservation);

    if (!reservation.actualCheckInAt) {
      throw new BadRequestException('ابتدا باید ورود ثبت شود');
    }

    if (reservation.actualCheckOutAt) {
      throw new BadRequestException('خروج این رزرو قبلاً ثبت شده است');
    }

    return this.prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        actualCheckOutAt: new Date(),
        status: ReservationStatus.Completed,
      },
      include: reservationInclude,
    });
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
}
