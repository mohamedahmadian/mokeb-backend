import { MealType } from '@prisma/client';
export declare class MealPlanEntryDto {
    id?: number;
    date: string;
    mealType: MealType;
    isRequired: boolean;
}
export declare class SaveMealPlansDto {
    entries: MealPlanEntryDto[];
}
export declare class AddMealPlanDayDto {
    date: string;
}
export declare class UpsertMealPlanEntryDto {
    date: string;
    mealType: MealType;
    isRequired: boolean;
}
