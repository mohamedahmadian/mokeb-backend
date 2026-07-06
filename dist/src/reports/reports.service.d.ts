import { AuthUser } from '../common/decorators/current-user.decorator';
import { MawkibInventoryService } from '../mawkibs/mawkib-inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import type { ReservationsReportResponse } from './reservations-report.types';
export interface ReportCountItem {
    label: string;
    count: number;
}
export interface PilgrimReportResponse {
    scope: 'all' | 'mine';
    summary: {
        total: number;
        maleCount: number;
        femaleCount: number;
        unknownGenderCount: number;
        activeCount: number;
        inactiveCount: number;
        withNationalIdCount: number;
        withProfileImageCount: number;
        withNationalIdCardCount: number;
        todayRegistrationCount: number;
        weekRegistrationCount: number;
        monthRegistrationCount: number;
    };
    genderBreakdown: ReportCountItem[];
    statusBreakdown: ReportCountItem[];
    profileCompletion: ReportCountItem[];
    byProvince: ReportCountItem[];
    byCity: ReportCountItem[];
    monthlyRegistrations: ReportCountItem[];
    weeklyRegistrations: ReportCountItem[];
}
export interface MawkibOwnersReportResponse {
    summary: {
        total: number;
        activeCount: number;
        inactiveCount: number;
        maleCount: number;
        femaleCount: number;
        unknownGenderCount: number;
        withMawkibCount: number;
    };
    genderBreakdown: ReportCountItem[];
    byProvince: ReportCountItem[];
    byCity: ReportCountItem[];
}
export interface MawkibTodayGuestItem {
    mawkibId: number;
    mawkibName: string;
    maleGuests: number;
    femaleGuests: number;
    totalGuests: number;
    maleCapacity: number;
    femaleCapacity: number;
    presentMaleGuests: number;
    presentFemaleGuests: number;
    presentTotalGuests: number;
}
export interface MawkibsReportResponse {
    scope: 'all' | 'mine';
    summary: {
        total: number;
        approvedCount: number;
        pendingCount: number;
        rejectedCount: number;
        totalMaleCapacity: number;
        totalFemaleCapacity: number;
        onlineReservationEnabledCount: number;
        todayMaleGuests: number;
        todayFemaleGuests: number;
        todayTotalGuests: number;
        presentMaleGuests: number;
        presentFemaleGuests: number;
        presentTotalGuests: number;
        pendingRegistrationRequestCount: number;
        rejectedRegistrationRequestCount: number;
    };
    statusBreakdown: ReportCountItem[];
    approvalScopeTotal: number;
    byProvince: ReportCountItem[];
    byCity: ReportCountItem[];
    todayDate: string;
    todayGuestByMawkib: MawkibTodayGuestItem[];
}
export declare class ReportsService {
    private prisma;
    private inventoryService;
    constructor(prisma: PrismaService, inventoryService: MawkibInventoryService);
    private resolveOwnerScope;
    private pilgrimWhere;
    private mapUserGroupBy;
    private buildMonthlyRegistrations;
    private startOfLocalDay;
    private startOfLocalMonth;
    private buildWeeklyRegistrationCounts;
    getPilgrimReport(user: AuthUser): Promise<PilgrimReportResponse>;
    getMawkibOwnersReport(user: AuthUser): Promise<MawkibOwnersReportResponse>;
    getMawkibsReport(user: AuthUser): Promise<MawkibsReportResponse>;
    getReservationsReport(user: AuthUser): Promise<ReservationsReportResponse>;
}
