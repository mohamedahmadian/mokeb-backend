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
var CronsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const date_util_1 = require("../common/utils/date.util");
let CronsService = CronsService_1 = class CronsService {
    prisma;
    logger = new common_1.Logger(CronsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    listJobs() {
        return [
            {
                id: 'auto-complete-expired-reservations',
                name: 'تکمیل خودکار رزروهای پایان‌یافته',
                description: 'رزروهای تاییدشده‌ای که تاریخ پایان اقامتشان گذشته را بدون تغییر ظرفیت به وضعیت «تکمیل‌شده» منتقل می‌کند.',
                schedule: 'هر شب ساعت ۰۱:۰۰ (Asia/Tehran)',
            },
        ];
    }
    async autoCompleteExpiredReservations() {
        const today = (0, date_util_1.startOfAppDay)();
        const result = await this.prisma.reservation.updateMany({
            where: {
                status: client_1.ReservationStatus.Confirmed,
                reservationEndDate: { lt: today },
            },
            data: {
                status: client_1.ReservationStatus.Completed,
                lastStatusUpdatedAt: new Date(),
            },
        });
        this.logger.log(`Auto-completed ${result.count} expired confirmed reservation(s)`);
        return {
            jobId: 'auto-complete-expired-reservations',
            jobName: 'تکمیل خودکار رزروهای پایان‌یافته',
            updatedCount: result.count,
            ranAt: new Date().toISOString(),
        };
    }
    async runJob(jobId) {
        switch (jobId) {
            case 'auto-complete-expired-reservations':
                return this.autoCompleteExpiredReservations();
            default:
                throw new common_1.BadRequestException(`وظیفه زمان‌بندی نامعتبر: ${jobId}`);
        }
    }
    async handleAutoCompleteExpiredReservationsCron() {
        try {
            await this.autoCompleteExpiredReservations();
        }
        catch (error) {
            this.logger.error('Nightly auto-complete reservations job failed', error);
        }
    }
};
exports.CronsService = CronsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_1AM, { timeZone: 'Asia/Tehran' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronsService.prototype, "handleAutoCompleteExpiredReservationsCron", null);
exports.CronsService = CronsService = CronsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CronsService);
//# sourceMappingURL=crons.service.js.map