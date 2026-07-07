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
exports.MealPlansService = exports.MEAL_PLAN_MANUAL_CANCEL_TODAY_MESSAGE = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const date_util_1 = require("../common/utils/date.util");
const mawkibs_service_1 = require("../mawkibs/mawkibs.service");
const prisma_service_1 = require("../prisma/prisma.service");
const reservation_event_util_1 = require("../reservations/reservation-event.util");
const MEAL_TYPES = [
    client_1.MealType.Breakfast,
    client_1.MealType.Lunch,
    client_1.MealType.Dinner,
];
const mealPlanSelect = {
    id: true,
    reservationId: true,
    date: true,
    mealType: true,
    isRequired: true,
    isServed: true,
    servedAt: true,
};
exports.MEAL_PLAN_MANUAL_CANCEL_TODAY_MESSAGE = 'در صورت داشتن رزرو غذا برای روز جاری، لطفاً به‌صورت دستی آن‌ها را لغو نمایید.';
let MealPlansService = class MealPlansService {
    prisma;
    mawkibsService;
    constructor(prisma, mawkibsService) {
        this.prisma = prisma;
        this.mawkibsService = mawkibsService;
    }
    async assertReservationAccess(reservationId, user) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            select: {
                id: true,
                mawkibId: true,
                status: true,
                reservationDate: true,
                reservationEndDate: true,
            },
        });
        if (!reservation) {
            throw new common_1.NotFoundException('رزرو یافت نشد');
        }
        const isAdmin = user.roles.includes(client_1.RoleName.Admin);
        const isOwner = user.roles.includes(client_1.RoleName.MawkibOwner);
        if (!isAdmin && !isOwner) {
            throw new common_1.ForbiddenException('شما مجوز دسترسی به برنامه غذایی را ندارید');
        }
        if (!isAdmin && isOwner) {
            await this.mawkibsService.assertOwnerAccess(reservation.mawkibId, user.id);
        }
        return reservation;
    }
    assertMealPlanEligible(status) {
        if (status !== client_1.ReservationStatus.Confirmed &&
            status !== client_1.ReservationStatus.Completed) {
            throw new common_1.BadRequestException('برنامه غذایی فقط برای رزروهای تایید شده یا تکمیل‌شده قابل مدیریت است');
        }
    }
    stayDates(reservationDate, reservationEndDate) {
        return (0, date_util_1.eachMealPlanDayInStay)(reservationDate, reservationEndDate);
    }
    buildDefaultMealPlanRows(reservationId, reservationDate, reservationEndDate) {
        const days = this.stayDates(reservationDate, reservationEndDate);
        return days.flatMap((day) => MEAL_TYPES.map((mealType) => ({
            reservationId,
            date: day,
            mealType,
            isRequired: true,
        })));
    }
    async autoGenerateForNewReservation(params) {
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: params.mawkibId },
            select: { mealPlanManagementEnabled: true },
        });
        if (!mawkib?.mealPlanManagementEnabled) {
            return;
        }
        const data = this.buildDefaultMealPlanRows(params.reservationId, params.reservationDate, params.reservationEndDate);
        if (data.length === 0) {
            return;
        }
        await this.prisma.mealPlan.createMany({
            data,
            skipDuplicates: true,
        });
    }
    async findByReservation(reservationId, user) {
        await this.assertReservationAccess(reservationId, user);
        return this.prisma.mealPlan.findMany({
            where: { reservationId },
            select: mealPlanSelect,
            orderBy: [{ date: 'asc' }, { mealType: 'asc' }],
        });
    }
    async generateForReservation(reservationId, user) {
        const reservation = await this.assertReservationAccess(reservationId, user);
        this.assertMealPlanEligible(reservation.status);
        const days = this.stayDates(reservation.reservationDate, reservation.reservationEndDate);
        if (days.length === 0) {
            throw new common_1.BadRequestException('بازه اقامت رزرو برای ایجاد برنامه غذایی معتبر نیست');
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.mealPlan.deleteMany({ where: { reservationId } });
            await tx.mealPlan.createMany({
                data: this.buildDefaultMealPlanRows(reservationId, reservation.reservationDate, reservation.reservationEndDate),
            });
        });
        return this.findByReservation(reservationId, user);
    }
    async saveForReservation(reservationId, dto, user) {
        const reservation = await this.assertReservationAccess(reservationId, user);
        this.assertMealPlanEligible(reservation.status);
        const payloadIds = new Set(dto.entries.filter((entry) => entry.id != null).map((entry) => entry.id));
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
                const date = (0, date_util_1.parseDateOnly)(entry.date);
                if (entry.id) {
                    const current = await tx.mealPlan.findFirst({
                        where: { id: entry.id, reservationId },
                    });
                    if (!current) {
                        throw new common_1.BadRequestException('رکورد برنامه غذایی نامعتبر است');
                    }
                    await tx.mealPlan.update({
                        where: { id: entry.id },
                        data: {
                            date,
                            mealType: entry.mealType,
                            isRequired: entry.isRequired,
                        },
                    });
                }
                else {
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
                        },
                        update: {
                            isRequired: entry.isRequired,
                        },
                    });
                }
            }
        });
        return this.findByReservation(reservationId, user);
    }
    async addDay(reservationId, dto, user) {
        const reservation = await this.assertReservationAccess(reservationId, user);
        this.assertMealPlanEligible(reservation.status);
        const date = (0, date_util_1.parseDateOnly)(dto.date);
        await this.prisma.mealPlan.createMany({
            data: MEAL_TYPES.map((mealType) => ({
                reservationId,
                date,
                mealType,
                isRequired: true,
            })),
            skipDuplicates: true,
        });
        return this.findByReservation(reservationId, user);
    }
    async removeDay(reservationId, dateStr, user) {
        await this.assertReservationAccess(reservationId, user);
        const date = (0, date_util_1.parseDateOnly)(dateStr);
        await this.prisma.mealPlan.deleteMany({
            where: { reservationId, date },
        });
        return this.findByReservation(reservationId, user);
    }
    async upsertMealEntry(reservationId, dto, user) {
        const reservation = await this.assertReservationAccess(reservationId, user);
        this.assertMealPlanEligible(reservation.status);
        const date = (0, date_util_1.parseDateOnly)(dto.date);
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
            throw new common_1.BadRequestException('وعده تحویل‌داده‌شده را نمی‌توان لغو کرد');
        }
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
            },
            update: {
                isRequired: dto.isRequired,
            },
        });
        return this.findByReservation(reservationId, user);
    }
    async cancelMealPlansAfterCheckoutDate(reservationId, checkoutDate, tx) {
        const db = tx ?? this.prisma;
        const checkoutDay = (0, date_util_1.parseDateOnly)((0, date_util_1.formatDateOnly)(checkoutDate));
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
            notice: activeOnCheckoutDay > 0 ? exports.MEAL_PLAN_MANUAL_CANCEL_TODAY_MESSAGE : undefined,
        };
    }
    async markServed(mealPlanId, user) {
        const row = await this.prisma.mealPlan.findUnique({
            where: { id: mealPlanId },
            include: {
                reservation: {
                    select: { id: true, mawkibId: true, status: true },
                },
            },
        });
        if (!row) {
            throw new common_1.NotFoundException('وعده غذایی یافت نشد');
        }
        await this.assertReservationAccess(row.reservationId, user);
        this.assertMealPlanEligible(row.reservation.status);
        if (!row.isRequired) {
            throw new common_1.BadRequestException('این وعده برای زائر فعال نیست');
        }
        if (row.isServed) {
            throw new common_1.BadRequestException('این وعده قبلاً تحویل داده شده است');
        }
        return this.prisma.mealPlan.update({
            where: { id: mealPlanId },
            data: {
                isServed: true,
                servedAt: new Date(),
            },
            select: mealPlanSelect,
        });
    }
    async getPresentAttendeesReport(query, user) {
        const isAdmin = user.roles.includes(client_1.RoleName.Admin);
        const isOwner = user.roles.includes(client_1.RoleName.MawkibOwner);
        if (!isAdmin && !isOwner) {
            throw new common_1.ForbiddenException('شما مجوز دسترسی به این گزارش را ندارید');
        }
        if (!isAdmin && isOwner) {
            await this.mawkibsService.assertOwnerAccess(query.mawkibId, user.id);
        }
        const mawkib = await this.prisma.mawkib.findUnique({
            where: { id: query.mawkibId },
            select: { id: true, name: true },
        });
        if (!mawkib) {
            throw new common_1.NotFoundException('موکب یافت نشد');
        }
        const reportDate = (0, date_util_1.parseDateOnly)(query.date);
        const reservations = await this.prisma.reservation.findMany({
            where: {
                mawkibId: query.mawkibId,
                status: {
                    in: [client_1.ReservationStatus.Confirmed, client_1.ReservationStatus.Completed],
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
                        isServed: true,
                    },
                },
            },
            orderBy: [{ pilgrim: { fullName: 'asc' } }],
        });
        const rows = reservations.map((reservation) => {
            const presence = (0, reservation_event_util_1.resolvePresenceStateAsOf)(reservation.events, {
                actualCheckInAt: reservation.actualCheckInAt,
                actualCheckOutAt: reservation.actualCheckOutAt,
            }, reportDate);
            const isPresent = presence === client_1.ReservationPresenceState.PRESENT;
            const mealPlan = reservation.mealPlans[0];
            const isServed = mealPlan?.isServed ?? false;
            return {
                reservationId: reservation.id,
                mealPlanId: mealPlan?.id ?? null,
                trackingCode: reservation.trackingCode,
                fullName: reservation.pilgrim.fullName,
                mobile: reservation.pilgrimMobile || reservation.pilgrim.mobileNumber || '',
                nationalId: reservation.pilgrim.nationalId,
                maleGuestCount: reservation.maleGuestCount,
                femaleGuestCount: reservation.femaleGuestCount,
                isPresent,
                presence: isPresent ? 'دارد' : 'ندارد',
                isServed,
            };
        });
        const present = rows.filter((row) => row.isPresent).length;
        return {
            mawkibId: mawkib.id,
            mawkibName: mawkib.name,
            date: (0, date_util_1.formatDateOnly)(reportDate),
            mealType: query.mealType,
            stats: {
                total: rows.length,
                present,
                absent: rows.length - present,
            },
            rows,
        };
    }
};
exports.MealPlansService = MealPlansService;
exports.MealPlansService = MealPlansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mawkibs_service_1.MawkibsService])
], MealPlansService);
//# sourceMappingURL=meal-plans.service.js.map