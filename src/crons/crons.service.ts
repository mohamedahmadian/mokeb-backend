import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { startOfAppDay } from '../common/utils/date.util';

export interface CronJobRunResult {
  jobId: string;
  jobName: string;
  updatedCount: number;
  ranAt: string;
}

export interface CronJobDefinition {
  id: string;
  name: string;
  description: string;
  schedule: string;
}

@Injectable()
export class CronsService {
  private readonly logger = new Logger(CronsService.name);

  constructor(private readonly prisma: PrismaService) {}

  listJobs(): CronJobDefinition[] {
    return [
      {
        id: 'auto-complete-expired-reservations',
        name: 'تکمیل خودکار رزروهای پایان‌یافته',
        description:
          'رزروهای تاییدشده‌ای که تاریخ پایان اقامتشان گذشته را بدون تغییر ظرفیت به وضعیت «تکمیل‌شده» منتقل می‌کند.',
        schedule: 'هر شب ساعت ۰۱:۰۰ (Asia/Tehran)',
      },
    ];
  }

  /** Confirmed reservations whose stay end date is before today → Completed (no inventory change). */
  async autoCompleteExpiredReservations(): Promise<CronJobRunResult> {
    const today = startOfAppDay();
    const result = await this.prisma.reservation.updateMany({
      where: {
        status: ReservationStatus.Confirmed,
        reservationEndDate: { lt: today },
      },
      data: {
        status: ReservationStatus.Completed,
        lastStatusUpdatedAt: new Date(),
      },
    });

    this.logger.log(
      `Auto-completed ${result.count} expired confirmed reservation(s)`,
    );

    return {
      jobId: 'auto-complete-expired-reservations',
      jobName: 'تکمیل خودکار رزروهای پایان‌یافته',
      updatedCount: result.count,
      ranAt: new Date().toISOString(),
    };
  }

  async runJob(jobId: string): Promise<CronJobRunResult> {
    switch (jobId) {
      case 'auto-complete-expired-reservations':
        return this.autoCompleteExpiredReservations();
      default:
        throw new BadRequestException(`وظیفه زمان‌بندی نامعتبر: ${jobId}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM, { timeZone: 'Asia/Tehran' })
  async handleAutoCompleteExpiredReservationsCron() {
    try {
      await this.autoCompleteExpiredReservations();
    } catch (error) {
      this.logger.error('Nightly auto-complete reservations job failed', error);
    }
  }
}
