import { type Prisma } from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { MawkibsService } from '../mawkibs/mawkibs.service';
import { PrismaService } from '../prisma/prisma.service';
import type { AddMealPlanDayDto, SaveMealPlansDto, UpsertMealPlanEntryDto } from './dto/meal-plan.dto';
import type { PresentAttendeesReportQueryDto } from './dto/present-attendees-report.dto';
export declare const MEAL_PLAN_MANUAL_CANCEL_TODAY_MESSAGE = "\u062F\u0631 \u0635\u0648\u0631\u062A \u062F\u0627\u0634\u062A\u0646 \u0631\u0632\u0631\u0648 \u063A\u0630\u0627 \u0628\u0631\u0627\u06CC \u0631\u0648\u0632 \u062C\u0627\u0631\u06CC\u060C \u0644\u0637\u0641\u0627\u064B \u0628\u0647\u200C\u0635\u0648\u0631\u062A \u062F\u0633\u062A\u06CC \u0622\u0646\u200C\u0647\u0627 \u0631\u0627 \u0644\u063A\u0648 \u0646\u0645\u0627\u06CC\u06CC\u062F.";
export declare class MealPlansService {
    private prisma;
    private mawkibsService;
    constructor(prisma: PrismaService, mawkibsService: MawkibsService);
    private assertReservationAccess;
    private assertMealPlanEligible;
    private stayDates;
    private buildDefaultMealPlanRows;
    autoGenerateForNewReservation(params: {
        reservationId: number;
        mawkibId: number;
        reservationDate: Date;
        reservationEndDate: Date;
    }): Promise<void>;
    findByReservation(reservationId: number, user: AuthUser): Promise<{
        id: number;
        reservationId: number;
        date: Date;
        mealType: import("@prisma/client").$Enums.MealType;
        isRequired: boolean;
        isServed: boolean;
        servedAt: Date | null;
    }[]>;
    generateForReservation(reservationId: number, user: AuthUser): Promise<{
        id: number;
        reservationId: number;
        date: Date;
        mealType: import("@prisma/client").$Enums.MealType;
        isRequired: boolean;
        isServed: boolean;
        servedAt: Date | null;
    }[]>;
    saveForReservation(reservationId: number, dto: SaveMealPlansDto, user: AuthUser): Promise<{
        id: number;
        reservationId: number;
        date: Date;
        mealType: import("@prisma/client").$Enums.MealType;
        isRequired: boolean;
        isServed: boolean;
        servedAt: Date | null;
    }[]>;
    addDay(reservationId: number, dto: AddMealPlanDayDto, user: AuthUser): Promise<{
        id: number;
        reservationId: number;
        date: Date;
        mealType: import("@prisma/client").$Enums.MealType;
        isRequired: boolean;
        isServed: boolean;
        servedAt: Date | null;
    }[]>;
    removeDay(reservationId: number, dateStr: string, user: AuthUser): Promise<{
        id: number;
        reservationId: number;
        date: Date;
        mealType: import("@prisma/client").$Enums.MealType;
        isRequired: boolean;
        isServed: boolean;
        servedAt: Date | null;
    }[]>;
    upsertMealEntry(reservationId: number, dto: UpsertMealPlanEntryDto, user: AuthUser): Promise<{
        id: number;
        reservationId: number;
        date: Date;
        mealType: import("@prisma/client").$Enums.MealType;
        isRequired: boolean;
        isServed: boolean;
        servedAt: Date | null;
    }[]>;
    cancelMealPlansAfterCheckoutDate(reservationId: number, checkoutDate: Date, tx?: Prisma.TransactionClient): Promise<{
        cancelledCount: number;
        hasActiveMealsOnCheckoutDay: boolean;
        notice: string | undefined;
    }>;
    markServed(mealPlanId: number, user: AuthUser): Promise<{
        id: number;
        reservationId: number;
        date: Date;
        mealType: import("@prisma/client").$Enums.MealType;
        isRequired: boolean;
        isServed: boolean;
        servedAt: Date | null;
    }>;
    getPresentAttendeesReport(query: PresentAttendeesReportQueryDto, user: AuthUser): Promise<{
        mawkibId: number;
        mawkibName: string;
        date: string;
        mealType: import("@prisma/client").$Enums.MealType;
        stats: {
            total: number;
            present: number;
            absent: number;
        };
        rows: {
            reservationId: number;
            mealPlanId: number;
            trackingCode: string;
            fullName: string;
            mobile: string;
            nationalId: string | null;
            gender: import("@prisma/client").$Enums.UserGender | null;
            maleGuestCount: number;
            femaleGuestCount: number;
            isPresent: boolean;
            presence: string;
            isServed: boolean;
        }[];
    }>;
}
