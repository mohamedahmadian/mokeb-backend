import { PrismaService } from '../prisma/prisma.service';
import { MawkibsService } from '../mawkibs/mawkibs.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
export interface CapacityStats {
    totalMawkibs: number;
    totalMaleCapacity: number;
    totalFemaleCapacity: number;
    totalCapacity: number;
    emptyMaleCapacity: number;
    emptyFemaleCapacity: number;
    emptyCapacity: number;
    filledCapacity: number;
}
export declare class DashboardService {
    private prisma;
    private mawkibsService;
    constructor(prisma: PrismaService, mawkibsService: MawkibsService);
    private computeCapacityStats;
    getStats(user: AuthUser): Promise<{
        capacityStats: CapacityStats;
        pilgrimStats: {
            totalReservations: number;
            pendingReservations: number;
            confirmedReservations: number;
            cancelledReservations: number;
        };
        myMawkibsStats?: undefined;
        totalPilgrims?: undefined;
        totalMawkibOwners?: undefined;
        pendingRequests?: undefined;
        pendingReservations?: undefined;
        totalReservations?: undefined;
    } | {
        myMawkibsStats: CapacityStats;
        capacityStats?: undefined;
        pilgrimStats?: undefined;
        totalPilgrims?: undefined;
        totalMawkibOwners?: undefined;
        pendingRequests?: undefined;
        pendingReservations?: undefined;
        totalReservations?: undefined;
    } | {
        capacityStats: CapacityStats;
        totalPilgrims: number;
        totalMawkibOwners: number;
        pendingRequests: number;
        pendingReservations: number;
        totalReservations: number;
        pilgrimStats?: undefined;
        myMawkibsStats?: undefined;
    }>;
}
