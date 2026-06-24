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
import { AuthUser } from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { parseDateOnly } from '../common/utils/date.util';
import { generateReservationTrackingCode } from '../common/utils/reservation-code.util';

const reservationInclude = {
  mawkib: { select: { id: true, name: true } },
  pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
  reservedBy: { select: { id: true, fullName: true, mobileNumber: true } },
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
    if (search.pilgrimName || search.pilgrimMobile) {
      where.pilgrim = {
        ...(search.pilgrimName && {
          fullName: { contains: search.pilgrimName, mode: 'insensitive' },
        }),
        ...(search.pilgrimMobile && {
          mobileNumber: { contains: search.pilgrimMobile, mode: 'insensitive' },
        }),
      };
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
    return this.filterByGuestCountTotal(items, search);
  }

  async findByPilgrim(pilgrimUserId: number, search?: SearchReservationDto) {
    const items = await this.prisma.reservation.findMany({
      where: {
        pilgrimUserId,
        ...this.buildSearchWhere(search),
      },
      include: {
        mawkib: { select: { id: true, name: true, address: true } },
        pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
        reservedBy: { select: { id: true, fullName: true, mobileNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.filterByGuestCountTotal(items, search);
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
    return this.filterByGuestCountTotal(items, search);
  }

  async findOne(id: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        mawkib: true,
        pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
        reservedBy: { select: { id: true, fullName: true, mobileNumber: true } },
      },
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
      include: {
        mawkib: { select: { id: true, name: true, address: true } },
        pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
        reservedBy: { select: { id: true, fullName: true, mobileNumber: true } },
      },
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

    const guestInclude = {
      mawkib: { select: { id: true, name: true, address: true } },
      pilgrim: { select: { id: true, fullName: true, mobileNumber: true } },
      reservedBy: { select: { id: true, fullName: true, mobileNumber: true } },
    } satisfies Prisma.ReservationInclude;

    const reservations = await this.prisma.reservation.findMany({
      where: {
        OR: [{ pilgrimMobile: mobile }, { pilgrim: { mobileNumber: mobile } }],
      },
      include: guestInclude,
      orderBy: { createdAt: 'desc' },
      take: 2,
    });

    if (reservations.length === 0) {
      throw new NotFoundException('رزروی با این شماره موبایل یافت نشد');
    }

    return reservations;
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

    return this.createWithTrackingCode({
      mawkibId: dto.mawkibId,
      pilgrimUserId,
      reservedByUserId: currentUser.id,
      reservationDate,
      reservationEndDate,
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
    });

    const reservation = await this.createWithTrackingCode(
      {
        mawkibId: dto.mawkibId,
        pilgrimUserId: pilgrim.id,
        reservedByUserId: pilgrim.id,
        reservationDate,
        reservationEndDate,
        maleGuestCount: dto.maleGuestCount,
        femaleGuestCount: dto.femaleGuestCount,
        pilgrimMobile: mobileNumber,
        description: dto.description?.trim() || undefined,
        companions: dto.companions?.trim() || undefined,
        status: ReservationStatus.Pending,
      },
      {
        mawkib: { select: { id: true, name: true } },
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
}
