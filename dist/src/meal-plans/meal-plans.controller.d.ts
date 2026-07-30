import type { AuthUser } from '../common/decorators/current-user.decorator';
import { AddMealPlanDayDto, MarkMealServedDto, SaveMealPlansDto, UpsertMealPlanEntryDto } from './dto/meal-plan.dto';
import { PresentAttendeesReportQueryDto } from './dto/present-attendees-report.dto';
import { MealPlansService } from './meal-plans.service';
export declare class MealPlansController {
    private service;
    constructor(service: MealPlansService);
    presentAttendeesReport(query: PresentAttendeesReportQueryDto, user: AuthUser): Promise<{
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
            guestCount: number;
            isPresent: boolean;
            presence: string;
            isServed: boolean;
        }[];
    }>;
    findByReservation(reservationId: number, user: AuthUser): Promise<{
        id: number;
        reservationId: number;
        date: Date;
        mealType: import("@prisma/client").$Enums.MealType;
        isRequired: boolean;
        guestCount: number;
        isServed: boolean;
        servedAt: Date | null;
    }[]>;
    generate(reservationId: number, user: AuthUser): Promise<{
        id: number;
        reservationId: number;
        date: Date;
        mealType: import("@prisma/client").$Enums.MealType;
        isRequired: boolean;
        guestCount: number;
        isServed: boolean;
        servedAt: Date | null;
    }[]>;
    save(reservationId: number, dto: SaveMealPlansDto, user: AuthUser): Promise<{
        id: number;
        reservationId: number;
        date: Date;
        mealType: import("@prisma/client").$Enums.MealType;
        isRequired: boolean;
        guestCount: number;
        isServed: boolean;
        servedAt: Date | null;
    }[]>;
    upsertEntry(reservationId: number, dto: UpsertMealPlanEntryDto, user: AuthUser): Promise<{
        id: number;
        reservationId: number;
        date: Date;
        mealType: import("@prisma/client").$Enums.MealType;
        isRequired: boolean;
        guestCount: number;
        isServed: boolean;
        servedAt: Date | null;
    }[]>;
    addDay(reservationId: number, dto: AddMealPlanDayDto, user: AuthUser): Promise<{
        id: number;
        reservationId: number;
        date: Date;
        mealType: import("@prisma/client").$Enums.MealType;
        isRequired: boolean;
        guestCount: number;
        isServed: boolean;
        servedAt: Date | null;
    }[]>;
    removeDay(reservationId: number, date: string, user: AuthUser): Promise<{
        id: number;
        reservationId: number;
        date: Date;
        mealType: import("@prisma/client").$Enums.MealType;
        isRequired: boolean;
        guestCount: number;
        isServed: boolean;
        servedAt: Date | null;
    }[]>;
    markServed(id: number, dto: MarkMealServedDto, user: AuthUser): Promise<{
        id: number;
        reservationId: number;
        date: Date;
        mealType: import("@prisma/client").$Enums.MealType;
        isRequired: boolean;
        guestCount: number;
        isServed: boolean;
        servedAt: Date | null;
    }>;
}
