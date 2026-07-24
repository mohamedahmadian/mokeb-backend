import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MealType,
  ReservationPresenceState,
  ReservationStatus,
  RoleName,
  type Prisma,
} from '@prisma/client';
import { eachMealPlanDayInStay, formatDateOnly, parseDateOnly } from '../common/utils/date.util';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { MawkibsService } from '../mawkibs/mawkibs.service';
import { PrismaService } from '../prisma/prisma.service';
import { resolvePresenceStateAsOf } from '../reservations/reservation-event.util';
import type { AddMealPlanDayDto, SaveMealPlansDto, UpsertMealPlanEntryDto } from './dto/meal-plan.dto';
import type { PresentAttendeesReportQueryDto } from './dto/present-attendees-report.dto';

const MEAL_TYPES: MealType[] = [
  MealType.Breakfast,
  MealType.Lunch,
  MealType.Dinner,
];

const mealPlanSelect = {
  id: true,
  reservationId: true,
  date: true,
  mealType: true,
  guestCount: true,
  isRequired: true,
  isServed: true,
  servedAt: true,
} satisfies Prisma.MealPlanSelect;

export const MEAL_PLAN_MANUAL_CANCEL_TODAY_MESSAGE =
  'در صورت داشتن رزرو غذا برای روز جاری، لطفاً به‌صورت دستی آن‌ها را لغو نمایید.';

@Injectable()
export class MealPlansService {
  constructor(
    private prisma: PrismaService,
    private mawkibsService: MawkibsService,
  ) {}

  private async assertReservationAccess(
    reservationId: number,
    user: AuthUser,
  ) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: {
        id: true,
        mawkibId: true,
        status: true,
        reservationDate: true,
        reservationEndDate: true,
        maleGuestCount: true,
        femaleGuestCount: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException('رزرو یافت نشد');
    }

