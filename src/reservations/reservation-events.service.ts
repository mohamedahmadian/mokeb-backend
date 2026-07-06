import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  ReservationEventType,
  ReservationStatus,
  RoleName,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MawkibsService } from '../mawkibs/mawkibs.service';
import { MealPlansService } from '../meal-plans/meal-plans.service';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import {
  APP_TIMEZONE,
  formatDateOnlyInAppTz,
  isRecordedAtBeforeCheckInMinute,
  parseDateOnly,
} from '../common/utils/date.util';
import { RecordReservationEventDto } from './dto/reservation-event.dto';
import {
  assertEventAllowed,
  assertUniqueAttendanceSecond,
  pairReservationEvents,
  syncReservationPresenceState,
} from './reservation-event.util';

const eventUserSelect = { id: true, fullName: true } as const;

const eventInclude = {
  createdBy: { select: eventUserSelect },
} satisfies Prisma.ReservationEventInclude;

@Injectable()
export class ReservationEventsService {
  constructor(
    private prisma: PrismaService,
    private mawkibsService: MawkibsService,
    private mealPlansService: MealPlansService,
  ) {}

  private resolveRecordedAt(recordedAt?: string): Date {
    if (!recordedAt) return new Date();
    const date = new Date(recordedAt);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('زمان ثبت نامعتبر است');
    }
    return date;
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

