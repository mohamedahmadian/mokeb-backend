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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const date_util_1 = require("../common/utils/date.util");
const mawkib_inventory_service_1 = require("../mawkibs/mawkib-inventory.service");
const prisma_service_1 = require("../prisma/prisma.service");
const reservations_report_builder_1 = require("./reservations-report.builder");
let ReportsService = class ReportsService {
    prisma;
    inventoryService;
    constructor(prisma, inventoryService) {
        this.prisma = prisma;
        this.inventoryService = inventoryService;
    }
    resolveOwnerScope(user) {
        const isAdmin = user.roles.includes(client_1.RoleName.Admin);
        if (isAdmin)
            return undefined;
        if (user.roles.includes(client_1.RoleName.MawkibOwner))
            return user.id;
        return undefined;
    }
    pilgrimWhere(ownerUserId) {
        return {
            roles: { some: { role: { name: client_1.RoleName.Pilgrim } } },
            ...(ownerUserId
                ? {
                    pilgrimReservations: {
                        some: { mawkib: { ownerUserId } },
                    },
                }
                : {}),
        };
    }
    mapUserGroupBy(rows, field, emptyLabel = 'نامشخص') {
        return rows
            .filter((row) => row._count.id > 0)
            .map((row) => ({
            label: (field === 'province' ? row.province : row.city)?.trim() || emptyLabel,
            count: row._count.id,
        }));
    }
    buildMonthlyRegistrations(dates) {
        const buckets = new Map();
        const now = new Date();
        for (let i = 5; i >= 0; i -= 1) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            buckets.set(key, 0);
        }
        for (const { createdAt } of dates) {
            const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
            if (buckets.has(key)) {
                buckets.set(key, (buckets.get(key) ?? 0) + 1);
            }
        }
        return Array.from(buckets.entries()).map(([key, count]) => {
            const [year, month] = key.split('-');
            const date = new Date(Number(year), Number(month) - 1, 1);
            const label = date.toLocaleDateString('fa-IR', {
                year: 'numeric',
                month: 'short',
            });
            return { label, count };
        });
    }
    startOfLocalDay(date = new Date()) {
        return (0, date_util_1.startOfAppDay)(date);
    }
    startOfLocalMonth(date = new Date()) {
        const d = this.startOfLocalDay(date);
        return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
    }
    async buildWeeklyRegistrationCounts(where, rangeStart, rangeEnd) {
        const days = (0, date_util_1.eachDateInRange)(rangeStart, rangeEnd);
        const counts = await Promise.all(days.map((day) => {
            const nextDay = (0, date_util_1.addDays)(day, 1);
            return this.prisma.user.count({
                where: {
                    ...where,
                    createdAt: { gte: day, lt: nextDay },
                },
            });
        }));
        return days.map((day, index) => {
            const weekday = day.toLocaleDateString('fa-IR', { weekday: 'short' });
            const datePart = day.toLocaleDateString('fa-IR', {
                month: 'short',
                day: 'numeric',
            });
            return {
                label: `${weekday}\n${datePart}`,
                count: counts[index],
            };
        });
    }
    async getPilgrimReport(user) {
        const ownerUserId = this.resolveOwnerScope(user);
        const where = this.pilgrimWhere(ownerUserId);
        const today = this.startOfLocalDay();
        const weekStart = (0, date_util_1.addDays)(today, -6);
        const monthStart = this.startOfLocalMonth();
        const [total, maleCount, femaleCount, unknownGenderCount, activeCount, inactiveCount, withNationalIdCount, withProfileImageCount, withNationalIdCardCount, todayRegistrationCount, weekRegistrationCount, monthRegistrationCount, provinceGroups, cityGroups, registrationDates,] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.count({ where: { ...where, gender: client_1.UserGender.Male } }),
            this.prisma.user.count({ where: { ...where, gender: client_1.UserGender.Female } }),
            this.prisma.user.count({ where: { ...where, gender: null } }),
            this.prisma.user.count({ where: { ...where, isActive: true } }),
            this.prisma.user.count({ where: { ...where, isActive: false } }),
            this.prisma.user.count({
                where: { ...where, nationalId: { not: null } },
            }),
            this.prisma.user.count({
                where: { ...where, imageUrl: { not: null } },
            }),
            this.prisma.user.count({
                where: { ...where, nationalIdCardImageUrl: { not: null } },
            }),
            this.prisma.user.count({
                where: { ...where, createdAt: { gte: today } },
            }),
            this.prisma.user.count({
                where: { ...where, createdAt: { gte: weekStart } },
            }),
            this.prisma.user.count({
                where: { ...where, createdAt: { gte: monthStart } },
            }),
            this.prisma.user.groupBy({
                by: ['province'],
                where: { ...where, province: { not: null } },
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 10,
            }),
            this.prisma.user.groupBy({
                by: ['city'],
                where: { ...where, city: { not: null } },
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 10,
            }),
            this.prisma.user.findMany({
                where,
                select: { createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 5000,
            }),
        ]);
        const weeklyRegistrations = await this.buildWeeklyRegistrationCounts(where, weekStart, today);
        return {
            scope: ownerUserId ? 'mine' : 'all',
            summary: {
                total,
                maleCount,
                femaleCount,
                unknownGenderCount,
                activeCount,
                inactiveCount,
                withNationalIdCount,
                withProfileImageCount,
                withNationalIdCardCount,
                todayRegistrationCount,
                weekRegistrationCount,
                monthRegistrationCount,
            },
            genderBreakdown: [
                { label: 'آقایان', count: maleCount },
                { label: 'بانوان', count: femaleCount },
                { label: 'بدون جنسیت', count: unknownGenderCount },
            ],
            statusBreakdown: [
                { label: 'فعال', count: activeCount },
                { label: 'غیرفعال', count: inactiveCount },
            ],
            profileCompletion: [
                { label: 'کد ملی ثبت‌شده', count: withNationalIdCount },
                { label: 'عکس پروفایل', count: withProfileImageCount },
                { label: 'عکس کارت ملی', count: withNationalIdCardCount },
            ],
            byProvince: this.mapUserGroupBy(provinceGroups, 'province'),
            byCity: this.mapUserGroupBy(cityGroups, 'city'),
            monthlyRegistrations: this.buildMonthlyRegistrations(registrationDates),
            weeklyRegistrations,
        };
    }
    async getMawkibOwnersReport(user) {
        if (!user.roles.includes(client_1.RoleName.Admin)) {
            return {
                summary: {
                    total: 0,
                    activeCount: 0,
                    inactiveCount: 0,
                    maleCount: 0,
                    femaleCount: 0,
                    unknownGenderCount: 0,
                    withMawkibCount: 0,
                },
                genderBreakdown: [],
                byProvince: [],
                byCity: [],
            };
        }
        const where = {
            roles: { some: { role: { name: client_1.RoleName.MawkibOwner } } },
        };
        const [total, activeCount, inactiveCount, maleCount, femaleCount, unknownGenderCount, withMawkibCount, provinceGroups, cityGroups,] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.count({ where: { ...where, isActive: true } }),
            this.prisma.user.count({ where: { ...where, isActive: false } }),
            this.prisma.user.count({ where: { ...where, gender: client_1.UserGender.Male } }),
            this.prisma.user.count({ where: { ...where, gender: client_1.UserGender.Female } }),
            this.prisma.user.count({ where: { ...where, gender: null } }),
            this.prisma.user.count({
                where: { ...where, ownedMawkibs: { some: {} } },
            }),
            this.prisma.user.groupBy({
                by: ['province'],
                where: { ...where, province: { not: null } },
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 10,
            }),
            this.prisma.user.groupBy({
                by: ['city'],
                where: { ...where, city: { not: null } },
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 10,
            }),
        ]);
        return {
            summary: {
                total,
                activeCount,
                inactiveCount,
                maleCount,
                femaleCount,
                unknownGenderCount,
                withMawkibCount,
            },
            genderBreakdown: [
                { label: 'آقایان', count: maleCount },
                { label: 'بانوان', count: femaleCount },
                { label: 'بدون جنسیت', count: unknownGenderCount },
            ],
            byProvince: this.mapUserGroupBy(provinceGroups, 'province'),
            byCity: this.mapUserGroupBy(cityGroups, 'city'),
        };
    }
    async getMawkibsReport(user) {
        const ownerUserId = this.resolveOwnerScope(user);
        const where = ownerUserId
            ? { ownerUserId }
            : {};
        const registrationRequestWhere = ownerUserId ? { ownerUserId } : {};
        const [mawkibs, statusGroups, pendingRegistrationRequests, rejectedRegistrationRequests] = await Promise.all([
            this.prisma.mawkib.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    status: true,
                    country: true,
                    mawkibCity: true,
                    maleCapacity: true,
                    femaleCapacity: true,
                    onlineReservationEnabled: true,
                },
            }),
            this.prisma.mawkib.groupBy({
                by: ['status'],
                where,
                _count: { _all: true },
            }),
            this.prisma.mawkibRegistrationRequest.count({
                where: {
                    ...registrationRequestWhere,
                    status: client_1.RegistrationRequestStatus.Pending,
                },
            }),
            this.prisma.mawkibRegistrationRequest.count({
                where: {
                    ...registrationRequestWhere,
                    status: client_1.RegistrationRequestStatus.Rejected,
                },
            }),
        ]);
        const statusCount = new Map(statusGroups.map((row) => [row.status, row._count._all]));
        const today = (0, date_util_1.startOfAppDay)();
        const todayDate = (0, date_util_1.formatDateOnlyInAppTz)(new Date());
        const capacitySources = mawkibs.map((m) => ({
            id: m.id,
            maleCapacity: m.maleCapacity,
            femaleCapacity: m.femaleCapacity,
        }));
        const snapshots = await this.inventoryService.getSnapshotsForMawkibsOnDate(capacitySources, today);
        let todayMaleGuests = 0;
        let todayFemaleGuests = 0;
        const todayGuestByMawkib = mawkibs.map((mawkib) => {
            const snapshot = snapshots.get(mawkib.id);
            const maleGuests = snapshot
                ? Math.max(0, mawkib.maleCapacity - snapshot.availableMale)
                : 0;
            const femaleGuests = snapshot
                ? Math.max(0, mawkib.femaleCapacity - snapshot.availableFemale)
                : 0;
            todayMaleGuests += maleGuests;
            todayFemaleGuests += femaleGuests;
            return {
                mawkibId: mawkib.id,
                mawkibName: mawkib.name,
                maleGuests,
                femaleGuests,
                totalGuests: maleGuests + femaleGuests,
                maleCapacity: mawkib.maleCapacity,
                femaleCapacity: mawkib.femaleCapacity,
            };
        });
        todayGuestByMawkib.sort((a, b) => b.totalGuests - a.totalGuests);
        const countryMap = new Map();
        const cityMap = new Map();
        const countryLabels = {
            Iran: 'ایران',
            Iraq: 'عراق',
        };
        const cityLabels = {
            Mashhad: 'مشهد',
            Qom: 'قم',
            Najaf: 'نجف',
            Karbala: 'کربلا',
        };
        let totalMaleCapacity = 0;
        let totalFemaleCapacity = 0;
        let onlineReservationEnabledCount = 0;
        for (const mawkib of mawkibs) {
            totalMaleCapacity += mawkib.maleCapacity;
            totalFemaleCapacity += mawkib.femaleCapacity;
            if (mawkib.onlineReservationEnabled)
                onlineReservationEnabledCount += 1;
            const country = countryLabels[mawkib.country] ?? 'نامشخص';
            const city = mawkib.mawkibCity
                ? cityLabels[mawkib.mawkibCity]
                : 'نامشخص';
            countryMap.set(country, (countryMap.get(country) ?? 0) + 1);
            cityMap.set(city, (cityMap.get(city) ?? 0) + 1);
        }
        const toSortedItems = (map) => Array.from(map.entries())
            .map(([label, count]) => ({ label, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        const statusLabels = {
            Approved: 'تایید شده',
            Pending: 'در انتظار',
            Rejected: 'رد شده',
        };
        const approvedCount = statusCount.get(client_1.MawkibStatus.Approved) ?? 0;
        const pendingMawkibCount = statusCount.get(client_1.MawkibStatus.Pending) ?? 0;
        const rejectedMawkibCount = statusCount.get(client_1.MawkibStatus.Rejected) ?? 0;
        const pendingCount = pendingMawkibCount + pendingRegistrationRequests;
        const rejectedCount = rejectedMawkibCount + rejectedRegistrationRequests;
        const approvalScopeTotal = mawkibs.length + pendingRegistrationRequests + rejectedRegistrationRequests;
        return {
            scope: ownerUserId ? 'mine' : 'all',
            summary: {
                total: mawkibs.length,
                approvedCount,
                pendingCount,
                rejectedCount,
                pendingRegistrationRequestCount: pendingRegistrationRequests,
                rejectedRegistrationRequestCount: rejectedRegistrationRequests,
                totalMaleCapacity,
                totalFemaleCapacity,
                onlineReservationEnabledCount,
                todayMaleGuests,
                todayFemaleGuests,
                todayTotalGuests: todayMaleGuests + todayFemaleGuests,
            },
            statusBreakdown: ['Approved', 'Pending', 'Rejected'].map((status) => ({
                label: statusLabels[status],
                count: status === client_1.MawkibStatus.Approved
                    ? approvedCount
                    : status === client_1.MawkibStatus.Pending
                        ? pendingCount
                        : rejectedCount,
            })),
            approvalScopeTotal,
            byProvince: toSortedItems(countryMap),
            byCity: toSortedItems(cityMap),
            todayDate,
            todayGuestByMawkib,
        };
    }
    async getReservationsReport(user) {
        const ownerUserId = this.resolveOwnerScope(user);
        return (0, reservations_report_builder_1.buildReservationsReport)(this.prisma, this.inventoryService, ownerUserId);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mawkib_inventory_service_1.MawkibInventoryService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map