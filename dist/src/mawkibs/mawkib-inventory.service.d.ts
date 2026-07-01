import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { MawkibCapacitySnapshot } from '../common/types/capacity.types';
export type MawkibCapacitySource = {
    id: number;
    maleCapacity: number;
    femaleCapacity: number;
};
export interface MawkibInventoryHorizonMeta {
    horizonDays: number;
    minDate: string;
    maxDate: string;
}
export interface MawkibDailyInventoryItem {
    date: string;
    maleCapacity: number;
    femaleCapacity: number;
    reservedMale: number;
    reservedFemale: number;
    availableMale: number;
    availableFemale: number;
}
export interface MawkibInventoryRangeResult {
    mawkibId: number;
    mawkibName: string;
    startDate: string;
    endDate: string;
    horizon: MawkibInventoryHorizonMeta;
    days: MawkibDailyInventoryItem[];
}
type ReservationInventoryShape = {
    mawkibId: number;
    reservationDate: Date;
    reservationEndDate: Date;
    actualCheckOutAt: Date | null;
    maleGuestCount: number;
    femaleGuestCount: number;
};
export declare class MawkibInventoryService implements OnModuleInit {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private occupancyRevisionMarkerPath;
    private readStoredOccupancyRevision;
    private writeStoredOccupancyRevision;
    private reconcileOccupancyLogicRevision;
    private reconcileStaleInventoriesOnStartup;
    private isInventoryStale;
    getHorizonMeta(fromDate?: Date | string): MawkibInventoryHorizonMeta;
    assertDateRangeWithinHorizon(startDate: Date | string, endDate: Date | string): void;
    assertDateRangeForMawkib(startDate: Date | string, endDate: Date | string, serviceStartDate: Date | null, serviceEndDate: Date | null): void;
    ensureInitialized(mawkibId: number): Promise<void>;
    ensureDayRows(mawkibId: number, startDate: Date, endDate: Date): Promise<void>;
    seedHorizonForMawkib(mawkibId: number): Promise<void>;
    private applyDeltaToDays;
    applyReservationOccupancy(reservation: ReservationInventoryShape, delta: 1 | -1): Promise<void>;
    applyEarlyCheckoutRelease(reservation: Pick<ReservationInventoryShape, 'mawkibId' | 'reservationEndDate' | 'actualCheckOutAt' | 'maleGuestCount' | 'femaleGuestCount'>): Promise<void>;
    rebuildMawkibInventory(mawkibId: number): Promise<void>;
    getInventoryRange(mawkibId: number, startDate: Date | string, endDate: Date | string): Promise<MawkibInventoryRangeResult>;
    getSnapshotsForMawkibsOnDate(mawkibs: MawkibCapacitySource[], day?: Date | string): Promise<Map<number, MawkibCapacitySnapshot>>;
    getCapacitySnapshotFromInventory(mawkibId: number, day: Date | string, maleCapacity: number, femaleCapacity: number): Promise<MawkibCapacitySnapshot>;
    getMinCapacityInRangeFromInventory(mawkibId: number, startDate: Date | string, endDate: Date | string, maleCapacity: number, femaleCapacity: number): Promise<{
        maleCapacity: number;
        femaleCapacity: number;
        availableMale: number;
        availableFemale: number;
    }>;
}
export {};
