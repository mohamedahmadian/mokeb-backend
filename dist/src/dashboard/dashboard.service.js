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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const mawkibs_service_1 = require("../mawkibs/mawkibs.service");
let DashboardService = class DashboardService {
    prisma;
    mawkibsService;
    constructor(prisma, mawkibsService) {
        this.prisma = prisma;
        this.mawkibsService = mawkibsService;
    }
    async computeCapacityStats(ownerUserId) {
        const mawkibs = await this.prisma.mawkib.findMany({
            where: {
                status: client_1.MawkibStatus.Approved,
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
            const snapshot = snapshots.get(mawkib.id);
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
    async getStats(user) {
        const isAdmin = user.roles.includes(client_1.RoleName.Admin);
        const isMawkibOwner = user.roles.includes(client_1.RoleName.MawkibOwner) && !isAdmin;
        const isPilgrim = user.roles.includes(client_1.RoleName.Pilgrim) &&
            !isAdmin &&
            !user.roles.includes(client_1.RoleName.MawkibOwner);
        if (isPilgrim) {
            const [capacityStats, total, pending, confirmed, cancelled] = await Promise.all([
                this.computeCapacityStats(),
                this.prisma.reservation.count({
                    where: { pilgrimUserId: user.id },
                }),
                this.prisma.reservation.count({
                    where: { pilgrimUserId: user.id, status: client_1.ReservationStatus.Pending },
                }),
                this.prisma.reservation.count({
                    where: { pilgrimUserId: user.id, status: client_1.ReservationStatus.Confirmed },
                }),
                this.prisma.reservation.count({
                    where: { pilgrimUserId: user.id, status: client_1.ReservationStatus.Cancelled },
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
            const reservationWhere = mawkibIds.length > 0 ? { mawkibId: { in: mawkibIds } } : { mawkibId: -1 };
            const [myMawkibsStats, totalReservations, pendingReservations, confirmedReservations, cancelledReservations, completedReservations,] = await Promise.all([
                this.computeCapacityStats(user.id),
                this.prisma.reservation.count({ where: reservationWhere }),
                this.prisma.reservation.count({
                    where: { ...reservationWhere, status: client_1.ReservationStatus.Pending },
                }),
                this.prisma.reservation.count({
                    where: { ...reservationWhere, status: client_1.ReservationStatus.Confirmed },
                }),
                this.prisma.reservation.count({
                    where: { ...reservationWhere, status: client_1.ReservationStatus.Cancelled },
                }),
                this.prisma.reservation.count({
                    where: { ...reservationWhere, status: client_1.ReservationStatus.Completed },
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
        const [totalPilgrims, totalMawkibOwners, pendingRequests, pendingReservations] = await Promise.all([
            this.prisma.userRole.count({
                where: { role: { name: client_1.RoleName.Pilgrim } },
            }),
            this.prisma.userRole.count({
                where: { role: { name: client_1.RoleName.MawkibOwner } },
            }),
            this.prisma.mawkibRegistrationRequest.count({
                where: { status: 'Pending' },
            }),
            this.prisma.reservation.count({
                where: { status: client_1.ReservationStatus.Pending },
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mawkibs_service_1.MawkibsService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map