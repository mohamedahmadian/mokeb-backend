import { Injectable } from '@nestjs/common';
import { MawkibStatus, ReservationStatus, RoleName } from '@prisma/client';
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

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private mawkibsService: MawkibsService,
  ) {}

  private async computeCapacityStats(ownerUserId?: number): Promise<CapacityStats> {
    const mawkibs = await this.prisma.mawkib.findMany({
      where: {
        status: MawkibStatus.Approved,
        ...(ownerUserId ? { ownerUserId } : {}),
      },
      select: { id: true, maleCapacity: true, femaleCapacity: true },
    });

    let totalMaleCapacity = 0;
    let totalFemaleCapacity = 0;
    let emptyMaleCapacity = 0;
    let emptyFemaleCapacity = 0;

    const snapshots = await this.mawkibsService.getCapacitySnapshotsForMawkibs(mawkibs);

    for (const mawkib of mawkibs) {
      totalMaleCapacity += mawkib.maleCapacity;
      totalFemaleCapacity += mawkib.femaleCapacity;
      const snapshot = snapshots.get(mawkib.id)!;
      emptyMaleCapacity += snapshot.availableMale;
      emptyFemaleCapacity += snapshot.availableFemale;
    }

    const totalCap = totalMaleCapacity + totalFemaleCapacity;
    const emptyCap = emptyMaleCapacity + emptyFemaleCapacity;

    return {
      totalMawkibs: mawkibs.length,
      totalMaleCapacity,
      totalFemaleCapacity,
      totalCapacity: totalCap,
      emptyMaleCapacity,
      emptyFemaleCapacity,
      emptyCapacity: emptyCap,
      filledCapacity: totalCap - emptyCap,
    };
  }

  async getStats(user: AuthUser) {
    const isAdmin = user.roles.includes(RoleName.Admin);
    const isMawkibOwner =
      user.roles.includes(RoleName.MawkibOwner) && !isAdmin;
    const isPilgrim =
      user.roles.includes(RoleName.Pilgrim) &&
      !isAdmin &&
      !user.roles.includes(RoleName.MawkibOwner);

    if (isPilgrim) {
      const [capacityStats, total, pending, confirmed, cancelled] = await Promise.all([
        this.computeCapacityStats(),
        this.prisma.reservation.count({
          where: { pilgrimUserId: user.id },
        }),
        this.prisma.reservation.count({
          where: { pilgrimUserId: user.id, status: ReservationStatus.Pending },
        }),
        this.prisma.reservation.count({
          where: { pilgrimUserId: user.id, status: ReservationStatus.Confirmed },
        }),
        this.prisma.reservation.count({
          where: { pilgrimUserId: user.id, status: ReservationStatus.Cancelled },
        }),
      ]);

      return {
        capacityStats,
        pilgrimStats: {
          totalReservations: total,
          pendingReservations: pending,
          confirmedReservations: confirmed,
          cancelledReservations: cancelled,
        },
      };
    }

    if (isMawkibOwner) {
      const ownedMawkibs = await this.prisma.mawkib.findMany({
        where: { ownerUserId: user.id },
        select: { id: true },
      });
      const mawkibIds = ownedMawkibs.map((m) => m.id);
      const reservationWhere =
        mawkibIds.length > 0 ? { mawkibId: { in: mawkibIds } } : { mawkibId: -1 };

      const [
        myMawkibsStats,
        totalReservations,
        pendingReservations,
        confirmedReservations,
        cancelledReservations,
        completedReservations,
      ] = await Promise.all([
        this.computeCapacityStats(user.id),
        this.prisma.reservation.count({ where: reservationWhere }),
        this.prisma.reservation.count({
          where: { ...reservationWhere, status: ReservationStatus.Pending },
        }),
        this.prisma.reservation.count({
          where: { ...reservationWhere, status: ReservationStatus.Confirmed },
        }),
        this.prisma.reservation.count({
          where: { ...reservationWhere, status: ReservationStatus.Cancelled },
        }),
        this.prisma.reservation.count({
          where: { ...reservationWhere, status: ReservationStatus.Completed },
        }),
      ]);

      return {
        myMawkibsStats,
        mawkibOwnerStats: {
          totalReservations,
          pendingReservations,
          confirmedReservations,
          cancelledReservations,
          completedReservations,
        },
      };
    }

    const capacityStats = await this.computeCapacityStats();

    const [totalPilgrims, totalMawkibOwners, pendingRequests, pendingReservations] =
      await Promise.all([
        this.prisma.userRole.count({
          where: { role: { name: RoleName.Pilgrim } },
        }),
        this.prisma.userRole.count({
          where: { role: { name: RoleName.MawkibOwner } },
        }),
        this.prisma.mawkibRegistrationRequest.count({
          where: { status: 'Pending' },
        }),
        this.prisma.reservation.count({
          where: { status: ReservationStatus.Pending },
        }),
      ]);

    return {
      capacityStats,
      totalPilgrims,
      totalMawkibOwners,
      pendingRequests,
      pendingReservations,
      totalReservations: await this.prisma.reservation.count(),
    };
  }
}
