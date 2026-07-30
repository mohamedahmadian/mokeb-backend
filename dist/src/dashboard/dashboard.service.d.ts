import { PrismaService } from '../prisma/prisma.service';
import { MawkibsService } from '../mawkibs/mawkibs.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { ServantMawkibAccessService } from '../users/servant-mawkib-access.service';
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
    private servantMawkibAccess;
    constructor(prisma: PrismaService, mawkibsService: MawkibsService, servantMawkibAccess: ServantMawkibAccessService);
    private computeCapacityStats;
    private computeCapacityStatsForMawkibIds;
    getStats(user: AuthUser): Promise<{
        myMawkibsStats: CapacityStats;
        mawkibServantStats: {
            totalReservations: number;
            confirmedReservations: number;
            cancelledReservations: number;
        };
        capacityStats?: undefined;
        pilgrimStats?: undefined;
        mawkibOwnerStats?: undefined;
        totalPilgrims?: undefined;
        totalMawkibOwners?: undefined;
        pendingRequests?: undefined;
        pendingReservations?: undefined;
        totalReservations?: undefined;
    } | {
        capacityStats: CapacityStats;
        pilgrimStats: {
            totalReservations: number;
            pendingReservations: number;
            confirmedReservations: number;
            cancelledReservations: number;
        };
        myMawkibsStats?: undefined;
        mawkibServantStats?: undefined;
        mawkibOwnerStats?: undefined;
        totalPilgrims?: undefined;
        totalMawkibOwners?: undefined;
        pendingRequests?: undefined;
        pendingReservations?: undefined;
        totalReservations?: undefined;
    } | {
        myMawkibsStats: CapacityStats;
        mawkibOwnerStats: {
            totalReservations: number;
            pendingReservations: number;
            confirmedReservations: number;
            cancelledReservations: number;
            completedReservations: number;
        };
        mawkibServantStats?: undefined;
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
        myMawkibsStats?: undefined;
        mawkibServantStats?: undefined;
        pilgrimStats?: undefined;
        mawkibOwnerStats?: undefined;
    }>;
}
