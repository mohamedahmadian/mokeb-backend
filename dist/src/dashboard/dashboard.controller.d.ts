import { DashboardService } from './dashboard.service';
import type { AuthUser } from '../common/decorators/current-user.decorator';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(user: AuthUser): Promise<{
        capacityStats: import("./dashboard.service").CapacityStats;
        pilgrimStats: {
            totalReservations: number;
            pendingReservations: number;
            confirmedReservations: number;
            cancelledReservations: number;
        };
        myMawkibsStats?: undefined;
        mawkibOwnerStats?: undefined;
        totalPilgrims?: undefined;
        totalMawkibOwners?: undefined;
        pendingRequests?: undefined;
        pendingReservations?: undefined;
        totalReservations?: undefined;
    } | {
        myMawkibsStats: import("./dashboard.service").CapacityStats;
        mawkibOwnerStats: {
            totalReservations: number;
            pendingReservations: number;
            confirmedReservations: number;
            cancelledReservations: number;
            completedReservations: number;
        };
        capacityStats?: undefined;
        pilgrimStats?: undefined;
        totalPilgrims?: undefined;
        totalMawkibOwners?: undefined;
        pendingRequests?: undefined;
        pendingReservations?: undefined;
        totalReservations?: undefined;
    } | {
        capacityStats: import("./dashboard.service").CapacityStats;
        totalPilgrims: number;
        totalMawkibOwners: number;
        pendingRequests: number;
        pendingReservations: number;
        totalReservations: number;
        pilgrimStats?: undefined;
        myMawkibsStats?: undefined;
        mawkibOwnerStats?: undefined;
    }>;
}
