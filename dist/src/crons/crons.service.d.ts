import { PrismaService } from '../prisma/prisma.service';
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
export declare class CronsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    listJobs(): CronJobDefinition[];
    autoCompleteExpiredReservations(): Promise<CronJobRunResult>;
    runJob(jobId: string): Promise<CronJobRunResult>;
    handleAutoCompleteExpiredReservationsCron(): Promise<void>;
}