    const isAdmin = user.roles.includes(RoleName.Admin);
    const isOwner = user.roles.includes(RoleName.MawkibOwner);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('شما مجوز دسترسی به برنامه غذایی را ندارید');
    }

    if (!isAdmin && isOwner) {
      await this.mawkibsService.assertOwnerAccess(
        reservation.mawkibId,
        user.id,
      );
    }

    return reservation;
  }

  private assertMealPlanEligible(status: ReservationStatus) {
    if (
      status !== ReservationStatus.Confirmed &&
      status !== ReservationStatus.Completed
    ) {
      throw new BadRequestException(
        'برنامه غذایی فقط برای رزروهای تایید شده یا تکمیل‌شده قابل مدیریت است',
      );
    }
  }

  private stayDates(reservationDate: Date, reservationEndDate: Date): Date[] {
    return eachMealPlanDayInStay(reservationDate, reservationEndDate);
  }

  private guestCountFromReservation(
    maleGuestCount: number,
    femaleGuestCount: number,
  ): number {
    return Math.max(1, maleGuestCount + femaleGuestCount);
  }

  private buildDefaultMealPlanRows(
    reservationId: number,
    reservationDate: Date,
    reservationEndDate: Date,
    guestCount: number,
  ) {
    const days = this.stayDates(reservationDate, reservationEndDate);
    return days.flatMap((day) =>
      MEAL_TYPES.map((mealType) => ({
        reservationId,
        date: day,
        mealType,
        guestCount,
        isRequired: true,
      })),
    );
  }

  async autoGenerateForNewReservation(params: {
    reservationId: number;
    mawkibId: number;
    reservationDate: Date;
    reservationEndDate: Date;
    maleGuestCount: number;
    femaleGuestCount: number;
  }) {
    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: params.mawkibId },
      select: { mealPlanManagementEnabled: true },
    });

    if (!mawkib?.mealPlanManagementEnabled) {
      return;
    }

    const guestCount = this.guestCountFromReservation(
      params.maleGuestCount,
      params.femaleGuestCount,
    );

    const data = this.buildDefaultMealPlanRows(
      params.reservationId,
      params.reservationDate,
      params.reservationEndDate,
      guestCount,
    );

    if (data.length === 0) {
      return;
    }

    await this.prisma.mealPlan.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async findByReservation(reservationId: number, user: AuthUser) {
    await this.assertReservationAccess(reservationId, user);

    return this.prisma.mealPlan.findMany({
      where: { reservationId },
      select: mealPlanSelect,
      orderBy: [{ date: 'asc' }, { mealType: 'asc' }],
    });
  }

  async generateForReservation(reservationId: number, user: AuthUser) {
    const reservation = await this.assertReservationAccess(reservationId, user);
    this.assertMealPlanEligible(reservation.status);

    const days = this.stayDates(
      reservation.reservationDate,
      reservation.reservationEndDate,
    );

    if (days.length === 0) {
      throw new BadRequestException('بازه اقامت رزرو برای ایجاد برنامه غذایی معتبر نیست');
    }

    const guestCount = this.guestCountFromReservation(
      reservation.maleGuestCount,
      reservation.femaleGuestCount,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.mealPlan.deleteMany({ where: { reservationId } });

      await tx.mealPlan.createMany({
        data: this.buildDefaultMealPlanRows(
          reservationId,
          reservation.reservationDate,
          reservation.reservationEndDate,
          guestCount,
        ),
      });
    });

    return this.findByReservation(reservationId, user);
  }

  async saveForReservation(
    reservationId: number,
    dto: SaveMealPlansDto,
    user: AuthUser,
  ) {
    const reservation = await this.assertReservationAccess(reservationId, user);
    this.assertMealPlanEligible(reservation.status);

    const payloadIds = new Set(
      dto.entries.filter((entry) => entry.id != null).map((entry) => entry.id!),
    );

    const existing = await this.prisma.mealPlan.findMany({
      where: { reservationId },
      select: { id: true },
    });

    const toDelete = existing
      .map((row) => row.id)
      .filter((id) => !payloadIds.has(id));

    await this.prisma.$transaction(async (tx) => {
      if (toDelete.length > 0) {
        await tx.mealPlan.deleteMany({
          where: { id: { in: toDelete }, reservationId },
        });
      }

      for (const entry of dto.entries) {
        const date = parseDateOnly(entry.date);

        if (entry.id) {
          const current = await tx.mealPlan.findFirst({
            where: { id: entry.id, reservationId },
          });
          if (!current) {
            throw new BadRequestException('رکورد برنامه غذایی نامعتبر است');
          }

          await tx.mealPlan.update({
            where: { id: entry.id },
            data: {
              date,
              mealType: entry.mealType,
              isRequired: entry.isRequired,
              ...(entry.guestCount != null && !current.isServed
                ? { guestCount: entry.guestCount }
                : {}),
            },
          });
        } else {
          const guestCount =
            entry.guestCount ??
            this.guestCountFromReservation(
              reservation.maleGuestCount,
              reservation.femaleGuestCount,
            );

          await tx.mealPlan.upsert({
            where: {
              reservationId_date_mealType: {
                reservationId,
                date,
                mealType: entry.mealType,
              },
            },
            create: {
              reservationId,
              date,
              mealType: entry.mealType,
              isRequired: entry.isRequired,
              guestCount,
            },
            update: {
              isRequired: entry.isRequired,
              ...(entry.guestCount != null ? { guestCount: entry.guestCount } : {}),
            },
          });
        }
      }
    });

    return this.findByReservation(reservationId, user);
  }

  async addDay(
    reservationId: number,
    dto: AddMealPlanDayDto,
    user: AuthUser,
  ) {
    const reservation = await this.assertReservationAccess(reservationId, user);
    this.assertMealPlanEligible(reservation.status);

    const date = parseDateOnly(dto.date);

    const guestCount = this.guestCountFromReservation(
      reservation.maleGuestCount,
      reservation.femaleGuestCount,
    );

    await this.prisma.mealPlan.createMany({
      data: MEAL_TYPES.map((mealType) => ({
        reservationId,
        date,
        mealType,
        guestCount,
        isRequired: true,
      })),
      skipDuplicates: true,
    });

    return this.findByReservation(reservationId, user);
  }

  async removeDay(reservationId: number, dateStr: string, user: AuthUser) {
    await this.assertReservationAccess(reservationId, user);

    const date = parseDateOnly(dateStr);

    await this.prisma.mealPlan.deleteMany({
      where: { reservationId, date },
    });

    return this.findByReservation(reservationId, user);
  }

  async upsertMealEntry(
    reservationId: number,
    dto: UpsertMealPlanEntryDto,
    user: AuthUser,
  ) {
    const reservation = await this.assertReservationAccess(reservationId, user);
    this.assertMealPlanEligible(reservation.status);

    const date = parseDateOnly(dto.date);
    const existing = await this.prisma.mealPlan.findUnique({
      where: {
        reservationId_date_mealType: {
          reservationId,
          date,
          mealType: dto.mealType,
        },
      },
      select: { id: true, isServed: true },
    });

    if (existing?.isServed && !dto.isRequired) {
      throw new BadRequestException(
        'وعده تحویل‌داده‌شده را نمی‌توان لغو کرد',
      );
    }

    const guestCount = this.guestCountFromReservation(
      reservation.maleGuestCount,
      reservation.femaleGuestCount,
    );

    await this.prisma.mealPlan.upsert({
      where: {
        reservationId_date_mealType: {
          reservationId,
          date,
          mealType: dto.mealType,
        },
      },
      create: {
        reservationId,
        date,
        mealType: dto.mealType,
        isRequired: dto.isRequired,
        guestCount: dto.guestCount ?? guestCount,
      },
      update: {
        isRequired: dto.isRequired,
        ...(dto.guestCount != null ? { guestCount: dto.guestCount } : {}),
      },
    });

    return this.findByReservation(reservationId, user);
  }

  async cancelMealPlansAfterCheckoutDate(
    reservationId: number,
    checkoutDate: Date,
    tx?: Prisma.TransactionClient,
  ) {
    const db = tx ?? this.prisma;
    const checkoutDay = parseDateOnly(formatDateOnly(checkoutDate));

    const updated = await db.mealPlan.updateMany({
      where: {
        reservationId,
        date: { gt: checkoutDay },
        isRequired: true,
      },
      data: { isRequired: false },
    });

    const activeOnCheckoutDay = await db.mealPlan.count({
      where: {
        reservationId,
        date: checkoutDay,
        isRequired: true,
      },
    });

    return {
      cancelledCount: updated.count,
      hasActiveMealsOnCheckoutDay: activeOnCheckoutDay > 0,
      notice: activeOnCheckoutDay > 0 ? MEAL_PLAN_MANUAL_CANCEL_TODAY_MESSAGE : undefined,
    };
  }

  async markServed(mealPlanId: number, guestCount: number, user: AuthUser) {
    const row = await this.prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
      include: {
        reservation: {
          select: { id: true, mawkibId: true, status: true },
        },
      },
    });

    if (!row) {
      throw new NotFoundException('وعده غذایی یافت نشد');
    }

    await this.assertReservationAccess(row.reservationId, user);
    this.assertMealPlanEligible(row.reservation.status);

    if (!row.isRequired) {
      throw new BadRequestException('این وعده برای زائر فعال نیست');
    }

    if (row.isServed) {
      throw new BadRequestException('این وعده قبلاً تحویل داده شده است');
    }

    return this.prisma.mealPlan.update({
      where: { id: mealPlanId },
      data: {
        isServed: true,
        guestCount,
        servedAt: new Date(),
      },
      select: mealPlanSelect,
    });
  }

  async getPresentAttendeesReport(
    query: PresentAttendeesReportQueryDto,
    user: AuthUser,
  ) {
    const isAdmin = user.roles.includes(RoleName.Admin);
    const isOwner = user.roles.includes(RoleName.MawkibOwner);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('شما مجوز دسترسی به این گزارش را ندارید');
    }

    if (!isAdmin && isOwner) {
      await this.mawkibsService.assertOwnerAccess(query.mawkibId, user.id);
    }

    const mawkib = await this.prisma.mawkib.findUnique({
      where: { id: query.mawkibId },
      select: { id: true, name: true },
    });

    if (!mawkib) {
      throw new NotFoundException('موکب یافت نشد');
    }

    const reportDate = parseDateOnly(query.date);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        mawkibId: query.mawkibId,
        status: {
          in: [ReservationStatus.Confirmed, ReservationStatus.Completed],
        },
        reservationDate: { lte: reportDate },
        reservationEndDate: { gte: reportDate },
        mealPlans: {
          some: {
            date: reportDate,
            mealType: query.mealType,
            isRequired: true,
          },
        },
      },
      select: {
        id: true,
        trackingCode: true,
        pilgrimMobile: true,
        maleGuestCount: true,
        femaleGuestCount: true,
        actualCheckInAt: true,
        actualCheckOutAt: true,
        pilgrim: {
          select: {
            fullName: true,
            mobileNumber: true,
            nationalId: true,
            gender: true,
          },
        },
        events: {
          select: {
            eventType: true,
            createdAt: true,
          },
        },
        mealPlans: {
          where: {
            date: reportDate,
            mealType: query.mealType,
            isRequired: true,
          },
          select: {
            id: true,
            guestCount: true,
            isServed: true,
          },
        },
      },
      orderBy: [{ pilgrim: { fullName: 'asc' } }],
    });

    const rows = reservations.map((reservation) => {
      const presence = resolvePresenceStateAsOf(
        reservation.events,
        {
          actualCheckInAt: reservation.actualCheckInAt,
          actualCheckOutAt: reservation.actualCheckOutAt,
        },
        reportDate,
      );
      const isPresent = presence === ReservationPresenceState.PRESENT;
      const mealPlan = reservation.mealPlans[0];
      const isServed = mealPlan?.isServed ?? false;
      const guestCount = mealPlan?.guestCount ?? 1;

      return {
        reservationId: reservation.id,
        mealPlanId: mealPlan?.id ?? null,
        trackingCode: reservation.trackingCode,
        fullName: reservation.pilgrim.fullName,
        mobile:
          reservation.pilgrimMobile || reservation.pilgrim.mobileNumber || '',
        nationalId: reservation.pilgrim.nationalId,
        gender: reservation.pilgrim.gender,
        maleGuestCount: reservation.maleGuestCount,
        femaleGuestCount: reservation.femaleGuestCount,
        guestCount,
        isPresent,
        presence: isPresent ? 'دارد' : 'ندارد',
        isServed,
      };
    });

    const present = rows.filter((row) => row.isPresent).length;

    return {
      mawkibId: mawkib.id,
      mawkibName: mawkib.name,
      date: formatDateOnly(reportDate),
      mealType: query.mealType,
      stats: {
        total: rows.length,
        present,
        absent: rows.length - present,
      },
      rows,
    };
  }
}
