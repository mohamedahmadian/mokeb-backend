"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationEventsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const mawkibs_service_1 = require("../mawkibs/mawkibs.service");
const meal_plans_service_1 = require("../meal-plans/meal-plans.service");
const date_util_1 = require("../common/utils/date.util");
const reservation_event_util_1 = require("./reservation-event.util");
const eventUserSelect = { id: true, fullName: true };
const eventInclude = {
    createdBy: { select: eventUserSelect },
};
let ReservationEventsService = class ReservationEventsService {
    prisma;
    mawkibsService;
    mealPlansService;
    constructor(prisma, mawkibsService, mealPlansService) {
        this.prisma = prisma;
        this.mawkibsService = mawkibsService;
        this.mealPlansService = mealPlansService;
    }
    resolveRecordedAt(recordedAt) {
        if (!recordedAt)
            return new Date();
        const date = new Date(recordedAt);
        if (Number.isNaN(date.getTime())) {
            throw new common_1.BadRequestException('زمان ثبت نامعتبر است');
        }
        return date;
    }
    extractAppTimeString(date) {
        const parts = new Intl.DateTimeFormat('en-GB', {
            timeZone: date_util_1.APP_TIMEZONE,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).formatToParts(date);
        const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
        const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
        return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    }
    resolveCheckoutEndDate(recordedAt) {
        return (0, date_util_1.parseDateOnly)((0, date_util_1.formatDateOnlyInAppTz)(recordedAt));
    }
    eventErrorMessage(code) {
        const messages = {
            ATTENDANCE_NOT_ALLOWED: 'تا زمان تایید رزرو، امکان ثبت ورود/خروج وجود ندارد',
            CHECK_IN_ALREADY_RECORDED: 'ورود این رزرو قبلاً ثبت شده است',
            TEMP_OUT_NOT_ALLOWED: 'فقط زمانی که زائر در موکب حضور دارد می‌توان خروج موقت ثبت کرد',
            TEMP_IN_NOT_ALLOWED: 'فقط پس از خروج موقت می‌توان ورود موقت ثبت کرد',
            CHECKOUT_REQUIRES_CHECK_IN: 'ابتدا باید ورود ثبت شود',
            CHECKOUT_ALREADY_RECORDED: 'خروج نهایی این رزرو قبلاً ثبت شده است',
        };
        return messages[code] ?? 'ثبت رویداد مجاز نیست';
    }
    reservationPresenceSelect = {
        actualCheckInAt: true,
        actualCheckOutAt: true,
        status: true,
        presenceState: true,
    };
    async refreshPresenceState(reservationId) {
        return (0, reservation_event_util_1.syncReservationPresenceState)(this.prisma, reservationId);
    }
    async ensureCheckInEventSynced(reservationId, reservation, userId) {
        if (!reservation.actualCheckInAt)
            return;
        await this.syncEventFromLegacyAttendance(reservationId, client_1.ReservationEventType.CHECK_IN, reservation.actualCheckInAt, userId);
    }
    async loadEventsResponse(reservationId, userId) {
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
            sessions: (0, reservation_event_util_1.pairReservationEvents)(events),
            presence: reservation.presenceState,
        };
    }
    assertRecordedAtNotBeforeCheckIn(recordedAt, reservation) {
        if (reservation.actualCheckInAt &&
            (0, date_util_1.isRecordedAtBeforeCheckInMinute)(recordedAt, reservation.actualCheckInAt)) {
            throw new common_1.BadRequestException('ساعت رویداد نمی‌تواند قبل از ورود باشد');
        }
    }
    async assertStaffAccess(reservation, currentUser) {
        const isAdmin = currentUser.roles.includes(client_1.RoleName.Admin);
        const isOwner = currentUser.roles.includes(client_1.RoleName.MawkibOwner);
        if (!isAdmin && !isOwner) {
            throw new common_1.ForbiddenException('فقط مدیر یا مسئول موکب می‌تواند ورود و خروج ثبت کند');
        }
        if (isOwner && !isAdmin) {
            await this.mawkibsService.assertOwnerAccess(reservation.mawkibId, currentUser.id);
        }
    }
    async listForReservation(reservationId, currentUser) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            select: { id: true, mawkibId: true },
        });
        if (!reservation) {
            throw new common_1.NotFoundException('رزرو یافت نشد');
        }
        await this.assertStaffAccess(reservation, currentUser);
        return this.loadEventsResponse(reservationId, currentUser.id);
    }
    async recordEvent(reservationId, dto, currentUser) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
        });
        if (!reservation) {
            throw new common_1.NotFoundException('رزرو یافت نشد');
        }
        await this.assertStaffAccess(reservation, currentUser);
        if (reservation.status === client_1.ReservationStatus.Cancelled) {
            throw new common_1.BadRequestException('رزرو لغوشده قابل ثبت ورود/خروج نیست');
        }
        await this.ensureCheckInEventSynced(reservationId, reservation, currentUser.id);
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
            (0, reservation_event_util_1.assertEventAllowed)(dto.eventType, presence, reservationForValidation);
        }
        catch (error) {
            const code = error instanceof Error ? error.message : 'INVALID';
            throw new common_1.BadRequestException(this.eventErrorMessage(code));
        }
        const recordedAt = this.resolveRecordedAt(dto.recordedAt);
        const description = dto.description?.trim() || undefined;
        (0, reservation_event_util_1.assertUniqueAttendanceSecond)(recordedAt, reservationForValidation, existingEvents);
        if (dto.eventType === client_1.ReservationEventType.TEMP_OUT ||
            dto.eventType === client_1.ReservationEventType.TEMP_IN) {
            this.assertRecordedAtNotBeforeCheckIn(recordedAt, reservationForValidation);
        }
        if (dto.eventType === client_1.ReservationEventType.EARLY_CHECKOUT) {
            if (!reservationForValidation.actualCheckInAt) {
                throw new common_1.BadRequestException('ابتدا باید ورود ثبت شود');
            }
            if (reservationForValidation.actualCheckInAt &&
                (0, date_util_1.isRecordedAtBeforeCheckInMinute)(recordedAt, reservationForValidation.actualCheckInAt)) {
                throw new common_1.BadRequestException('ساعت خروج نمی‌تواند قبل از ورود باشد');
            }
            return this.applyEarlyCheckout(reservation, recordedAt, description, currentUser.id);
        }
        if (dto.eventType === client_1.ReservationEventType.CHECK_IN) {
            return this.applyCheckIn(reservation, recordedAt, description, currentUser.id);
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
            const nextPresence = await (0, reservation_event_util_1.syncReservationPresenceState)(tx, reservationId);
            return { event, presence: nextPresence };
        });
        const attendance = await this.loadEventsResponse(reservationId, currentUser.id);
        return {
            event: result.event,
            reservation: await this.prisma.reservation.findUniqueOrThrow({
                where: { id: reservationId },
            }),
            ...attendance,
            presence: result.presence,
        };
    }
    async applyCheckIn(reservation, recordedAt, description, userId) {
        const result = await this.prisma.$transaction(async (tx) => {
            const updatedReservation = await tx.reservation.update({
                where: { id: reservation.id },
                data: { actualCheckInAt: recordedAt },
            });
            const createdEvent = await tx.reservationEvent.create({
                data: {
                    reservationId: reservation.id,
                    eventType: client_1.ReservationEventType.CHECK_IN,
                    createdAt: recordedAt,
                    createdByUserId: userId,
                    description,
                },
                include: eventInclude,
            });
            const presence = await (0, reservation_event_util_1.syncReservationPresenceState)(tx, reservation.id);
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
    async applyEarlyCheckout(reservation, recordedAt, description, userId) {
        const oldEndDate = reservation.reservationEndDate;
        const newEndDate = this.resolveCheckoutEndDate(recordedAt);
        const stayStart = (0, date_util_1.parseDateOnly)(reservation.reservationDate);
        const plannedEnd = (0, date_util_1.parseDateOnly)(reservation.reservationEndDate);
        if (newEndDate < stayStart) {
            throw new common_1.BadRequestException('تاریخ خروج نمی‌تواند قبل از شروع اقامت باشد');
        }
        if (newEndDate > plannedEnd) {
            throw new common_1.BadRequestException('تاریخ خروج نمی‌تواند بعد از پایان برنامه‌ریزی‌شده اقامت باشد');
        }
        await this.mawkibsService.syncInventoryOnEndDateChange({
            mawkibId: reservation.mawkibId,
            reservationDate: reservation.reservationDate,
            maleGuestCount: reservation.maleGuestCount,
            femaleGuestCount: reservation.femaleGuestCount,
        }, oldEndDate, newEndDate);
        const result = await this.prisma.$transaction(async (tx) => {
            const updatedReservation = await tx.reservation.update({
                where: { id: reservation.id },
                data: {
                    actualCheckOutAt: recordedAt,
                    reservationEndDate: newEndDate,
                    plannedCheckOutTime: this.extractAppTimeString(recordedAt),
                    status: client_1.ReservationStatus.Completed,
                    lastStatusUpdatedByUserId: userId,
                    lastStatusUpdatedAt: new Date(),
                },
            });
            const createdEvent = await tx.reservationEvent.create({
                data: {
                    reservationId: reservation.id,
                    eventType: client_1.ReservationEventType.EARLY_CHECKOUT,
                    createdAt: recordedAt,
                    createdByUserId: userId,
                    description,
                },
                include: eventInclude,
            });
            const presence = await (0, reservation_event_util_1.syncReservationPresenceState)(tx, reservation.id);
            return { updatedReservation, createdEvent, presence };
        });
        const mealPlanResult = await this.mealPlansService.cancelMealPlansAfterCheckoutDate(reservation.id, newEndDate);
        const attendance = await this.loadEventsResponse(reservation.id, userId);
        return {
            event: result.createdEvent,
            reservation: result.updatedReservation,
            ...attendance,
            presence: result.presence,
            mealPlanNotice: mealPlanResult.notice,
        };
    }
    async syncEventFromLegacyAttendance(reservationId, eventType, recordedAt, userId) {
        const existing = await this.prisma.reservationEvent.findFirst({
            where: { reservationId, eventType },
        });
        if (existing) {
            await (0, reservation_event_util_1.syncReservationPresenceState)(this.prisma, reservationId);
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
            await (0, reservation_event_util_1.syncReservationPresenceState)(tx, reservationId);
            return event;
        });
    }
};
exports.ReservationEventsService = ReservationEventsService;
exports.ReservationEventsService = ReservationEventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mawkibs_service_1.MawkibsService,
        meal_plans_service_1.MealPlansService])
], ReservationEventsService);
//# sourceMappingURL=reservation-events.service.js.map