  private eventErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      ATTENDANCE_NOT_ALLOWED: 'تا زمان تایید رزرو، امکان ثبت ورود/خروج وجود ندارد',
      CHECK_IN_ALREADY_RECORDED: 'ورود این رزرو قبلاً ثبت شده است',
      TEMP_OUT_NOT_ALLOWED: 'فقط زمانی که زائر در موکب حضور دارد می‌توان خروج موقت ثبت کرد',
      TEMP_IN_NOT_ALLOWED: 'فقط پس از خروج موقت می‌توان ورود موقت ثبت کرد',
      CHECKOUT_REQUIRES_CHECK_IN: 'ابتدا باید ورود ثبت شود',
      CHECKOUT_ALREADY_RECORDED: 'خروج نهایی این رزرو قبلاً ثبت شده است',
    };
    return messages[code] ?? 'ثبت رویداد مجاز نیست';
  }

  private reservationPresenceSelect = {
    actualCheckInAt: true,
    actualCheckOutAt: true,
    status: true,
    presenceState: true,
  } as const;

  async refreshPresenceState(reservationId: number) {
    return syncReservationPresenceState(this.prisma, reservationId);
  }

  private async ensureCheckInEventSynced(
    reservationId: number,
    reservation: { actualCheckInAt: Date | null },
    userId: number,
  ) {
    if (!reservation.actualCheckInAt) return;

    await this.syncEventFromLegacyAttendance(
      reservationId,
      ReservationEventType.CHECK_IN,
      reservation.actualCheckInAt,
      userId,
    );
  }

  private async loadEventsResponse(
    reservationId: number,
    userId: number,
  ) {
    const fullReservation = await this.prisma.reservation.findUniqueOrThrow({
      where: { id: reservationId },
      select: this.reservationPresenceSelect,
    });

    await this.ensureCheckInEventSynced(reservationId, fullReservation, userId);

    const reservation = await this.prisma.reservation.findUniqueOrThrow({
      where: { id: reservationId },
      select: this.reservationPresenceSelect,
    });

    const events = await this.prisma.reservationEvent.findMany({
      where: { reservationId },
      include: eventInclude,
      orderBy: { createdAt: 'asc' },
    });

    return {
      events,
      sessions: pairReservationEvents(events),
      presence: reservation.presenceState,
    };
  }

  private assertRecordedAtNotBeforeCheckIn(
    recordedAt: Date,
    reservation: { actualCheckInAt: Date | null },
  ) {
    if (
      reservation.actualCheckInAt &&
      isRecordedAtBeforeCheckInMinute(recordedAt, reservation.actualCheckInAt)
    ) {
      throw new BadRequestException('ساعت رویداد نمی‌تواند قبل از ورود باشد');
    }
  }

  private async assertStaffAccess(
    reservation: { mawkibId: number },
    currentUser: AuthUser,
  ) {
    const isAdmin = currentUser.roles.includes(RoleName.Admin);
    const isOwner = currentUser.roles.includes(RoleName.MawkibOwner);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'فقط مدیر یا مسئول موکب می‌تواند ورود و خروج ثبت کند',
      );
    }

    if (isOwner && !isAdmin) {
      await this.mawkibsService.assertOwnerAccess(
        reservation.mawkibId,
        currentUser.id,
      );
    }
  }

  async listForReservation(reservationId: number, currentUser: AuthUser) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { id: true, mawkibId: true },
    });

    if (!reservation) {
      throw new NotFoundException('رزرو یافت نشد');
    }

    await this.assertStaffAccess(reservation, currentUser);

    return this.loadEventsResponse(reservationId, currentUser.id);
  }

  async recordEvent(
    reservationId: number,
    dto: RecordReservationEventDto,
    currentUser: AuthUser,
  ) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('رزرو یافت نشد');
    }

    await this.assertStaffAccess(reservation, currentUser);

    if (reservation.status === ReservationStatus.Cancelled) {
      throw new BadRequestException('رزرو لغوشده قابل ثبت ورود/خروج نیست');
    }

    await this.ensureCheckInEventSynced(
      reservationId,
      reservation,
      currentUser.id,
    );

    const reservationForValidation = await this.prisma.reservation.findUniqueOrThrow({
      where: { id: reservationId },
      select: this.reservationPresenceSelect,
    });

    const existingEvents = await this.prisma.reservationEvent.findMany({
      where: { reservationId },
      orderBy: { createdAt: 'asc' },
    });

    const presence = reservationForValidation.presenceState;

    try {
      assertEventAllowed(dto.eventType, presence, reservationForValidation);
    } catch (error) {
      const code = error instanceof Error ? error.message : 'INVALID';
      throw new BadRequestException(this.eventErrorMessage(code));
    }

    const recordedAt = this.resolveRecordedAt(dto.recordedAt);
    const description = dto.description?.trim() || undefined;

    assertUniqueAttendanceSecond(recordedAt, reservationForValidation, existingEvents);

    if (
      dto.eventType === ReservationEventType.TEMP_OUT ||
      dto.eventType === ReservationEventType.TEMP_IN
    ) {
      this.assertRecordedAtNotBeforeCheckIn(recordedAt, reservationForValidation);
    }

    if (dto.eventType === ReservationEventType.EARLY_CHECKOUT) {
      if (!reservationForValidation.actualCheckInAt) {
        throw new BadRequestException('ابتدا باید ورود ثبت شود');
      }
      if (
        reservationForValidation.actualCheckInAt &&
        isRecordedAtBeforeCheckInMinute(
          recordedAt,
          reservationForValidation.actualCheckInAt,
        )
      ) {
        throw new BadRequestException('ساعت خروج نمی‌تواند قبل از ورود باشد');
      }
      return this.applyEarlyCheckout(
        reservation,
        recordedAt,
        description,
        currentUser.id,
      );
    }

    if (dto.eventType === ReservationEventType.CHECK_IN) {
      return this.applyCheckIn(
        reservation,
        recordedAt,
        description,
        currentUser.id,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const event = await tx.reservationEvent.create({
        data: {
          reservationId,
          eventType: dto.eventType,
          createdAt: recordedAt,
          createdByUserId: currentUser.id,
          description,
        },
        include: eventInclude,
      });

      const nextPresence = await syncReservationPresenceState(tx, reservationId);

      return { event, presence: nextPresence };
    });

    const attendance = await this.loadEventsResponse(
      reservationId,
      currentUser.id,
    );

    return {
      event: result.event,
      reservation: await this.prisma.reservation.findUniqueOrThrow({
        where: { id: reservationId },
      }),
      ...attendance,
      presence: result.presence,
    };
  }

  private async applyCheckIn(
    reservation: {
      id: number;
      actualCheckInAt: Date | null;
    },
    recordedAt: Date,
    description: string | undefined,
    userId: number,
  ) {
    const result = await this.prisma.$transaction(async (tx) => {
      const updatedReservation = await tx.reservation.update({
        where: { id: reservation.id },
        data: { actualCheckInAt: recordedAt },
      });

      const createdEvent = await tx.reservationEvent.create({
        data: {
          reservationId: reservation.id,
          eventType: ReservationEventType.CHECK_IN,
          createdAt: recordedAt,
          createdByUserId: userId,
          description,
        },
        include: eventInclude,
      });

      const presence = await syncReservationPresenceState(tx, reservation.id);

      return { updatedReservation, createdEvent, presence };
    });

    const attendance = await this.loadEventsResponse(reservation.id, userId);
    return {
      event: result.createdEvent,
      reservation: result.updatedReservation,
      ...attendance,
      presence: result.presence,
    };
  }

  private async applyEarlyCheckout(
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
    description: string | undefined,
    userId: number,
  ) {
    const oldEndDate = reservation.reservationEndDate;
    const newEndDate = this.resolveCheckoutEndDate(recordedAt);
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

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedReservation = await tx.reservation.update({
        where: { id: reservation.id },
        data: {
          actualCheckOutAt: recordedAt,
          reservationEndDate: newEndDate,
          plannedCheckOutTime: this.extractAppTimeString(recordedAt),
          status: ReservationStatus.Completed,
          lastStatusUpdatedByUserId: userId,
          lastStatusUpdatedAt: new Date(),
        },
      });

      const createdEvent = await tx.reservationEvent.create({
        data: {
          reservationId: reservation.id,
          eventType: ReservationEventType.EARLY_CHECKOUT,
          createdAt: recordedAt,
          createdByUserId: userId,
          description,
        },
        include: eventInclude,
      });

      const presence = await syncReservationPresenceState(tx, reservation.id);

      return { updatedReservation, createdEvent, presence };
    });

    const mealPlanResult =
      await this.mealPlansService.cancelMealPlansAfterCheckoutDate(
        reservation.id,
        newEndDate,
      );

    const attendance = await this.loadEventsResponse(reservation.id, userId);
    return {
      event: result.createdEvent,
      reservation: result.updatedReservation,
      ...attendance,
      presence: result.presence,
      mealPlanNotice: mealPlanResult.notice,
    };
  }

  /** Sync event row when legacy check-in/check-out endpoints are used. */
  async syncEventFromLegacyAttendance(
    reservationId: number,
    eventType: 'CHECK_IN' | 'EARLY_CHECKOUT',
    recordedAt: Date,
    userId: number,
  ) {
    const existing = await this.prisma.reservationEvent.findFirst({
      where: { reservationId, eventType },
    });

    if (existing) {
      await syncReservationPresenceState(this.prisma, reservationId);
      return existing;
    }

    return this.prisma.$transaction(async (tx) => {
      const event = await tx.reservationEvent.create({
        data: {
          reservationId,
          eventType,
          createdAt: recordedAt,
          createdByUserId: userId,
        },
        include: eventInclude,
      });

      await syncReservationPresenceState(tx, reservationId);

      return event;
    });
  }
}
